import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {validateContent,publicContent} from '../.content-check/content-features.js';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}});
let record=JSON.parse(fs.readFileSync('dist/site-content.json','utf8')),writes=0,supported=true;
record.data=validateContent(record.data);
const project=record.data.projects[0],projectKey='project:'+project.id+':description',post=record.data.journal[0],errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.route('**/functions/v1/studio-api/**',async route=>{
 const request=route.request(),url=request.url();
 if(url.endsWith('/admin/auth'))return route.fulfill({json:{authenticated:true,supportsPortfolioImports:true,configured:true,owner:false,supportsLocalizedContent:supported,username:'preview@example.test'}});
 if(url.endsWith('/admin/content')){
  if(request.method()==='PUT'){const input=request.postDataJSON();assert.equal(input.revision,record.revision);record={revision:record.revision+1,data:validateContent(input.data)};writes++;}
  return route.fulfill({json:record});
 }
 if(url.endsWith('/content'))return route.fulfill({json:{...record,data:publicContent(record.data)}});
 return route.fulfill({json:{}});
});
const origin='http://127.0.0.1:5173';
async function admin(){await page.goto(origin+'/admin/');await page.getByRole('tab',{name:'Dillər və mətnlər',exact:true}).click();}
async function controls(group,locale,search=''){await page.getByRole('combobox',{name:'Mətn bölməsi',exact:true}).selectOption(group);await page.getByRole('combobox',{name:'Redaktə dili',exact:true}).selectOption(locale);await page.getByPlaceholder('Başlıq, layihə adı və ya mətn').fill(search);}
const row=key=>page.locator('[data-text-key]').filter({has:page.locator('textarea')}).locator('xpath=self::*[@data-text-key='+JSON.stringify(key)+']');
async function fill(key,value){const target=page.locator('[data-text-key]').filter({has:page.locator('textarea')});const selected=target.locator('xpath=self::*[@data-text-key='+JSON.stringify(key)+']');assert.equal(await selected.count(),1,'Find row '+key);await selected.locator('textarea').fill(value);}
async function save(){await page.getByRole('button',{name:'Dəyişiklikləri saxla',exact:true}).click();await page.getByText('Dəyişikliklər saxlanıldı. Saytı yeniləyəndə yeni məzmun görünəcək.',{exact:true}).waitFor();await page.getByRole('button',{name:'Yadda saxlanıb ✓',exact:true}).waitFor();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function locale(code){await page.evaluate(code=>localStorage.setItem('mirzazada:language',code),code);}
await admin();await controls('Ana səhifə','az');
await fill('settings:tagline:0','Məqsədli məkanlar.');await controls('Ana səhifə','ru');await fill('settings:tagline:0','Пространства со смыслом.');await controls('Ana səhifə','tr');await fill('settings:tagline:0','Anlamlı mekânlar.');
await controls('İnterfeys','az','More animation');await fill('ui:More animation','Bütün animasiyalar');
await controls('İnterfeys','en',"Let's talk");await fill("ui:Let's talk",'Discuss your project');
await controls('Layihələr','az',project.title+' / Təsvir');await fill(projectKey,'Admin paneldən xüsusi təsvir. <b>Bu, adi mətndir.</b>');
await controls('Haqqımda','az','Bioqrafiya');await fill('profile:biography','Birinci xüsusi abzas.\n\nİkinci xüsusi abzas.');
await controls('Blog','az',post.title+' / Tam mətn');await fill('post:'+post.slug+':body','Yeni bloq abzası.\n\nİkinci bloq abzası.');
await controls('Animation','az','Showroom perspectives / Ad');await fill('video:showroom:title','Yeni video başlığı');
await save();assert.equal(writes,1);
await admin();await controls('Ana səhifə','az');assert.equal(await row('settings:tagline:0').locator('textarea').inputValue(),'Məqsədli məkanlar.');
await controls('Ana səhifə','en');await fill('settings:tagline:0','New English headline.');
await controls('Ana səhifə','az');assert((await row('settings:tagline:0').innerText()).includes('İngiliscə mətn dəyişib'));
await save();assert.equal(record.data.settings.tagline[0],'New English headline.');assert.equal(record.data.texts.fields['settings:tagline:0'].ru.text,'Пространства со смыслом.');
for(const [code,title]of [['az','Məqsədli məkanlar.'],['ru','Пространства со смыслом.'],['tr','Anlamlı mekânlar.'],['en','New English headline.']]){await locale(code);await page.goto(origin+'/');await page.locator('.language-trigger').waitFor();assert((await page.locator('h1').innerText()).includes(title));if(code==='az')assert.equal(await page.locator('.more-animation-link').innerText(),'Bütün animasiyalar');if(code==='en')assert.equal(await page.locator('.header-cta').innerText(),'Discuss your project');}
await locale('az');await page.goto(origin+'/projects/'+project.slug+'/');await page.locator('.project-heading').waitFor();assert((await page.locator('.project-heading').innerText()).includes('<b>Bu, adi mətndir.</b>'));assert.equal(await page.locator('.project-heading b').count(),0);
await page.goto(origin+'/about/');await page.locator('.about-story').waitFor();assert.equal(await page.locator('.about-story .prose p').first().innerText(),'Birinci xüsusi abzas.');
await page.goto(origin+'/blog/'+post.slug+'/');await page.locator('.article-body').waitFor();assert.equal(await page.locator('.article-body p').first().innerText(),'Yeni bloq abzası.');
await page.goto(origin+'/animation/');await page.locator('.motion-card').first().waitFor();assert.equal(await page.getByRole('heading',{name:'Yeni video başlığı',exact:true}).count(),1);
await admin();await controls('Ana səhifə','az');await page.screenshot({path:'outputs/animation-preview/admin-languages-desktop.png'});
await page.setViewportSize({width:390,height:844});await page.locator('.admin-language-editor').scrollIntoViewIfNeeded();await page.screenshot({path:'outputs/animation-preview/admin-languages-mobile.png'});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Admin mobile overflow');
await row('settings:tagline:0').getByRole('button',{name:'Hazır mətnə qaytar'}).click();await save();assert(!record.data.texts.fields['settings:tagline:0'].az);assert(record.data.texts.fields['settings:tagline:0'].ru);
supported=false;await admin();await controls('Ana səhifə','tr');await fill('settings:tagline:0','New local draft');const before=writes;await page.getByRole('button',{name:'Dəyişiklikləri saxla',exact:true}).click();await page.getByRole('alert').filter({hasText:'server versiyası'}).waitFor();assert.equal(writes,before,'Old server must not discard translations');
assert.deepEqual(errors,[]);console.log('PASS: real validation in mocked save/reload, EN/AZ/RU/TR fields, edited UI, source-change notices, per-language reset, literal-safe rendering, articles, video titles, mobile layout and old-server protection. No production writes.');
await browser.close();
