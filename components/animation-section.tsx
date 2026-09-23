'use client';
import {fieldText,t,languageTag} from '@/lib/i18n';
import {useEffect,useRef,useState} from 'react';
import {Pause,Play,ArrowUpRight} from 'lucide-react';
import {animationVideos,videoUrl,type AnimationVideo} from '@/lib/animation-playlist';
import {useSiteContent} from './content-provider';
const durationLabel=(seconds:number)=>new Intl.NumberFormat(languageTag(),{maximumFractionDigits:2}).format(seconds)+' '+t('sec.');
function MotionClip({clip}:{clip:AnimationVideo}){
 const video=useRef<HTMLVideoElement>(null);
 const [playing,setPlaying]=useState(false),[failed,setFailed]=useState(false);
 useEffect(()=>{
  const element=video.current;if(!element)return;
  const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)element.pause();},{threshold:.1});
  observer.observe(element);
  const hide=()=>{if(document.hidden)element.pause();};
  document.addEventListener('visibilitychange',hide);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',hide);};
 },[]);
 const toggle=async()=>{
  const element=video.current;if(!element)return;
  if(!element.paused){element.pause();return;}
  try{await element.play();setFailed(false);}catch{setFailed(true);}
 };
 return <article className="motion-card"><div className="motion-frame">
  <video ref={video} src={videoUrl(clip.src)} poster={clip.poster||undefined} preload="none" muted playsInline loop aria-label={fieldText(clip.title,'video:'+clip.id+':title')+' — '+durationLabel(clip.duration)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setFailed(true)}/>
  <span className="motion-duration">{t(durationLabel(clip.duration))} / {fieldText(clip.kind,'video:'+clip.id+':kind')}</span>
  <button className="motion-toggle" onClick={toggle} aria-label={t(playing?'Pause':'Play')+' '+fieldText(clip.title,'video:'+clip.id+':title')} aria-pressed={playing}>{playing?<Pause size={19}/>:<Play size={19}/>}<span>{t(playing?'Pause':'Play film')}</span></button>
 </div><div className="motion-caption"><h3>{fieldText(clip.title,'video:'+clip.id+':title')}</h3><p>{fieldText(clip.description,'video:'+clip.id+':description')}</p></div>{failed&&<a className="text-link" href={videoUrl(clip.src)}>{t("Open the film ↗")}</a>}</article>;
}
export function AnimationSection({compact=false}:{compact?:boolean}){
 const clips=animationVideos(useSiteContent());
 return <section id="animation" className={'section animation-section'+(compact?' animation-preview':'')}>
 <div className="section-title"><div><p className="eyebrow">{t("THE STUDIO / IN MOTION")}</p>{compact?<h2>{t("A new perspective in motion.")}</h2>:<h1>{t("Architecture in motion.")}</h1>}</div><div><p>{t("Short films of spaces, systems and changing light.")}</p>{compact&&<a className="text-link" href="/animation">{t("Explore animation")} <ArrowUpRight size={19}/></a>}</div></div>
 <div className="motion-grid">{clips.map(clip=><MotionClip key={clip.id} clip={clip}/>)}</div>
 </section>;
}
