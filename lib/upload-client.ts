import {studioFetch} from '@/web/api';
import type {MediaInfo} from './media-types';
export async function uploadStudioAsset(file:File,onProgress:(progress:number)=>void=()=>{}):Promise<{url:string;asset:MediaInfo;duplicate:boolean}>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)throw Error('JPG, PNG və ya WebP seçin; ən çox 20 MB.');
 onProgress(0);const bitmap=await createImageBitmap(file);const form=new FormData();form.append('original',file);
 try{const lengths=Array.from(new Set([640,1280,2400].map(size=>Math.min(size,Math.max(bitmap.width,bitmap.height)))));for(const longest of lengths){const scale=longest/Math.max(bitmap.width,bitmap.height),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const context=canvas.getContext('2d');if(!context)throw Error('Şəkil hazırlana bilmədi.');context.drawImage(bitmap,0,0,canvas.width,canvas.height);const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.9));canvas.width=canvas.height=1;if(!blob)throw Error('Web nüsxəsi hazırlana bilmədi.');form.append('variants',blob,'render-'+longest+'.webp');}}finally{bitmap.close();}
 const response=await studioFetch('/api/admin/upload',{method:'POST',body:form});const data=await response.json();if(!response.ok)throw Error(data.error||'Yükləmə alınmadı.');onProgress(100);return data;
}
