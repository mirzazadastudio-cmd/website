import {upgradeCatalog} from './shared/catalog-upgrade.ts';
import {createClient} from 'npm:@supabase/supabase-js@2.115.0';
import {validateContent} from './shared/content-validation.ts';
import {publicContent} from './shared/editorial-validation.ts';
import {imageInfo} from './shared/image-info.ts';
const origins=new Set(['https://mirzazadastudio.com','https://www.mirzazadastudio.com','https://mirzazadastudio-cmd.github.io','http://127.0.0.1:5173','http://127.0.0.1:4173']);
const publishable='sb_publishable_O3P3930RyQWPdc9-czr6OQ_IoxwYQ7t';
const hash=async(bytes:BufferSource)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
const sha=(text:string)=>hash(new TextEncoder().encode(text));
function checked(result:any){if(result.error)throw result.error;return result.data;}
function field(value:unknown,max:number,required=true){if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw Error('Please complete the required fields.');return value.trim();}
Deno.serve(async req=>{
 const origin=req.headers.get('origin');
 const cors={'Access-Control-Allow-Origin':origin&&origins.has(origin)?origin:'https://mirzazadastudio.com','Vary':'Origin','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'GET,POST,PUT,PATCH,OPTIONS','Cache-Control':'no-store'};
 const json=(data:unknown,status=200)=>Response.json(data,{status,headers:cors});
 if(origin&&!origins.has(origin))return json({error:'Origin not allowed'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 // API-key auth permits public reads/contact. All admin paths ALSO verify a
 // live Supabase Auth user, confirmed email, and the private owner UUID.
 if(req.headers.get('apikey')!==publishable)return json({error:'Invalid API key'},401);
 const url=new URL(req.url),route=url.pathname.split('/studio-api')[1]||'/';
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
 try{
  if(route==='/content'&&req.method==='GET'){const record=checked(await db.from('studio_public_content').select('data,revision').eq('id','main').single());return json({...record,data:publicContent(upgradeCatalog(record.data))});}
  if(route==='/setup'&&req.method==='POST'){
   const raw=await req.text();if(raw.length>2000)return json({error:'Request too large'},413);
   const body=JSON.parse(raw);
   if(typeof body.password!=='string'||body.password.length<12||body.password.length>128||typeof body.token!=='string'||!/^[a-f0-9]{64}$/.test(body.token))return json({error:'A valid setup link and a password of at least 12 characters are required.'},400);
   const email=checked(await db.rpc('studio_claim_setup',{token_hash:await sha(body.token)}));
   if(!email)return json({error:'This setup link is invalid or already used.'},403);
   const {data,error}=await db.auth.admin.createUser({email,password:body.password,email_confirm:true});
   if(error){checked(await db.from('studio_owner').update({setup_hash:await sha(body.token)}).eq('id','main').is('user_id',null));throw error;}
   checked(await db.from('studio_owner').update({user_id:data.user.id}).eq('id','main'));return json({email});
  }
  if(route==='/contact'&&req.method==='POST'){
   const text=await req.text();if(text.length>16000)return json({error:'Your message is too long.'},413);
   const raw=JSON.parse(text);if(raw.website)return json({received:true},202);
   const key='contact:'+await sha(req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown');
   if(checked(await db.rpc('studio_rate_limit',{rate_key:key,limit_count:5,window_seconds:900})))return json({error:'Please wait a few minutes before trying again.'},429);
   const name=field(raw.name,120),email=field(raw.email,254),company=field(raw.company||'',200,false),project_type=field(raw.projectType,200),deadline=field(raw.deadline||'',100,false),message=field(raw.message,6000);
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Please enter a valid email address.'},400);
   const id=typeof raw.id==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(raw.id)?raw.id:crypto.randomUUID();
   const attribution:Record<string,string>={};for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','page'])if(typeof raw.attribution?.[key]==='string')attribution[key]=raw.attribution[key].slice(0,300);
   checked(await db.from('studio_inquiries').upsert({id,name,email,company,project_type,deadline,message,attribution:JSON.stringify(attribution)},{onConflict:'id',ignoreDuplicates:true}));
   return json({received:true,reference:id.slice(0,8)},201);
  }
  const token=req.headers.get('authorization')?.replace(/^Bearer /i,'');
  const {data:{user}}=token?await db.auth.getUser(token):{data:{user:null}};
  const owner=checked(await db.from('studio_owner').select('user_id,email').eq('id','main').maybeSingle());
  const authorized=!!user&&!!user.email_confirmed_at&&user.id===owner?.user_id;
  if(route==='/admin/auth'&&req.method==='GET')return json({authenticated:authorized,supportsPortfolioImports:authorized,supportsLocalizedContent:authorized,configured:true,owner:false,...(authorized?{username:user!.email}:{})});
  if(!authorized)return json({error:'Owner sign-in required.'},401);
  if(route==='/admin/content'){
   if(req.method==='GET'){
    const content=checked(await db.from('studio_content').select('data,revision').eq('id','main').single());
    const assets=checked(await db.from('studio_assets').select('metadata'));
    content.data=upgradeCatalog(content.data);
    content.data.media={...content.data.media,...Object.fromEntries(assets.map((row:any)=>[row.metadata.src,row.metadata]))};
    return json(content);
   }
   if(req.method==='PUT'){
    const raw=await req.text();if(raw.length>8*1024*1024)return json({error:'Content too large'},413);
    const body=JSON.parse(raw);if(!Number.isInteger(body.revision))return json({error:'Invalid revision'},400);
    const previous=checked(await db.from('studio_content').select('data,revision').eq('id','main').single());
    if(previous.revision!==body.revision)return json({error:'CONFLICT: Reload the latest content before saving.'},409);
    const data=validateContent(upgradeCatalog(body.data)),now=new Date().toISOString();
    data.projectRedirects=Object.fromEntries(Object.entries({...previous.data.projectRedirects,...data.projectRedirects}).filter(([,id])=>data.projects.some(p=>p.id===id)));
    for(const p of data.projects){
     const old=previous.data.projects.find((item:any)=>item.id===p.id);
     if(p.status==='published'&&p.displayPermission!=='confirmed'&&old?.status!=='published')throw Error('Yayımdan əvvəl paylaşma icazəsini təsdiqləyin.');
     if(old&&old.slug!==p.slug)data.projectRedirects[old.slug]=p.id!;
     if(data.projectRedirects[p.slug]&&data.projectRedirects[p.slug]!==p.id)throw Error('Bu ünvan başqa layihənin əvvəlki ünvanıdır.');
     p.createdAt=old?.createdAt||now;p.updatedAt=JSON.stringify(old)===JSON.stringify(p)?old.updatedAt:now;
     p.publishedAt=p.status==='published'?(old?.publishedAt||now):old?.publishedAt||'';
    }
    const assets=checked(await db.from('studio_assets').select('metadata'));
    data.media={...upgradeCatalog(previous.data).media,...Object.fromEntries(assets.map((row:any)=>[row.metadata.src,row.metadata]))};
    const revision=checked(await db.rpc('studio_save',{expected_revision:body.revision,full_data:data,published_data:publicContent(data)}));
    return json({data,revision});
   }
  }
  if(route==='/admin/inquiries'){
   if(req.method==='GET')return json({items:checked(await db.from('studio_inquiries').select('*').order('created_at',{ascending:false}))});
   if(req.method==='PATCH'){const body=await req.json();if(!['new','reviewing','replied','closed','spam'].includes(body.status))throw Error('Invalid status');checked(await db.from('studio_inquiries').update({status:body.status}).eq('id',body.id));return json({ok:true});}
  }
  if(route==='/admin/assets'&&req.method==='GET')return json({items:checked(await db.from('studio_assets').select('metadata').order('created_at',{ascending:false})).map((row:any)=>row.metadata)});
  if(route.startsWith('/admin/assets/')&&req.method==='GET'){
   const asset=checked(await db.from('studio_assets').select('original_path,metadata').eq('id',route.split('/').pop()).single());
   const result=checked(await db.storage.from('studio-originals').createSignedUrl(asset.original_path,60,{download:asset.metadata.name}));return json({url:result.signedUrl});
  }
  if(route==='/admin/backup'&&req.method==='GET'){
   const revision=url.searchParams.get('revision');
   if(revision==='list')return json({items:checked(await db.from('studio_revisions').select('revision,created_at').order('revision',{ascending:false}))});
   const content=revision?checked(await db.from('studio_revisions').select('data,revision').eq('revision',Number(revision)).single()):checked(await db.from('studio_content').select('data,revision').eq('id','main').single());
   return json({format:'mirzazada-studio-backup-v1',createdAt:new Date().toISOString(),content:content.data,revision:content.revision,inquiries:checked(await db.from('studio_inquiries').select('*')),assets:checked(await db.from('studio_assets').select('metadata'))});
  }

  if(route==='/admin/video-upload'&&req.method==='POST'){
   const raw=await req.text();if(raw.length>2000)return json({error:'Request too large'},413);
   const body=JSON.parse(raw),ext=body.type==='video/mp4'?'mp4':body.type==='video/webm'?'webm':null;
   if(!ext||typeof body.name!=='string'||body.name.length>255||!body.name.toLowerCase().endsWith('.'+ext)||!Number.isInteger(body.size)||body.size<1||body.size>50*1024*1024)return json({error:'MP4 və ya WebM seçin; ən çox 50 MB.'},400);
   if(checked(await db.rpc('studio_rate_limit',{rate_key:'video-upload:'+user!.id,limit_count:50,window_seconds:900})))return json({error:'Yükləmə limiti doldu. Bir az sonra davam edin.'},429);
   const path=crypto.randomUUID()+'.'+ext;
   const upload=checked(await db.storage.from('studio-videos').createSignedUploadUrl(path));
   return json({path,token:upload.token},201);
  }
  if(route==='/admin/upload'&&req.method==='POST'){
   if(Number(req.headers.get('content-length'))>60*1024*1024)return json({error:'Upload too large'},413);
   if(checked(await db.rpc('studio_rate_limit',{rate_key:'upload:'+user!.id,limit_count:50,window_seconds:900})))return json({error:'Please wait before uploading more files.'},429);
   const form=await req.formData(),file=form.get('original');if(!(file instanceof File)||file.size>20*1024*1024)throw Error('Invalid original');
   const bytes=new Uint8Array(await file.arrayBuffer()),info=imageInfo(bytes),checksum=await hash(bytes);
   const duplicate=checked(await db.from('studio_assets').select('metadata').eq('checksum',checksum).maybeSingle());
   if(duplicate)return json({url:duplicate.metadata.src,asset:duplicate.metadata,duplicate:true});
   const id=crypto.randomUUID(),originalPath=id+'.'+info.ext,variants:any[]=[];
   const entries=form.getAll('variants');if(!entries.length||entries.length>3)throw Error('Invalid variants');
   // Validate all supplied images before making storage mutations.
   const processed=await Promise.all(entries.map(async entry=>{
    if(!(entry instanceof File)||entry.size>20*1024*1024)throw Error('Invalid variant');
    const bytes=new Uint8Array(await entry.arrayBuffer()),size=imageInfo(bytes);
    if(size.type!=='image/webp'||size.width>2400||size.height>2400)throw Error('Invalid variant');
    return {bytes,size,key:crypto.randomUUID()+'.webp'};
   }));
   for(const {bytes,size,key} of processed){checked(await db.storage.from('studio-media').upload(key,bytes,{contentType:'image/webp',cacheControl:'31536000'}));variants.push({src:'/media/'+key,width:size.width,height:size.height});}
   checked(await db.storage.from('studio-originals').upload(originalPath,bytes,{contentType:info.type}));
   variants.sort((a,b)=>a.width-b.width);
   const asset={id,src:variants.at(-1).src,name:file.name.slice(0,200),type:info.type,size:file.size,checksum,width:info.width,height:info.height,variants,createdAt:new Date().toISOString(),privateOriginal:true};
   checked(await db.from('studio_assets').insert({id,checksum,original_path:originalPath,metadata:asset}));
   return json({url:asset.src,asset,duplicate:false},201);
  }
  return json({error:'Not found'},404);
 }catch(error){const message=error instanceof Error?error.message:String((error as any)?.message||'Operation failed');console.error('studio-api:',message);return json({error:message.includes('CONFLICT')?'CONFLICT: Reload the latest content.':message},message.includes('CONFLICT')?409:400);}
});
