import fs from 'node:fs';
import assert from 'node:assert/strict';
import {validateContent} from '../lib/content-validation';
import {publicContent} from '../lib/editorial-validation';
const {data}=JSON.parse(fs.readFileSync('dist/site-content.json','utf8'));
const edited=structuredClone(data);edited.projects[0].category='AI';edited.projects[0].categories=['AI'];
// Changing a featured project's category also requires clearing that selection.
for(const collection of edited.collections)if(collection.featuredProject===edited.projects[0].slug)collection.featuredProject='';
const saved=validateContent(edited);
assert.equal(saved.projects[0].category,'AI');
assert.equal(publicContent(saved).projects[0].category,'AI');
const legacy=structuredClone(data);legacy.collections=legacy.collections.filter((c:{category:string})=>c.category!=='AI');
assert(validateContent(legacy).collections.some(c=>c.category==='AI'));
const invalid=structuredClone(edited);invalid.projects[0].category='Unsupported category';
assert.throws(()=>validateContent(invalid));
console.log('AI projects are accepted; older collection data upgrades; unsupported categories rejected.');


// Video playlists survive validation/public filtering, including an intentionally empty list.
const {defaultAnimationVideos,FADE_SECONDS,validateAnimations}=await import('../lib/animation-playlist');
assert.equal(FADE_SECONDS,.5);
const videoData=structuredClone(data);delete videoData.animations;
assert.deepEqual(validateContent(videoData).animations,defaultAnimationVideos);
videoData.animations=[...defaultAnimationVideos].reverse();
assert.deepEqual(publicContent(validateContent(videoData)).animations,videoData.animations);
videoData.animations=[];
assert.deepEqual(publicContent(validateContent(videoData)).animations,[]);
assert.throws(()=>validateAnimations([{...defaultAnimationVideos[0],src:'https://invalid.test/a.mp4'}]));
assert.throws(()=>validateAnimations([{...defaultAnimationVideos[0],duration:NaN}]));
assert.throws(()=>validateAnimations([{...defaultAnimationVideos[0],duration:.4}]));
assert.throws(()=>validateAnimations([defaultAnimationVideos[0],defaultAnimationVideos[0]]));
assert.throws(()=>validateAnimations([{...defaultAnimationVideos[0],title:''}]));
assert.equal(validateAnimations([{...defaultAnimationVideos[0],src:'/videos/12345678-1234-1234-1234-123456789abc.webm',poster:'',duration:12.75}])[0].duration,12.75);
console.log('Video defaults, saved order, empty state, duration and source validation passed.');
