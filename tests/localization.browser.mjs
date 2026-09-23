import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const snapshot=JSON.parse(fs.readFileSync('dist/site-content.json','utf8'));
const dictionary=JSON.parse(fs.readFileSync('lib/translations.json','utf8'));
for(const [source,values] of Object.entries(dictionary))assert(values.length===3&&values.every(value=>typeof value==='string'&&value.trim()),'Incomplete translations: '+source);
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
let formMode='success',formRequests=0;
await page.route('**/functions/v1/studio-api/**',route=>{
 const url=route.request().url();
 if(url.endsWith('/content'))return route.fulfill({json:snapshot});
 if(url.endsWith('/contact')){formRequests++;return route.fulfill(formMode==='success'?{json:{received:true,reference:'test1234'}}:{status:429,json:{error:'Please wait a few minutes before trying again.'}});}
 return route.fulfill({json:{}});
});
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5173';
const translated=(source,code)=>code==='en'?source:dictionary[source][{az:0,ru:1,tr:2}[code]];
const names={en:'English',az:'Azərbaycan',ru:'Русский',tr:'Türkçe'};
async function go(path){await page.goto(origin+path);await page.locator('.language-trigger').waitFor();}
async function choose(code){await page.locator('.language-trigger').click();await page.getByRole('menuitem',{name:names[code],exact:true}).click();await page.waitForFunction(code=>document.documentElement.lang===code,code);}
function assertLayout(){return page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,path:location.pathname,language:document.documentElement.lang})).then(size=>assert(size.scroll<=size.width+1,'Horizontal overflow '+JSON.stringify(size)));}
await go('/');
assert.equal(await page.locator('.language-trigger').innerText(),'EN');
await page.locator('.language-trigger').focus();await page.keyboard.press('Enter');assert(await page.getByRole('menuitem',{name:'Русский',exact:true}).isVisible());await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelector('.language-trigger')===document.activeElement);
const routes=['/','/animation/','/about/','/services/','/projects/','/projects/skyline-residences/','/collections/outdoor-systems/','/blog/','/blog/ai-from-prompt-to-direction/','/contact/'];
for(const code of (process.env.MOBILE_ONLY?[]:['az','ru','tr','en'])){
 await go('/');await choose(code);
 assert((await page.locator('h1').innerText()).includes(translated('Imagined with purpose.',code)));
 await page.reload();await page.locator('.language-trigger').waitFor();
 assert.equal(await page.locator('.language-trigger').innerText(),code.toUpperCase());
 for(const path of routes){
  await go(path);assert.equal(await page.locator('html').getAttribute('lang'),code);await assertLayout();
  if(path==='/projects/skyline-residences/')assert((await page.locator('.project-heading').innerText()).includes(translated(snapshot.data.projects[0].description,code)));
  if(path==='/blog/ai-from-prompt-to-direction/'){const post=snapshot.data.journal.find(p=>p.slug==='ai-from-prompt-to-direction');assert.equal(await page.locator('.article-body>p').first().innerText(),translated(post.body.split(/\n\s*\n/)[0],code));}
  if(path==='/animation/')assert.equal(await page.locator('h1').innerText(),translated('Architecture in motion.',code));
 }
 console.log('PASS language routes: '+code);
}
for(const width of [360,390,768]){
 await page.setViewportSize({width,height:844});
 for(const code of ['az','ru','tr','en']){
  await go('/');await choose(code);await assertLayout();
  const box=await page.locator('.language-trigger').boundingBox();assert(box.width>=40&&box.height>=40);
  const card=await page.locator('.reel-card').first().boundingBox();assert(Math.abs(card.width/card.height-.8)<.01);
  const start=await page.locator('.reel-track').evaluate(el=>el.style.transform);await page.waitForTimeout(200);const end=await page.locator('.reel-track').evaluate(el=>el.style.transform);assert.notEqual(start,end,'Reel must continue moving');
  await page.locator('.mobile-toggle').click();await page.locator('.mobile-sheet nav a[href="/animation/"]').click();await page.waitForURL('**/animation/');await page.locator('.motion-card').first().waitFor();await assertLayout();
  assert.equal(await page.locator('.motion-card').count(),4);
 }
 console.log('PASS mobile width: '+width);
}
await page.setViewportSize({width:390,height:844});await go('/');await choose('az');
await page.screenshot({path:'outputs/animation-preview/mobile-language-az.png'});
await page.locator('.language-trigger').click();await page.screenshot({path:'outputs/animation-preview/mobile-language-menu.png'});await page.keyboard.press('Escape');
await page.locator('#animations').scrollIntoViewIfNeeded();
await page.waitForFunction(()=>[...document.querySelectorAll('.animation-banner video')].some(v=>!v.paused&&v.currentTime>.5));
assert.equal(await page.locator('.more-animation-link').innerText(),translated('More animation','az'));
await page.locator('.more-animation-link').click();await page.waitForURL('**/animation/');await page.locator('.motion-card').first().waitFor();
await go('/contact/');
async function fill(){await page.locator('[name="name"]').fill('Preview test');await page.locator('[name="email"]').fill('preview@example.test');await page.locator('[name="projectType"]').fill('Preview only');await page.locator('[name="message"]').fill('Local intercepted form verification');}
await fill();await page.locator('.inquiry-form button[type="submit"],.inquiry-form .dark-button').click();await page.locator('.form-success').waitFor();assert((await page.locator('.form-success').innerText()).includes(translated('Thank you. Your project brief has been received.','az')));
formMode='error';await fill();await page.locator('.inquiry-form .dark-button').click();await page.locator('.inquiry-form [role="alert"]').waitFor();assert.equal(await page.locator('.inquiry-form [role="alert"]').innerText(),translated('Please wait a few minutes before trying again.','az'));assert.equal(formRequests,2);
await page.setViewportSize({width:1440,height:1000});await go('/');await choose('en');
await page.locator('.language-trigger').click();await page.screenshot({path:'outputs/animation-preview/desktop-language-menu.png'});await page.keyboard.press('Escape');
await choose('ru');await page.screenshot({path:'outputs/animation-preview/desktop-language-ru.png'});
assert.deepEqual(errors,[]);
console.log('PASS: persistence, keyboard menu, four languages, ten routes, mobile layouts, reel motion, video playback, form responses; no browser errors. All form requests intercepted locally.');
await browser.close();
