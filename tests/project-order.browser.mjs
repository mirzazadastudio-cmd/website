import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {validateContent,publicContent} from '../.content-check/content-features.js';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
let record=JSON.parse(fs.readFileSync('dist/site-content.json','utf8')),writes=0;
const initial=[...record.data.settings.homepage.projectOrder],errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/functions/v1/studio-api/**',async route=>{
 const url=route.request().url();
 if(url.endsWith('/admin/auth'))return route.fulfill({json:{authenticated:true,configured:true,supportsPortfolioImports:true,supportsLocalizedContent:true}});
 if(url.endsWith('/admin/content')){
  if(route.request().method()==='PUT'){const body=route.request().postDataJSON();assert.equal(body.revision,record.revision);record={data:{...validateContent(body.data),media:record.data.media},revision:record.revision+1};writes++;}
  return route.fulfill({json:record});
 }
 if(url.endsWith('/content'))return route.fulfill({json:{...record,data:publicContent(record.data)}});
 return route.fulfill({json:{items:[]}});
});
const origin='http://127.0.0.1:5173';
const order=()=>page.locator('[data-home-project]').evaluateAll(rows=>rows.map(r=>r.dataset.homeProject));
async function admin(){await page.goto(origin+'/admin/');await page.getByRole('tab',{name:'Ana səhifə',exact:true}).click();await page.locator('.admin-slideshow-order').scrollIntoViewIfNeeded();}
async function save(){await page.getByRole('button',{name:'Dəyişiklikləri saxla',exact:true}).click();await page.getByRole('button',{name:'Yadda saxlanıb ✓',exact:true}).waitFor();}
async function drag(from,to,cancel=false){
 const source=page.locator('[data-home-project]').nth(from).locator('.home-order-title');
 const destination=page.locator('[data-home-project]').nth(to);
 await source.scrollIntoViewIfNeeded();
 const a=await source.boundingBox(),b=await destination.boundingBox();
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:12});
 assert(await destination.evaluate(el=>el.classList.contains('is-drop-target')));
 if(cancel)await page.keyboard.press('Escape');
 await page.mouse.up();
}
try{
 await admin();
 await drag(2,0);const expected=[initial[2],initial[0],initial[1],...initial.slice(3)];assert.deepEqual(await order(),expected);
 await drag(0,2);assert.deepEqual(await order(),initial);
 await drag(2,0,true);assert.deepEqual(await order(),initial);
 const second=page.locator('[data-home-project]').nth(1).locator('[data-home-grip]');
 await second.focus();await page.keyboard.press('ArrowUp');assert.equal((await order())[0],initial[1]);
 await page.screenshot({path:'outputs/animation-preview/slideshow-order-desktop.png'});
 await save();assert.equal(writes,1);await admin();assert.equal((await order())[0],initial[1]);
 await page.goto(origin+'/');await page.locator('.reel-card').first().waitFor();assert.equal(await page.locator('.reel-card').first().getAttribute('href'),'/projects/'+initial[1]);
 await page.setViewportSize({width:390,height:844});await admin();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:'outputs/animation-preview/slideshow-order-mobile.png'});
 // Touch pointer drag uses the grip, leaving vertical scrolling available elsewhere.
 const rows=page.locator('[data-home-project]');await rows.first().scrollIntoViewIfNeeded();
 const touchFrom=rows.nth(1).locator('[data-home-grip]'),a=await touchFrom.boundingBox(),b=await rows.first().boundingBox();
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+18,y:a.y+18}]});
 for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+18,y:a.y+18+(b.y+b.height/2-a.y-18)*i/8}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.equal((await order())[0],initial[0]);await save();assert.equal(writes,2);
 assert.deepEqual(record.data.projects.map(p=>p.slug),JSON.parse(fs.readFileSync('dist/site-content.json','utf8')).data.projects.map(p=>p.slug),'Only slideshow order changes');
 assert.deepEqual(errors,[]);
 console.log('PASS: whole-row mouse drag both directions, highlighted target, Escape, keyboard, touch, save/reload, public reel order and mobile layout. No production writes.');
}finally{await browser.close();}
