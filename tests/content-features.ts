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
