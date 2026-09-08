import {randomBytes} from 'node:crypto';
import {getDb} from '@/db';
import {account,adminIdentity,platformOwner,passwordHash,passwordMatches,newSession,cookie,assertOrigin,json,limited,SESSION,digest} from '@/lib/admin-auth';
import {cookies} from 'next/headers';
export const dynamic='force-dynamic';
export async function GET(){const identity=await adminIdentity();const user=await account();return json({authenticated:!!identity,owner:identity==='owner',configured:!!user,username:identity?user?.username:null});}
export async function POST(request:Request){
 try{
 assertOrigin(request);if(Number(request.headers.get('content-length')||0)>4096)return json({error:'Sorğu çox böyükdür.'},413);
 const body=await request.text();if(body.length>4096)return json({error:'Sorğu çox böyükdür.'},413);
 const data=JSON.parse(body);const action=data.action;const user=await account();
 if(action==='logout'){
 const token=(await cookies()).get(SESSION)?.value;if(token)await getDb().prepare('DELETE FROM studio_sessions WHERE token_hash = ?').bind(digest(token)).run();
 return json({ok:true},200,{'Set-Cookie':cookie('',request,0)});
 }
 if(action==='login'){
 if(await limited(request))return json({error:'Çox sayda cəhd. 15 dəqiqə sonra yenidən yoxlayın.'},429);
 if(typeof data.password!=='string'||data.password.length>128||typeof data.username!=='string')return json({error:'Giriş məlumatları yanlışdır.'},401);
 const hash=user?.password_hash||'0'.repeat(128);const salt=user?.salt||'0'.repeat(32);
 const match=passwordMatches(data.password,salt,hash);
 if(!user||!match||data.username.toLowerCase().trim()!==user.username)return json({error:'İstifadəçi adı və ya parol yanlışdır.'},401);
 return json({ok:true},200,{'Set-Cookie':cookie(await newSession(),request)});
 }
 if(action==='setup'||action==='password'){
 const identity=await adminIdentity();
 if(!identity)return json({error:'Giriş tələb olunur.'},401);
 if(!user&&!(await platformOwner()))return json({error:'İlk hesabı yalnız sayt sahibi qura bilər.'},403);
 if(user&&identity!=='owner'&&(typeof data.currentPassword!=='string'||data.currentPassword.length>128||!passwordMatches(data.currentPassword,user.salt,user.password_hash)))return json({error:'Cari parol yanlışdır.'},403);
 if(typeof data.username!=='string'||!/^[a-zA-Z0-9_.@-]{3,80}$/.test(data.username)||typeof data.password!=='string'||data.password.length<12||data.password.length>128)return json({error:'İstifadəçi adı 3–80 simvol, parol isə ən azı 12 simvol olmalıdır.'},400);
 const salt=randomBytes(16).toString('hex');const hash=passwordHash(data.password,salt);
 await getDb().batch([getDb().prepare('INSERT INTO studio_account (id,username,password_hash,salt) VALUES (1,?,?,?) ON CONFLICT(id) DO UPDATE SET username=excluded.username,password_hash=excluded.password_hash,salt=excluded.salt').bind(data.username.toLowerCase().trim(),hash,salt),getDb().prepare('DELETE FROM studio_sessions')]);
 return json({ok:true},200,{'Set-Cookie':cookie(await newSession(),request)});
 }
 return json({error:'Naməlum əməliyyat.'},400);
 }catch(error){if(error instanceof Error&&error.message==='ORIGIN')return json({error:'Sorğu mənbəyi qəbul edilmir.'},403);console.error('Admin auth failed');return json({error:'Əməliyyat alınmadı. Yenidən yoxlayın.'},500);}
}
