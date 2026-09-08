import {adminIdentity,assertOrigin,json} from '@/lib/admin-auth';
import {readContent,saveContent} from '@/lib/content-store';
import {validateContent} from '@/lib/content-validation';
export const dynamic='force-dynamic';
export async function GET(){if(!await adminIdentity())return json({error:'Giriş tələb olunur.'},401);return json(await readContent());}
export async function PUT(request:Request){
 if(!await adminIdentity())return json({error:'Giriş tələb olunur.'},401);
 try{assertOrigin(request);if(Number(request.headers.get('content-length')||0)>1500000)return json({error:'Məzmun həddən artıq böyükdür.'},413);
 const text=await request.text();if(text.length>1500000)return json({error:'Məzmun həddən artıq böyükdür.'},413);
 const body=JSON.parse(text);if(!Number.isSafeInteger(body.revision)||body.revision<0)return json({error:'Versiya düzgün deyil.'},400);
 const data=validateContent(body.data);const revision=await saveContent(data,body.revision);return json({revision,data});
 }catch(error){const message=error instanceof Error?error.message:'';if(message==='ORIGIN')return json({error:'Sorğu mənbəyi qəbul edilmir.'},403);if(message==='CONFLICT')return json({error:'Başqa pəncərədə dəyişiklik saxlanıb. Məlumatları yenidən yükləyin.'},409);return json({error:message||'Yadda saxlamaq mümkün olmadı.'},400);}
}
