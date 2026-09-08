import {runtime,getDb} from '@/db';
import {adminIdentity,assertOrigin,json} from '@/lib/admin-auth';
import {rateLimit} from '@/lib/operations';
import {imageInfo} from '@/lib/image-info';
import type {MediaInfo} from '@/lib/media-types';
export const dynamic='force-dynamic';
export async function POST(request:Request){if(!await adminIdentity())return json({error:'Giriş tələb olunur.'},401);try{
 assertOrigin(request);if(await rateLimit(request,'upload',120))return json({error:'Yükləmə limiti doldu. Bir az sonra davam edin.'},429);
 const length=Number(request.headers.get('content-length'));if(!length||length>28*1024*1024)return json({error:'Orijinal və web nüsxələri birlikdə 28 MB-dan çox ola bilməz.'},413);
 if(!request.headers.get('content-type')?.includes('multipart/form-data'))return json({error:'Yenilənmiş yükləyicidən istifadə edin; admin səhifəsini yeniləyin.'},415);
 const form=await request.formData(),file=form.get('original');if(!(file instanceof File)||file.size>20*1024*1024||!file.size)return json({error:'Orijinal ən çox 20 MB olmalıdır.'},413);
 const bytes=new Uint8Array(await file.arrayBuffer()),info=imageInfo(bytes);const extension=file.name.split('.').pop()?.toLowerCase();if(![info.ext,...(info.ext==='jpg'?['jpeg']:[])].includes(extension||'')||file.type!==info.type)return json({error:'Fayl adı, format və MIME tipi uyğun deyil.'},400);
 const checksum=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(byte=>byte.toString(16).padStart(2,'0')).join('');
 const old=await getDb().prepare('SELECT metadata FROM studio_assets WHERE checksum=?').bind(checksum).first<{metadata:string}>();if(old){const asset=JSON.parse(old.metadata) as MediaInfo;return json({url:asset.src,asset,duplicate:true});}
 const files=form.getAll('variants');if(files.length<1||files.length>3)return json({error:'Web nüsxələri hazırlanmadı. Yenidən yükləyin.'},400);
 const variants:{src:string;width:number;height:number;bytes:Uint8Array}[]=[];
 for(const part of files){if(!(part instanceof File)||part.size>5*1024*1024)throw Error('Web nüsxəsi çox böyükdür.');const buffer=new Uint8Array(await part.arrayBuffer()),variant=imageInfo(buffer);if(variant.ext!=='webp'||variant.width>2400||variant.height>2400)throw Error('Web nüsxəsi WebP və ən çox 2400 px olmalıdır.');const ratio=variant.width/variant.height,originalRatio=info.width/info.height;if(Math.min(Math.abs(ratio-originalRatio),Math.abs(ratio-1/originalRatio))>.025)throw Error('Web nüsxəsinin nisbəti orijinalla uyğun deyil.');variants.push({src:'/media/'+checksum+'-'+variant.width+'.webp',width:variant.width,height:variant.height,bytes:buffer});}
 variants.sort((a,b)=>a.width-b.width);if(new Set(variants.map(v=>v.src)).size!==variants.length)throw Error('Web nüsxəsi təkrarlanır.');
 const display=variants.find(v=>v.width>=1280)||variants[variants.length-1];const asset:MediaInfo={id:checksum,src:display.src,name:file.name.slice(0,200),type:info.type,size:file.size,checksum,width:info.width,height:info.height,variants:variants.map(({bytes,...v})=>v),createdAt:new Date().toISOString(),privateOriginal:true};
 const originalKey='originals/'+checksum+'.'+info.ext;
 await runtime().MEDIA.put(originalKey,bytes,{httpMetadata:{contentType:info.type,cacheControl:'private,no-store'}});
 for(const variant of variants)await runtime().MEDIA.put(variant.src.slice('/media/'.length),variant.bytes,{httpMetadata:{contentType:'image/webp',cacheControl:'private,max-age=300'}});
 await getDb().prepare('INSERT OR IGNORE INTO studio_assets (id,checksum,src,original_key,metadata,created_at) VALUES (?,?,?,?,?,?)').bind(asset.id,checksum,asset.src,originalKey,JSON.stringify(asset),asset.createdAt).run();
 return json({url:asset.src,asset,duplicate:false});
 }catch(error){if(error instanceof Error&&error.message==='ORIGIN')return json({error:'Sorğu mənbəyi qəbul edilmir.'},403);return json({error:error instanceof Error?error.message:'Şəkil yüklənmədi.'},400);}}
