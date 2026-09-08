import {getDb} from '@/db';
import {assertOrigin,json} from '@/lib/admin-auth';
import {rateLimit} from '@/lib/operations';
const field=(v:unknown,max:number,required=true)=>{if(typeof v!=='string'||v.length>max||(required&&!v.trim()))throw Error('Please complete the required fields.');return v.trim();};
export async function POST(request:Request){try{
 assertOrigin(request);if(Number(request.headers.get('content-length')||0)>16000)return json({error:'Your message is too long. Please shorten it.'},413);
 const body=await request.text();if(body.length>16000)return json({error:'Your message is too long. Please shorten it.'},413);const raw=JSON.parse(body);
 if(raw.website)return json({received:true},202);
 if(await rateLimit(request,'contact',5,15*60*1000))return json({error:'Please wait a few minutes before trying again.'},429,{'Retry-After':'900'});
 const name=field(raw.name,120),email=field(raw.email,254),company=field(raw.company||'',200,false),projectType=field(raw.projectType,200),deadline=field(raw.deadline||'',100,false),message=field(raw.message,6000);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||/[\r\n]/.test(email))return json({error:'Please enter a valid email address.'},400);
 const attribution:Record<string,string>={};for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','page'])if(typeof raw.attribution?.[key]==='string')attribution[key]=raw.attribution[key].slice(0,300);
 const id=typeof raw.id==='string'&&/^[a-f0-9-]{36}$/.test(raw.id)?raw.id:crypto.randomUUID();
 await getDb().prepare('INSERT OR IGNORE INTO studio_inquiries (id,name,email,company,project_type,deadline,message,attribution,status,notification,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id,name,email,company,projectType,deadline,message,JSON.stringify(attribution),'new','not_configured',new Date().toISOString()).run();
 return json({received:true,reference:id.slice(0,8)},201);
 }catch(error){if(error instanceof Error&&error.message==='ORIGIN')return json({error:'Please submit the form from this website.'},403);if(error instanceof SyntaxError)return json({error:'Please check the form and try again.'},400);if(error instanceof Error&&error.message==='Please complete the required fields.')return json({error:error.message},400);return json({error:'We could not save your inquiry. Please try again; your text is still here.'},503);}}
