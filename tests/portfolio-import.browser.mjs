import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const origin='http://127.0.0.1:5173';
try{
 await page.goto(origin+'/');
 await page.locator('.reel-card').first().waitFor();
 assert.equal(await page.locator('.reel-card').first().getAttribute('href'),'/projects/hotel-project');
 await page.getByRole('button',{name:'Pause project animation',exact:true}).click();
 await page.screenshot({path:'outputs/animation-preview/september-home-desktop.png'});
 for(const [slug,count] of [['hotel-project',5],['seaside-hotel-building',5],['restoration-building-3',5],['san-francisco-rooftop',2]]){
  await page.goto(origin+'/projects/'+slug+'/');
  await page.locator('main h1').waitFor();
  assert(!/not found/i.test(await page.locator('main h1').innerText()));
  const image=page.locator('main img').first();await image.waitFor();
  await image.evaluate(im=>im.decode());
  assert(await image.evaluate(im=>im.naturalWidth>0));
  console.log('PASS project',slug,count,'source images');
 }
 await page.goto(origin+'/animation/');
 const card=page.locator('.motion-card').filter({has:page.getByRole('heading',{name:'Xankəndi',exact:true})});
 await card.getByRole('button',{name:'Play Xankəndi',exact:true}).click();
 const video=card.locator('video');
 await page.waitForFunction(()=>{const v=document.querySelector('.motion-card video');return v?.currentTime>.2;});
 const state=await video.evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,playing:!v.paused}));
 assert.equal(state.duration,15);assert.equal(state.width,1920);assert.equal(state.height,1080);assert(state.playing);
 console.log('PASS video',state);
 await page.screenshot({path:'outputs/animation-preview/september-animation-desktop.png'});
 await page.goto(origin+'/');await page.locator('#animations').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>{const v=document.querySelector('#animations video');return v?.currentTime>.5;});
 assert((await page.locator('#animations video').first().getAttribute('src')).endsWith('/xankendi.mp4'));
 // Near the final half second, both layers must contribute to the dissolve.
 await page.locator('#animations video').first().evaluate(v=>{v.currentTime=14.55;});
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('#animations video')).every(v=>Number(v.style.opacity)>.03&&Number(v.style.opacity)<.98),{},{polling:'raf',timeout:5000});
 console.log('PASS 0.5 second crossfade from 15 second Xankəndi film');
 await page.waitForFunction(()=>{const videos=Array.from(document.querySelectorAll('#animations video'));return videos[1]?.currentTime>.6&&Number(videos[1].style.opacity)===1;});
 for(const width of [390,768]){
  await page.setViewportSize({width,height:844});
  await page.goto(origin+'/');await page.locator('.reel-card').first().waitFor();
  assert.equal(await page.locator('.reel-card').first().getAttribute('href'),'/projects/hotel-project');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.getByRole('button',{name:'Pause project animation',exact:true}).click();
  await page.screenshot({path:'outputs/animation-preview/september-home-'+width+'.png'});
  await page.goto(origin+'/projects/hotel-project/');await page.locator('main h1').waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  console.log('PASS mobile width',width);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
