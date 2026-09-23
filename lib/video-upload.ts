import {studioFetch,supabase} from '@/web/api';
import {MAX_VIDEO_BYTES,type AnimationVideo} from './animation-playlist';
export async function inspectVideo(file:File):Promise<number>{
 if(!['video/mp4','video/webm'].includes(file.type)||!file.size||file.size>MAX_VIDEO_BYTES)throw Error('MP4 və ya WebM seçin; ən çox 50 MB.');
 return new Promise((resolve,reject)=>{
  const video=document.createElement('video'),url=URL.createObjectURL(file);
  const clean=()=>{clearTimeout(timeout);video.onloadedmetadata=null;video.onerror=null;video.removeAttribute('src');video.load();URL.revokeObjectURL(url);};
  const fail=()=>{clean();reject(Error('Video oxunmadı. Brauzerə uyğun MP4 (H.264) və ya WebM seçin.'));};
  const timeout=setTimeout(fail,20000);
  video.preload='metadata';video.onloadedmetadata=()=>{
   const duration=video.duration;
   if(!Number.isFinite(duration)||duration<1||duration>3600){clean();reject(Error('Video müddəti 1–3600 saniyə olmalıdır.'));return;}
   clean();resolve(duration);
  };video.onerror=fail;video.src=url;
 });
}
export async function uploadVideo(file:File):Promise<AnimationVideo>{
 const duration=await inspectVideo(file);
 const response=await studioFetch('/api/admin/video-upload',{method:'POST',body:JSON.stringify({name:file.name,type:file.type,size:file.size})});
 const result=await response.json();if(!response.ok)throw Error(result.error||'Video yüklənmədi.');
 const {error}=await supabase.storage.from('studio-videos').uploadToSignedUrl(result.path,result.token,file,{contentType:file.type,cacheControl:'31536000'});
 if(error)throw Error('Video yüklənmədi: '+error.message);
 return {id:crypto.randomUUID(),src:'/videos/'+result.path,title:file.name.replace(/\.[^.]+$/,'' ).slice(0,150),description:'',kind:'Animation',poster:'',duration};
}
