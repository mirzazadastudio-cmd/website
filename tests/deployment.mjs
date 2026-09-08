import fs from 'node:fs';
import assert from 'node:assert/strict';
const snapshot=JSON.parse(fs.readFileSync('dist/site-content.json','utf8'));
assert(snapshot.data.projects.length>0);
assert(snapshot.data.projects.every(p=>p.status==='published'||!p.status));
assert(snapshot.data.journal.every(p=>p.published));
assert(snapshot.data.testimonials.every(p=>p.published&&!p.sample));
for(const route of ['','about','services','projects','blog','contact','admin',...snapshot.data.projects.map(p=>'projects/'+p.slug),...snapshot.data.collections.map(p=>'collections/'+p.slug),...snapshot.data.journal.map(p=>'blog/'+p.slug)]){
 const html=fs.readFileSync('dist/'+(route?route+'/':'')+'index.html','utf8');assert(html.includes('<h1')||html.includes('Mirzazada'));assert(html.includes('rel="canonical"'));assert(!html.includes('<!--app-->'));
}
const imagePaths=new Set(JSON.stringify(snapshot).match(/\/images\/[a-zA-Z0-9._-]+/g));
for(const image of imagePaths)assert(fs.existsSync('dist'+image),'Missing '+image);
for(const name of fs.readdirSync('dist/assets'))if(name.endsWith('.js')){
 const code=fs.readFileSync('dist/assets/'+name,'utf8');
 assert(!/SUPABASE_SERVICE_ROLE_KEY|studio_claim_setup|password_hash|ADMIN_OWNER_EMAIL/.test(code),'Private server implementation bundled');
}
assert.equal(fs.readFileSync('dist/CNAME','utf8').trim(),'mirzazadastudio.com');
console.log('All public routes, '+imagePaths.size+' referenced images, published-only fallback and client credential checks passed.');
