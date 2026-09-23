'use client';
import {useEffect,useRef,useState} from 'react';
import {Pause,Play,ArrowUpRight} from 'lucide-react';
import {animationVideos,videoUrl,durationLabel,type AnimationVideo} from '@/lib/animation-playlist';
import {useSiteContent} from './content-provider';
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
  <video ref={video} src={videoUrl(clip.src)} poster={clip.poster||undefined} preload="none" muted playsInline loop aria-label={clip.title+' — '+durationLabel(clip.duration)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setFailed(true)}/>
  <span className="motion-duration">{durationLabel(clip.duration)} / {clip.kind}</span>
  <button className="motion-toggle" onClick={toggle} aria-label={(playing?'Pause ':'Play ')+clip.title} aria-pressed={playing}>{playing?<Pause size={19}/>:<Play size={19}/>}<span>{playing?'Pause':'Play film'}</span></button>
 </div><div className="motion-caption"><h3>{clip.title}</h3><p>{clip.description}</p></div>{failed&&<a className="text-link" href={videoUrl(clip.src)}>Open the film ↗</a>}</article>;
}
export function AnimationSection({compact=false}:{compact?:boolean}){
 const clips=animationVideos(useSiteContent());
 return <section id="animation" className={'section animation-section'+(compact?' animation-preview':'')}>
 <div className="section-title"><div><p className="eyebrow">THE STUDIO / IN MOTION</p>{compact?<h2>A new perspective in motion.</h2>:<h1>Architecture in motion.</h1>}</div><div><p>Short films of spaces, systems and changing light.</p>{compact&&<a className="text-link" href="/animation">Explore animation <ArrowUpRight size={19}/></a>}</div></div>
 <div className="motion-grid">{clips.map(clip=><MotionClip key={clip.id} clip={clip}/>)}</div>
 </section>;
}
