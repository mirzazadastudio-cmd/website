'use client';
import {useRef,useState,type PointerEvent} from 'react';
import {GripVertical,ArrowUp,ArrowDown,Trash2} from 'lucide-react';
import type {SiteContent} from '@/lib/content-types';
import {animationVideos,durationLabel,videoUrl,type AnimationVideo} from '@/lib/animation-playlist';
import {uploadVideo} from '@/lib/video-upload';
import {AnimationPlayer} from './animation-player';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogCancel,AlertDialogAction} from './ui/alert-dialog';

export function AdminAnimation({data,edit,setBusy,setError}:{data:SiteContent;edit:(fn:(data:SiteContent)=>void)=>void;setBusy:(value:boolean)=>void;setError:(value:string)=>void}){
 const videos=animationVideos(data),drag=useRef<{id:string;target:string}|null>(null);
 const [dragged,setDragged]=useState(''),[over,setOver]=useState(''),[status,setStatus]=useState(''),[uploading,setUploading]=useState(false),[remove,setRemove]=useState<AnimationVideo|null>(null),[preview,setPreview]=useState<AnimationVideo[]|null>(null);
 const change=(fn:(list:AnimationVideo[])=>void)=>edit(d=>{d.animations=structuredClone(animationVideos(d));fn(d.animations);});
 const move=(id:string,to:number)=>{change(list=>{const from=list.findIndex(v=>v.id===id);if(from<0||to<0||to>=list.length)return;const [item]=list.splice(from,1);list.splice(to,0,item);});setStatus('Video '+(to+1)+'. sıraya keçirildi.');setPreview(null);};
 const finishDrag=(event:PointerEvent<HTMLButtonElement>,cancel=false)=>{
  const current=drag.current;
  if(current&&!cancel&&current.id!==current.target)move(current.id,videos.findIndex(v=>v.id===current.target));
  drag.current=null;setDragged('');setOver('');
  if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
 };
 async function upload(files:File[],replaceId?:string){
  if(!replaceId&&videos.length+files.length>50){setError('Ən çox 50 video əlavə edilə bilər.');return;}
  setBusy(true);setUploading(true);setError('');setPreview(null);
  try{
   for(let i=0;i<files.length;i++){
    setStatus('Video yüklənir: '+(i+1)+' / '+files.length);
    const uploaded=await uploadVideo(files[i]);
    change(list=>{const target=list.find(v=>v.id===replaceId);if(target){Object.assign(target,{src:uploaded.src,poster:'',duration:uploaded.duration});}else list.push(uploaded);});
   }
   setStatus('Video hazırdır. Sayta tətbiq etmək üçün “Dəyişiklikləri saxla” düyməsinə basın.');
  }catch(error){setError((error as Error).message);setStatus('Yükləmə dayandı. Hazır olan videolar siyahıda saxlanılıb.');}
  finally{setBusy(false);setUploading(false);}
 }
 return <section className="admin-home-editor admin-animation">
  <div className="admin-section-heading"><div><h2>Animation</h2><p>Ana səhifənin videoları. Dəstəyi basılı tutub sürüşdürərək sıralayın.</p></div><label className="admin-upload">+ Video əlavə et<input type="file" multiple accept="video/mp4,video/webm" disabled={uploading||videos.length>=50} onChange={e=>{const files=Array.from(e.target.files||[]);e.target.value='';if(files.length)void upload(files);}}/></label></div>
  <div className="animation-editor-summary"><span>{videos.length} video</span><span>Giriş və çıxış: 0,5 san.</span><span>MP4 / WebM · ən çox 50 MB / video</span></div>
  <p className="admin-hint">Hər videonun son 0,5 saniyəsi növbəti videonun ilk 0,5 saniyəsi ilə yumşaq keçid yaradır. Son video da birinciyə eyni keçidlə qayıdır.</p>
  <p className="animation-editor-status" role="status">{status}</p>
  {!videos.length&&<p className="animation-empty">Hələ video yoxdur. İlk videonu əlavə edin; siyahı boş saxlanıldıqda əsas səhifədə video zolağı gizlənir.</p>}
  <div className="animation-video-list">{videos.map((video,i)=><article key={video.id} data-video-id={video.id} className={'animation-video-card'+(dragged===video.id?' is-dragging':'')+(over===video.id?' is-drop-target':'')}>
   <div className="animation-video-toolbar"><button type="button" className="animation-drag-handle" aria-label={video.title+' — sıralamaq üçün sürüşdürün və ya ox düymələrindən istifadə edin'} onPointerDown={e=>{if(e.button!==0)return;drag.current={id:video.id,target:video.id};setDragged(video.id);e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(!drag.current)return;const card=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-video-id]');if(card?.dataset.videoId){drag.current.target=card.dataset.videoId;setOver(card.dataset.videoId);}if(e.clientY<90)window.scrollBy(0,-14);else if(e.clientY>window.innerHeight-90)window.scrollBy(0,14);}} onPointerUp={e=>finishDrag(e)} onPointerCancel={e=>finishDrag(e,true)} onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();move(video.id,i+(e.key==='ArrowUp'?-1:1));}}}><GripVertical size={22}/></button><strong>{String(i+1).padStart(2,'0')}</strong><span className="animation-duration">{durationLabel(video.duration)}</span><button type="button" disabled={i===0} aria-label={video.title+' — əvvələ çək'} onClick={()=>move(video.id,i-1)}><ArrowUp size={18}/></button><button type="button" disabled={i===videos.length-1} aria-label={video.title+' — sona çək'} onClick={()=>move(video.id,i+1)}><ArrowDown size={18}/></button><button type="button" className="admin-remove" aria-label={video.title+' — sil'} onClick={()=>setRemove(video)}><Trash2 size={18}/></button></div>
   <div className="animation-video-body"><div><video key={video.src} src={videoUrl(video.src)} poster={video.poster||undefined} controls playsInline preload="metadata" onLoadedMetadata={e=>{const duration=e.currentTarget.duration;if(Number.isFinite(duration)&&duration>=1&&duration<=3600&&Math.abs(duration-video.duration)>.05)change(list=>{const item=list.find(v=>v.id===video.id);if(item)item.duration=duration;});}}/><label className="admin-upload-inline">Videonu dəyiş<input type="file" accept="video/mp4,video/webm" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void upload([file],video.id);}}/></label></div>
   <div className="animation-video-fields"><label>Video adı<input value={video.title} maxLength={150} onChange={e=>change(list=>{list[i].title=e.target.value;})}/></label><label>Kateqoriya / mövzu<input value={video.kind} maxLength={100} onChange={e=>change(list=>{list[i].kind=e.target.value;})}/></label><label>Təsvir<textarea value={video.description} maxLength={1000} rows={2} onChange={e=>change(list=>{list[i].description=e.target.value;})}/></label></div></div>
  </article>)}</div>
  {!!videos.length&&<div className="animation-preview-controls"><button className="outline-button" type="button" onClick={()=>setPreview(structuredClone(videos))}>Keçidlərə önbaxış ↗</button><p className="admin-hint">Dəyişikliklər yadda saxlandıqdan sonra ana səhifədə və Animation səhifəsində görünəcək.</p></div>}
  {preview&&<AnimationPlayer key={JSON.stringify(preview)} videos={preview} preview/>}
  <AlertDialog open={!!remove} onOpenChange={open=>{if(!open)setRemove(null);}}><AlertDialogContent><AlertDialogTitle>Video siyahıdan çıxarılsın?</AlertDialogTitle><AlertDialogDescription>{remove?.title} yadda saxladıqdan sonra ana səhifədən və Animation səhifəsindən çıxarılacaq. Yüklənmiş fayl silinmir.</AlertDialogDescription><AlertDialogCancel>Ləğv et</AlertDialogCancel><AlertDialogAction onClick={()=>{change(list=>{const i=list.findIndex(v=>v.id===remove?.id);if(i>=0)list.splice(i,1);});setPreview(null);setRemove(null);}}>Siyahıdan çıxar</AlertDialogAction></AlertDialogContent></AlertDialog>
 </section>;
}
