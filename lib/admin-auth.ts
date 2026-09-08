import {headers,cookies} from 'next/headers';
import {randomBytes,createHash,scryptSync,timingSafeEqual} from 'node:crypto';
import {getDb,runtime} from '@/db';
export const SESSION='studio_admin';
export const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
export function passwordHash(password:string,salt:string){return scryptSync(password,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024}).toString('hex');}
export function passwordMatches(password:string,salt:string,hash:string){const result=Buffer.from(passwordHash(password,salt),'hex');const expected=Buffer.from(hash,'hex');return result.length===expected.length&&timingSafeEqual(result,expected);}
export async function platformOwner(){
 const h=await headers();const email=h.get('oai-authenticated-user-email');const id=h.get('oai-authenticated-user-id');const owner=runtime().ADMIN_OWNER_EMAIL;
 return !!(id&&email&&owner&&email.toLowerCase()===owner.toLowerCase());
}
export async function adminIdentity(){
 if(await platformOwner())return 'owner' as const;
 const token=(await cookies()).get(SESSION)?.value;
 if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
 const row=await getDb().prepare('SELECT token_hash FROM studio_sessions WHERE token_hash = ? AND expires > ?').bind(digest(token),Date.now()).first();
 return row?'password' as const:null;
}
export async function newSession(){
 const token=randomBytes(32).toString('hex');const db=getDb();
 await db.batch([db.prepare('DELETE FROM studio_sessions WHERE expires < ?').bind(Date.now()),db.prepare('INSERT INTO studio_sessions (token_hash, expires) VALUES (?, ?)').bind(digest(token),Date.now()+8*60*60*1000)]);
 return token;
}
export async function account(){return getDb().prepare('SELECT username,password_hash,salt FROM studio_account WHERE id = 1').first<{username:string;password_hash:string;salt:string}>();}
export function cookie(value:string,request:Request,maxAge=28800){const secure=new URL(request.url).protocol==='https:';return `${SESSION}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure?'; Secure':''}`;}
export function assertOrigin(request:Request){if(request.headers.get('origin')!==new URL(request.url).origin)throw Error('ORIGIN');}
export function json(data:unknown,status=200,extra:Record<string,string>={}){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});}
export async function limited(request:Request){
 const ip=request.headers.get('cf-connecting-ip')||'unknown';const key=digest(ip);const now=Date.now();
 // Atomic counters prevent simultaneous requests bypassing the limit.
 const results=await getDb().batch([
 getDb().prepare('DELETE FROM studio_attempts WHERE reset_at < ?').bind(now),
 getDb().prepare('INSERT INTO studio_attempts (key,count,reset_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').bind(key,now+15*60*1000),
 getDb().prepare('SELECT count FROM studio_attempts WHERE key = ?').bind(key)]);
 return Number((results[2].results[0] as {count:number})?.count)>5;
}
