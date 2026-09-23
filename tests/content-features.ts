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

import {contentTextFields,reconcileSiteTexts} from '../lib/content-texts';
import {translatedField,translateText} from '../lib/text-translation';
export {validateContent,publicContent};
const multilingual=structuredClone(data);
const sourceKey='project:'+(multilingual.projects[0].id||'project-'+multilingual.projects[0].slug)+':description';
multilingual.texts={ui:{"Let's talk":{en:'Discuss a project',az:'Layihəni danışaq'}},fields:{
 [sourceKey]:{az:{source:multilingual.projects[0].description,text:'Xüsusi layihə təsviri'},ru:{source:multilingual.projects[0].description,text:'Особое описание'}},
 'profile:biography':{tr:{source:multilingual.profile.biography,text:'Birinci paragraf.\n\nİkinci paragraf.'}}
}};
const validTranslations=validateContent(multilingual);
assert.equal(validTranslations.texts?.fields[sourceKey]?.az?.text,'Xüsusi layihə təsviri');
assert.equal(translateText("Let's talk",'en',validTranslations.texts?.ui),'Discuss a project');
assert.equal(translateText('About our studio ↗','en',{'About our studio':{en:'Meet us'}}),'Meet us ↗');
assert.equal(translatedField('Changed English',sourceKey,'az',validTranslations.texts),'Xüsusi layihə təsviri');
const privateCopy=structuredClone(validTranslations);
privateCopy.projects[0].status='draft';
assert(!Object.hasOwn(publicContent(privateCopy).texts!.fields,sourceKey),'Draft translations and source copies must not leak');
assert(publicContent(privateCopy).texts!.fields['profile:biography'],'Public fields remain');
const invalidLanguage=structuredClone(multilingual);invalidLanguage.texts.ui["Let's talk"].xx='Invalid';assert.throws(()=>validateContent(invalidLanguage));
const invalidText=structuredClone(multilingual);invalidText.texts.fields[sourceKey].az.text={html:'invalid'};assert.throws(()=>validateContent(invalidText));
const oversized=structuredClone(multilingual);oversized.texts.fields[sourceKey].az.text='x'.repeat(5001);assert.throws(()=>validateContent(oversized));
const malicious=structuredClone(multilingual);malicious.texts.ui=JSON.parse('{"__proto__":{"en":"invalid"}}');assert.throws(()=>validateContent(malicious));
const removed=structuredClone(multilingual);removed.texts.fields['project:missing:description']={az:{source:'private removed content',text:'private'}};assert(!validateContent(removed).texts?.fields['project:missing:description']);
const countText=structuredClone(multilingual);countText.texts.ui['View all {count} projects']={az:'Bütün layihələr'};assert.throws(()=>validateContent(countText));
const renamed=structuredClone(multilingual),post=renamed.journal[0];renamed.texts.fields['post:'+post.slug+':title']={az:{source:post.title,text:'Xüsusi başlıq'}};const beforeRename=structuredClone(renamed);post.slug='renamed-note';reconcileSiteTexts(beforeRename,renamed);assert.equal(renamed.texts.fields['post:renamed-note:title'].az.text,'Xüsusi başlıq');
const defaultVideo=structuredClone(multilingual);delete defaultVideo.animations;contentTextFields(defaultVideo).find(field=>field.key==='video:showroom:title')!.set('Edited video title');assert.equal(defaultVideo.animations[0].title,'Edited video title');
console.log('Language validation, defaults, literal overrides, stable identities, draft privacy and English field edits passed.');


// September import is applied once and must not overwrite existing owner edits.
{
const {upgradeCatalog,CATALOG_VERSION}=await import('../lib/catalog-upgrade');
const {default:september}=await import('../lib/portfolio-september-2026.json');
const importedSlugs=september.projects.map(p=>p.slug);
const beforeImport=structuredClone(data);
beforeImport.catalogVersion=4;
beforeImport.projects=beforeImport.projects.filter(p=>!importedSlugs.includes(p.slug));
beforeImport.settings.homepage.projectOrder=beforeImport.settings.homepage.projectOrder.filter(slug=>!importedSlugs.includes(slug));
beforeImport.animations=defaultAnimationVideos.slice().reverse();
beforeImport.projects[0].description='Owner description kept during import';
const beforeCopy=structuredClone(beforeImport);
const imported=upgradeCatalog(beforeImport);
assert.deepEqual(beforeImport,beforeCopy,'Import must not mutate the fetched record');
assert.equal(imported.projects.length,beforeImport.projects.length+4);
assert.equal(imported.catalogVersion,CATALOG_VERSION);
assert.equal(imported.settings.homepage.projectOrder[0],'hotel-project');
assert.deepEqual(imported.settings.homepage.projectOrder.slice(4),beforeImport.settings.homepage.projectOrder);
assert.equal(imported.projects.find(p=>p.id===beforeImport.projects[0].id)?.description,'Owner description kept during import');
assert.equal(imported.animations?.[0].id,'xankendi');
assert.equal(imported.animations?.[0].duration,15);
assert.deepEqual(imported.animations?.slice(1),beforeImport.animations);
assert.equal(new Set(imported.projects.map(p=>p.id)).size,imported.projects.length);
assert.equal(validateContent(imported).projects.length,imported.projects.length);
assert.deepEqual(upgradeCatalog(imported),imported);
const removed=structuredClone(imported);
removed.projects=removed.projects.filter(p=>p.slug!=='hotel-project');
removed.settings.homepage.projectOrder=removed.settings.homepage.projectOrder.filter(slug=>slug!=='hotel-project').reverse();
removed.animations=[];
assert.deepEqual(upgradeCatalog(removed),removed,'Deleted projects and empty playlists must stay removed');
const renamed=structuredClone(beforeImport);
renamed.projects.push({...september.projects[0] as typeof data.projects[number],slug:'owner-hotel',title:'Owner hotel title'});
const merged=upgradeCatalog(renamed);
assert.equal(merged.projects.filter(p=>p.id==='project-hotel-project').length,1);
assert.equal(merged.settings.homepage.projectOrder[0],'owner-hotel');
assert.equal(merged.projects.find(p=>p.id==='project-hotel-project')?.title,'Owner hotel title');
for(const project of september.projects)for(const src of project.images){
 assert(fs.existsSync('public'+src),src);
 const info=imported.media?.[src];assert(info&&info.variants.length>=3);
 for(const variant of info.variants)assert(fs.existsSync('public'+variant.src),variant.src);
}
console.log('PASS: September import, preserved owner edits/order, responsive files, 15-second video, idempotence and saved removals.');

}
