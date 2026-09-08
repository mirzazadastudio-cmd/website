import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
const base='http://localhost:3000',owner={cookie:'__sites_local_auth=1',origin:base};
async function content(){const response=await fetch(base+'/api/admin/content',{headers:owner});assert.equal(response.status,200);return await response.json()}
async function save(record){const response=await fetch(base+'/api/admin/content',{method:'PUT',headers:{...owner,'Content-Type':'application/json'},body:JSON.stringify(record)});const result=await response.json();assert.equal(response.status,200,JSON.stringify(result));return result}
const original=await content();assert.equal(original.data.catalogVersion,4);assert.equal(original.data.projects.length,31);
const originalBytes=await readFile('tests/fixtures/private-test-original.png'),variant=await readFile('tests/fixtures/private-test-variant.webp');
const multipart=()=>{const form=new FormData();form.append('original',new Blob([originalBytes],{type:'image/png'}),'private-test-original.png');form.append('variants',new Blob([variant],{type:'image/webp'}),'render.webp');return form};
assert.equal((await fetch(base+'/api/admin/upload',{method:'POST',headers:{origin:base},body:multipart()})).status,401);
const upload=await fetch(base+'/api/admin/upload',{method:'POST',headers:owner,body:multipart()});const uploaded=await upload.json();assert.equal(upload.status,200,JSON.stringify(uploaded));
const id=randomUUID(),slug='acceptance-'+id.slice(0,8),secret='PRIVATE_DRAFT_'+id;
const privateUrl='/api/admin/assets/'+uploaded.asset.id;
assert.equal((await fetch(base+privateUrl)).status,401);
const download=await fetch(base+privateUrl,{headers:owner});assert.equal(download.status,200);assert.equal(download.headers.get('cache-control'),'private,no-store');assert.equal(createHash('sha256').update(Buffer.from(await download.arrayBuffer())).digest('hex'),createHash('sha256').update(originalBytes).digest('hex'));
assert.equal((await fetch(base+uploaded.url)).status,404);
const duplicate=await (await fetch(base+'/api/admin/upload',{method:'POST',headers:owner,body:multipart()})).json();assert.equal(duplicate.duplicate,true);assert.equal(duplicate.asset.id,uploaded.asset.id);
const project={...structuredClone(original.data.projects[0]),id,slug,title:'Acceptance test project',description:secret,status:'draft',displayPermission:'confirmed',images:[uploaded.url],coverImage:uploaded.url,heroImage:uploaded.url,blocks:[{id:randomUUID(),type:'image',layout:'contained',images:[{src:uploaded.url,alt:'Private acceptance render',caption:'Test caption',credit:'',frame:{x:30,y:65,zoom:1.1}}],text:'',level:'h2',url:'',poster:'',spacing:'medium',createdAt:'',updatedAt:''},{id:randomUUID(),type:'text',layout:'contained',images:[],text:'A project text block.',level:'h2',url:'',poster:'',spacing:'medium',createdAt:'',updatedAt:''}]};
let testAdded=false;
try{
 const initial=await content();initial.data.projects.push(project);await save(initial);testAdded=true;
 for(const path of ['/','/projects','/sitemap.xml']){const html=await (await fetch(base+path)).text();assert.ok(!html.includes(secret),path+' leaked draft');assert.ok(!html.includes('/projects/'+slug),path+' listed draft');}
 assert.equal((await fetch(base+'/projects/'+slug)).status,404);assert.equal((await fetch(base+'/admin/preview/'+id)).status,404);assert.equal((await fetch(base+'/admin/preview/'+id,{headers:owner})).status,200);
 const unapproved=await content();Object.assign(unapproved.data.projects.find(p=>p.id===id),{status:'published',displayPermission:'unreviewed'});assert.equal((await fetch(base+'/api/admin/content',{method:'PUT',headers:{...owner,'Content-Type':'application/json'},body:JSON.stringify(unapproved)})).status,400);
 const publishing=await content();publishing.data.projects.find(p=>p.id===id).status='published';await save(publishing);
 const page=await fetch(base+'/projects/'+slug);assert.equal(page.status,200);const html=await page.text();assert.ok(html.includes('Test caption'));assert.ok(html.includes('A project text block.'));assert.equal((await fetch(base+uploaded.url)).status,200);assert.ok((await (await fetch(base+'/sitemap.xml')).text()).includes('/projects/'+slug));
 const renamed=await content();renamed.data.projects.find(p=>p.id===id).slug=slug+'-renamed';await save(renamed);
 const redirect=await fetch(base+'/projects/'+slug,{redirect:'manual'});assert.equal(redirect.status,308);assert.ok(redirect.headers.get('location').endsWith(slug+'-renamed'));
 const archived=await content();archived.data.projects.find(p=>p.id===id).status='archived';await save(archived);assert.equal((await fetch(base+'/projects/'+slug+'-renamed')).status,404);assert.equal((await fetch(base+uploaded.url)).status,404);
 const restore=await content();restore.data.projects.find(p=>p.id===id).status='draft';await save(restore);assert.equal((await fetch(base+'/admin/preview/'+id,{headers:owner})).status,200);
 const backup=await fetch(base+'/api/admin/backup',{headers:owner});assert.equal(backup.status,200);assert.equal((await backup.json()).format,'mirzazada-studio-backup-v1');assert.equal((await fetch(base+'/api/admin/backup')).status,401);
 const versions=await (await fetch(base+'/api/admin/backup?revision=list',{headers:owner})).json();assert.ok(versions.items.length>=4);
 console.log('PASS: private originals and exact hash, duplicate detection, drafts excluded, private preview, block content/captions, publish, old-slug redirect, archive/restore, and automatic revision backups.');
}finally{
 if(testAdded){const latest=await content();latest.data.projects=latest.data.projects.filter(p=>p.id!==id);for(const [key,value] of Object.entries(latest.data.projectRedirects||{}))if(value===id)delete latest.data.projectRedirects[key];await save(latest);}
}
for(const path of ['/projects','/services','/contact','/about','/robots.txt','/sitemap.xml'])assert.equal((await fetch(base+path)).status,200,path);
const testId=randomUUID();const inquiry={id:testId,name:'Local acceptance test',email:'test@example.com',company:'Verification',projectType:'Architecture',deadline:'Test only',message:'Automated local verification. No email should be sent.',website:'',attribution:{utm_source:'acceptance-test'}};
assert.equal((await fetch(base+'/api/contact',{method:'POST',headers:{origin:'https://untrusted.example','Content-Type':'application/json'},body:JSON.stringify(inquiry)})).status,403);
assert.equal((await fetch(base+'/api/contact',{method:'POST',headers:{origin:base,'Content-Type':'application/json'},body:JSON.stringify({...inquiry,email:'bad-address'})})).status,400);
const submitted=await fetch(base+'/api/contact',{method:'POST',headers:{origin:base,'Content-Type':'application/json'},body:JSON.stringify(inquiry)});assert.equal(submitted.status,201);const inbox=await (await fetch(base+'/api/admin/inquiries',{headers:owner})).json();assert.ok(inbox.items.some(row=>row.id===testId&&row.attribution.includes('acceptance-test')));assert.equal((await fetch(base+'/api/admin/inquiries')).status,401);
console.log('PASS: public routes, validated inquiry persistence, UTM attribution, CSRF rejection, and private inquiry inbox. Test inquiry ID:',testId);
