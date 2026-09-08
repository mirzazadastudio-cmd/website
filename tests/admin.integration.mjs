import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
const base='http://localhost:3000',owner='__sites_local_auth=1';
const password=randomBytes(24).toString('base64url'),newPassword=randomBytes(24).toString('base64url');
const call=async(path,method='GET',body,session='',origin=base)=>{
 const headers={cookie:session};if(method!=='GET')headers.origin=origin;
 if(body!==undefined)headers['Content-Type']='application/json';
 const response=await fetch(base+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
 const raw=await response.text();let data;try{data=JSON.parse(raw)}catch{data={error:raw}};return {status:response.status,body:data,cookie:response.headers.get('set-cookie')?.split(';')[0]};
};
assert.equal((await call('/api/admin/content')).status,401);
assert.equal((await call('/api/admin/auth','POST',{action:'setup',username:'test-admin',password})).status,401);
const spoof=await fetch(base+'/api/admin/content',{headers:{'oai-authenticated-user-id':'fake','oai-authenticated-user-email':'seedy@sites.test'}});
assert.equal(spoof.status,401);
assert.equal((await call('/api/admin/auth','GET',undefined,owner)).body.owner,true);
let original=await call('/api/admin/content','GET',undefined,owner);assert.equal(original.status,200);
let lastRevision=original.body.revision;
try{
 const setup=await call('/api/admin/auth','POST',{action:'setup',username:'test-admin',password},owner);assert.equal(setup.status,200,JSON.stringify(setup.body));
 const bad=await call('/api/admin/auth','POST',{action:'login',username:'test-admin',password:'incorrect-password'});assert.equal(bad.status,401);
 const login=await call('/api/admin/auth','POST',{action:'login',username:'test-admin',password});assert.equal(login.status,200,JSON.stringify(login.body));assert.ok(login.cookie);const session=login.cookie;
 assert.equal((await call('/api/admin/content','GET',undefined,session)).status,200);
 assert.equal((await call('/api/admin/content','PUT',original.body,session,'https://untrusted.example')).status,403);
 const changed=structuredClone(original.body);changed.data.projects[0].description='Temporary CMS persistence verification.';
 const save=await call('/api/admin/content','PUT',changed,session);assert.equal(save.status,200,JSON.stringify(save.body));lastRevision=save.body.revision;
 const fresh=await call('/api/admin/content','GET',undefined,session);assert.equal(fresh.body.data.projects[0].description,changed.data.projects[0].description);
 const html=await (await fetch(base+'/projects/'+changed.data.projects[0].slug)).text();assert.ok(html.includes(changed.data.projects[0].description));
 assert.equal((await call('/api/admin/content','PUT',changed,session)).status,409);
 const invalid=structuredClone(fresh.body);invalid.data.projects[0].images=['javascript:alert(1)'];assert.equal((await call('/api/admin/content','PUT',invalid,session)).status,400);
 const png=await readFile('public/images/white-city-thumb.webp');
 const upload=await fetch(base+'/api/admin/upload',{method:'POST',headers:{cookie:session,origin:base,'Content-Type':'image/webp'},body:png});assert.equal(upload.status,200,await upload.clone().text());
 const media=await upload.json();const image=await fetch(base+media.url);assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/webp');assert.equal((await image.arrayBuffer()).byteLength,png.byteLength);
 const fake=await fetch(base+'/api/admin/upload',{method:'POST',headers:{cookie:session,origin:base,'Content-Type':'image/svg+xml'},body:'<svg onload="alert(1)"/>'});assert.equal(fake.status,400);
 const change=await call('/api/admin/auth','POST',{action:'password',username:'test-admin',currentPassword:password,password:newPassword},session);assert.equal(change.status,200,JSON.stringify(change.body));
 assert.equal((await call('/api/admin/content','GET',undefined,session)).status,401);
 assert.equal((await call('/api/admin/auth','POST',{action:'login',username:'test-admin',password})).status,401);
 const again=await call('/api/admin/auth','POST',{action:'login',username:'test-admin',password:newPassword});assert.equal(again.status,200);
 assert.equal((await call('/api/admin/auth','POST',{action:'logout'},again.cookie)).status,200);
 assert.equal((await call('/api/admin/content','GET',undefined,again.cookie)).status,401);
 for(let i=0;i<3;i++)await call('/api/admin/auth','POST',{action:'login',username:'test-admin',password:'incorrect'});
 assert.equal((await call('/api/admin/auth','POST',{action:'login',username:'test-admin',password:newPassword})).status,429);
 console.log('PASS: anonymous/spoofed access blocked; owner setup; password login and rotation; session revocation; CSRF; durable edits; conflict detection; image upload; invalid media rejected; rate limiting.');
}finally{
 const state=await call('/api/admin/content','GET',undefined,owner);
 const restore=await call('/api/admin/content','PUT',{data:original.body.data,revision:state.body.revision},owner);
 assert.equal(restore.status,200,'Could not restore initial portfolio');
}

