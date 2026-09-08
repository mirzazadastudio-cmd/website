'use client';
import {useEffect,useRef,useState} from 'react';
import {Pause,Play,ArrowUpRight} from 'lucide-react';

export function AnimationBanner(){
 const section=useRef<HTMLElement>(null),video=useRef<HTMLVideoElement>(null);
 const manual=useRef<boolean|null>(null),sync=useRef(()=>{});
 const [playing,setPlaying]=useState(false);
 useEffect(()=>{
  const element=video.current,container=section.current;if(!element||!container)return;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false,disposed=false;
  const update=()=>{
   const shouldPlay=visible&&!document.hidden&&(manual.current??!motion.matches);
   if(shouldPlay){void element.play().then(()=>{if(disposed||document.hidden||!visible)element.pause();}).catch(()=>{});}
   else element.pause();
  };
  sync.current=update;
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();},{threshold:0});
  observer.observe(container);motion.addEventListener('change',update);document.addEventListener('visibilitychange',update);
  return()=>{disposed=true;observer.disconnect();motion.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);element.pause();sync.current=()=>{};};
 },[]);
 return <section ref={section} className="animation-banner" aria-label="Architecture in motion">
  <video ref={video} src="/animations/studio-loop.mp4" poster="/animations/studio-loop.webp" muted playsInline loop preload="metadata" aria-label="Four architectural films with soft transitions" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)}/>
  <div className="animation-banner-caption"><a href="/animation"><span>THE STUDIO / IN MOTION</span><span>Four perspectives. One continuous story. <ArrowUpRight size={19}/></span></a><button type="button" onClick={()=>{manual.current=video.current?.paused??true;sync.current();}} aria-label={playing?'Pause background animation':'Play background animation'} aria-pressed={playing}>{playing?<Pause size={17}/>:<Play size={17}/>}<span>{playing?'Pause':'Play'}</span></button></div>
 </section>;
}
