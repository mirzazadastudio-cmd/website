import {animationClips} from './animation-clips.ts';

export type AnimationVideo = {id:string;title:string;description:string;kind:string;src:string;poster:string;duration:number};
export const FADE_SECONDS = 0.5;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const defaultAnimationVideos:AnimationVideo[] = animationClips.map(clip=>({
 id:clip.slug,title:clip.title,description:clip.description,kind:clip.kind,
 src:'/animations/'+clip.slug+'.mp4?v=hd2',poster:'/animations/'+clip.slug+'.webp?v=hd2',duration:5,
}));
export const animationVideos=(data:{animations?:AnimationVideo[]})=>data.animations??defaultAnimationVideos;
export const videoUrl=(src:string)=>src.startsWith('/videos/')?'https://wjynujdjmtgpzzllnwgf.supabase.co/storage/v1/object/public/studio-videos/'+src.slice(8):src;
export const durationLabel=(seconds:number)=>new Intl.NumberFormat('az-AZ',{maximumFractionDigits:2}).format(seconds)+' san.';
export function validateAnimations(value:unknown):AnimationVideo[]{
 if(value===undefined)return structuredClone(defaultAnimationVideos);
 if(!Array.isArray(value)||value.length>50)throw Error('Ən çox 50 video əlavə edilə bilər.');
 const ids=new Set<string>();
 const text=(v:unknown,max:number)=>{if(typeof v!=='string'||v.length>max)throw Error('Video məlumatları düzgün deyil.');return v;};
 return value.map(item=>{
  if(!item||typeof item!=='object')throw Error('Video məlumatları düzgün deyil.');
  const id=text(item.id,80),title=text(item.title,150),src=text(item.src,200),poster=text(item.poster,200);
  if(!/^[a-zA-Z0-9-]+$/.test(id)||ids.has(id)||!title.trim())throw Error('Video adı və identifikatoru düzgün deyil.');
  ids.add(id);
  if(!/^\/(animations\/[a-zA-Z0-9_-]+\.mp4(?:\?v=hd2)?|videos\/[a-f0-9-]+\.(mp4|webm))$/.test(src))throw Error('Video faylının ünvanı düzgün deyil.');
  if(poster&&!/^\/animations\/[a-zA-Z0-9_-]+\.webp(?:\?v=hd2)?$/.test(poster))throw Error('Video örtüyü düzgün deyil.');
  if(!Number.isFinite(item.duration)||item.duration<1||item.duration>3600)throw Error('Video müddəti 1–3600 saniyə olmalıdır.');
  return {id,title:title.trim(),src,poster,duration:item.duration,description:text(item.description,1000),kind:text(item.kind,100)};
 });
}
