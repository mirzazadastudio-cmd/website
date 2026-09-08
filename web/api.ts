import {createClient} from '@supabase/supabase-js';
export const supabaseUrl=import.meta.env.VITE_SUPABASE_URL||'https://wjynujdjmtgpzzllnwgf.supabase.co';
export const publicKey=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_O3P3930RyQWPdc9-czr6OQ_IoxwYQ7t';
export const supabase=createClient(supabaseUrl,publicKey,{auth:{persistSession:typeof window!=='undefined',autoRefreshToken:typeof window!=='undefined',detectSessionInUrl:true}});
export const mediaUrl=(src:string)=>src.startsWith('/media/')?supabaseUrl+'/storage/v1/object/public/studio-media/'+src.slice(7):src;
export async function studioFetch(path:string,options:RequestInit={}){
 if(path==='/api/admin/auth'&&options.method==='POST'){
  try{
   const body=JSON.parse(String(options.body));
   if(body.action==='login'){
    const {error}=await supabase.auth.signInWithPassword({email:body.username,password:body.password});if(error)throw error;
    const check=await studioFetch('/api/admin/auth');const state=await check.json();if(!state.authenticated){await supabase.auth.signOut();throw Error('Bu hesabın idarəetmə icazəsi yoxdur.');}
   }else if(body.action==='logout'){const {error}=await supabase.auth.signOut();if(error)throw error;}
   else if(body.action==='password'){
    const {data:{user},error:userError}=await supabase.auth.getUser();if(userError||!user)throw Error('Daxil olun.');
    if(body.username!==user.email)throw Error('Sahib e-poçtu dəyişdirilə bilməz.');
    if(body.password.length<12)throw Error('Parol ən azı 12 simvol olmalıdır.');
    const {error:loginError}=await supabase.auth.signInWithPassword({email:user.email!,password:body.currentPassword});if(loginError)throw loginError;
    const {error}=await supabase.auth.updateUser({password:body.password});if(error)throw error;
   }else throw Error('Hesabı Supabase Auth bölməsindən qurun.');
   return Response.json({ok:true});
  }catch(error){return Response.json({error:(error as Error).message},{status:400});}
 }
 const {data:{session}}=await supabase.auth.getSession();
 const headers=new Headers(options.headers);headers.set('apikey',publicKey);
 if(session)headers.set('Authorization','Bearer '+session.access_token);
 if(typeof options.body==='string')headers.set('Content-Type','application/json');
 return fetch(supabaseUrl+'/functions/v1/studio-api'+path.replace(/^\/api/,''),{...options,headers});
}
export async function downloadStudio(path:string){
 const response=await studioFetch(path);if(!response.ok){const data=await response.json();throw Error(data.error||'Download failed');}
 if(response.headers.get('content-type')?.includes('application/json')&&path.startsWith('/api/admin/assets/')){const data=await response.json();window.location.assign(data.url);return;}
 const blob=await response.blob(),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=path.includes('backup')?'mirzazada-studio-backup.json':'render';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
