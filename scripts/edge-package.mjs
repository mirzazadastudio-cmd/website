import fs from 'node:fs';
import path from 'node:path';
const target='supabase/functions/studio-api/shared';
fs.mkdirSync(target,{recursive:true});
const seen=new Set();
function copy(name){
 if(seen.has(name))return;seen.add(name);
 let content=fs.readFileSync('lib/'+name,'utf8');
 if(name.endsWith('.ts'))content=content.replace(/from\s+(['"])(\.\/[^'"]+|@\/lib\/[^'"]+)\1/g,(match,quote,spec)=>{
  const relative=spec.replace(/^@\/lib\//,'./');
  const child=relative.slice(2)+(path.extname(relative)?'':'.ts');
  copy(child);return "from './"+child+"'"+(child.endsWith('.json')?" with {type:'json'}":'');
 });
 fs.writeFileSync(path.join(target,name),content);
}
for(const name of ['content-validation.ts','editorial-validation.ts','image-info.ts'])copy(name);
const files=[{name:'index.ts',content:fs.readFileSync('supabase/functions/studio-api/index.ts','utf8')},...Array.from(seen).map(name=>({name:'shared/'+name,content:fs.readFileSync(path.join(target,name),'utf8')}))];
fs.writeFileSync('.prerender/edge-files.json',JSON.stringify(files));
console.log('Prepared '+files.length+' Edge Function modules.');
