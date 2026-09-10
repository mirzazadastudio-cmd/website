const assert=require('node:assert/strict');
const ts=require('typescript'),fs=require('node:fs');
const compiled=ts.transpileModule(fs.readFileSync('web/recovery-flow.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};new Function('exports','require','module',compiled)(mod.exports,require,mod);
const {RecoveryFlow,recoveryError}=mod.exports;
const user={id:'owner-1',email:'owner@example.com'};
function fixture(){const calls=[];const auth={resetPasswordForEmail:async(...args)=>{calls.push(['send',...args]);return {error:null}},verifyOtp:async arg=>{calls.push(['verify',arg]);return {data:{user,session:{user}},error:null}},getUser:async()=>({data:{user},error:null}),updateUser:async arg=>{calls.push(['update',arg]);return {error:null}},signOut:async arg=>{calls.push(['signout',arg]);return {error:null}}};return {calls,auth,flow:new RecoveryFlow(auth)}}
(async()=>{
 let f=fixture();await assert.rejects(f.flow.save('valid-password-123','valid-password-123'),/Əvvəl/);assert.equal(f.calls.length,0);
 await f.flow.send(' OWNER@example.com ','https://mirzazadastudio.com/admin/');assert.equal(f.calls[0][1],'owner@example.com');assert.equal(f.calls[0][2].redirectTo,'https://mirzazadastudio.com/admin/');
 await assert.rejects(f.flow.verify(user.email,'abc123'),/rəqəmli/);assert.equal(f.calls.filter(x=>x[0]==='verify').length,0);
 f.auth.verifyOtp=async()=>({data:{user:null,session:null},error:{code:'otp_expired'}});await assert.rejects(f.flow.verify(user.email,'123456'));await assert.rejects(f.flow.save('valid-password-123','valid-password-123'));assert.equal(f.calls.filter(x=>x[0]==='update').length,0);
 f=fixture();await f.flow.verify('OWNER@example.com','123456');assert.equal(f.calls[0][1].type,'recovery');await assert.rejects(f.flow.save('short','short'));await assert.rejects(f.flow.save('valid-password-123','different-password'));assert.equal(f.calls.filter(x=>x[0]==='update').length,0);
 assert.deepEqual(await f.flow.save('valid-password-123','valid-password-123'),{signedOut:true});assert.equal(f.calls.filter(x=>x[0]==='update').length,1);assert.deepEqual(f.calls.at(-1),['signout',{scope:'global'}]);await assert.rejects(f.flow.save('valid-password-123','valid-password-123'));
 f=fixture();await f.flow.verify(user.email,'123456');f.auth.getUser=async()=>({data:{user:{...user,id:'different'}},error:null});await assert.rejects(f.flow.save('valid-password-123','valid-password-123'),/sessiyası/);assert.equal(f.calls.filter(x=>x[0]==='update').length,0);
 f=fixture();await f.flow.acceptLink();await f.flow.save('valid-password-123','valid-password-123');assert.equal(f.calls.filter(x=>x[0]==='update').length,1);
 assert.match(recoveryError({code:'over_email_send_rate_limit'}),/1 saat/);assert.match(recoveryError({code:'otp_expired'}),/Kod səhvdir/);
 console.log('PASS: recovery code validation, wrong/expired codes, session binding, password validation, one-use flow, link recovery, global sign-out and rate-limit messages.');
})().catch(e=>{console.error(e);process.exitCode=1});

