'use client';
import {useEffect,useRef,useState} from 'react';
import {Pause,Play,ArrowUpRight} from 'lucide-react';
import {FADE_SECONDS,videoUrl,type AnimationVideo} from '@/lib/animation-playlist';

// Two persistent video layers permit an overlap, including last-to-first.
export function AnimationPlayer({videos,preview=false}:{videos:AnimationVideo[];preview?:boolean}){
 const section=useRef<HTMLElement>(null),layers=useRef<(HTMLVideoElement|null)[]>([]);
 const manual=useRef<boolean|null>(null),sync=useRef(()=>{});
 const [playing,setPlaying]=useState(false),[failed,setFailed]=useState(false);
 const signature=JSON.stringify(videos);
 useEffect(()=>{
  const clips=JSON.parse(signature) as AnimationVideo[];
  const container=section.current,a=layers.current[0],b=layers.current[1];
  if(!container||!a||!b||!clips.length)return;
  if(!preview&&window.location.hash==='#animations')container.scrollIntoView({behavior:'instant',block:'start'});
  const players=[a,b],motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let active=0,index=0,visible=false,disposed=false,frame=0,mixing=false,first=true;
  const broken=new Set<number>(),pending=new Set<HTMLVideoElement>();
  const shouldPlay=()=>visible&&!document.hidden&&(manual.current??(!preview&&!motion.matches));
  const load=(slot:number,clipIndex:number)=>{
   const v=players[slot],clip=clips[clipIndex];v.pause();v.dataset.clip=String(clipIndex);v.style.opacity='0';v.src=videoUrl(clip.src);v.poster=clip.poster;v.load();
  };
  const play=(v:HTMLVideoElement)=>{
   if(!v.paused||pending.has(v))return;
   pending.add(v);void v.play().then(()=>{if(disposed||!shouldPlay())v.pause();}).catch(()=>{if(!disposed&&v.error)broken.add(Number(v.dataset.clip));}).finally(()=>pending.delete(v));
  };
  const nextIndex=()=>{for(let n=1;n<=clips.length;n++){const candidate=(index+n)%clips.length;if(!broken.has(candidate))return candidate;}return -1;};
  const update=()=>{if(shouldPlay()){play(players[active]);if(mixing)play(players[1-active]);}else players.forEach(v=>v.pause());setPlaying(shouldPlay()&&!players[active].paused);};
  sync.current=update;setFailed(false);load(0,0);load(1,clips.length>1?1:0);a.style.opacity='1';
  const tick=()=>{
   if(disposed)return;
   const current=players[active],next=players[1-active];
   if(current.error)broken.add(index);
   const candidate=nextIndex();
   if(candidate<0){setFailed(true);players.forEach(v=>v.pause());setPlaying(false);return;}
   if(!mixing&&Number(next.dataset.clip)!==candidate)load(1-active,candidate);
   if(next.error){broken.add(Number(next.dataset.clip));if(mixing){mixing=false;first=false;current.style.opacity='1';next.style.opacity='0';}}
   if(shouldPlay()){
    if(broken.has(index)||current.ended||(Number.isFinite(current.duration)&&current.duration-current.currentTime<=FADE_SECONDS)){
     if(next.readyState>=3&&!next.error){mixing=true;play(next);}
    }
    if(mixing){
     const amount=Math.min(1,next.currentTime/FADE_SECONDS);
     current.style.opacity=String(1-amount);next.style.opacity=String(amount);
     if(amount>=1){
      current.pause();active=1-active;index=Number(next.dataset.clip);mixing=false;first=false;
      const upcoming=nextIndex();if(upcoming>=0)load(1-active,upcoming);
     }
    }else if(first&&!current.paused)current.style.opacity=String(Math.min(1,current.currentTime/FADE_SECONDS));
   }
   frame=requestAnimationFrame(tick);
  };
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();},{threshold:0});
  observer.observe(container);motion.addEventListener('change',update);document.addEventListener('visibilitychange',update);
  const onPlay=()=>{setPlaying(true);setFailed(false);};
  const onPause=()=>{setPlaying(players.some(v=>!v.paused));};
  players.forEach(v=>{v.addEventListener('playing',onPlay);v.addEventListener('pause',onPause);});
  frame=requestAnimationFrame(tick);
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();motion.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);players.forEach(v=>{v.removeEventListener('playing',onPlay);v.removeEventListener('pause',onPause);v.pause();v.removeAttribute('src');v.load();});sync.current=()=>{};};
 },[signature,preview]);
 if(!videos.length)return null;
 return <section id={preview?undefined:"animations"} ref={section} className="animation-banner" aria-label={preview?'Video keçidlərinin önbaxışı':'Architecture in motion'}>
  {[0,1].map(slot=><video key={slot} ref={v=>{layers.current[slot]=v;}} muted playsInline preload="auto" poster={slot===0?videos[0].poster:undefined} style={{opacity:slot===0?1:0}} aria-hidden="true"/>)}
  <div className="animation-banner-caption"><a href="/animation"><span>{preview?'ÖNBAXIŞ / 0,5 SAN. KEÇİD':'THE STUDIO / IN MOTION'}</span><span>{preview?'Saxlamadan əvvəl videoları izləyin.':'Perspectives in motion. One continuous story.'} <ArrowUpRight size={19}/></span></a><button type="button" disabled={failed} onClick={()=>{manual.current=!playing;sync.current();}} aria-label={playing?'Pause background animation':'Play background animation'} aria-pressed={playing}>{playing?<Pause size={17}/>:<Play size={17}/>}<span>{playing?(preview?'Dayandır':'Pause'):(preview?'Oynat':'Play')}</span></button></div>
  {failed&&<p className="animation-playback-error" role="status">Videolar yüklənmədi. Səhifəni yeniləyərək yenidən yoxlayın.</p>}
 </section>;
}
