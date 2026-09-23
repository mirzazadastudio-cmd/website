'use client';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {GripVertical,ArrowUp,ArrowDown} from 'lucide-react';
import type {SiteContent} from '@/lib/content-types';
import {RenderImage} from './render-image';

type Drag={slug:string;target:string|null;x:number;y:number;pointer:number;element:HTMLElement};
export function AdminProjectOrder({data,edit}:{data:SiteContent;edit:(fn:(data:SiteContent)=>void)=>void}){
 const list=useRef<HTMLDivElement>(null),drag=useRef<Drag|null>(null),frame=useRef(0);
 const [active,setActive]=useState(''),[over,setOver]=useState(''),[status,setStatus]=useState('');
 const order=data.settings.homepage.projectOrder;
 const stop=()=>{
  const current=drag.current;drag.current=null;cancelAnimationFrame(frame.current);setActive('');setOver('');
  if(current?.element.hasPointerCapture(current.pointer))current.element.releasePointerCapture(current.pointer);
 };
 useEffect(()=>{
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&drag.current){stop();setStatus('Sıralama ləğv edildi.');}};
  window.addEventListener('keydown',escape);
  return()=>{window.removeEventListener('keydown',escape);cancelAnimationFrame(frame.current);};
 },[]);
 const move=(slug:string,to:number)=>{
  const from=order.indexOf(slug);if(from<0||to<0||to>=order.length||from===to)return;
  edit(d=>{const items=d.settings.homepage.projectOrder;const index=items.indexOf(slug);if(index<0)return;items.splice(index,1);items.splice(to,0,slug);});
  setStatus((data.projects.find(p=>p.slug===slug)?.title||'Layihə')+' '+(to+1)+'. sıraya keçirildi. Saxlamaq üçün yuxarıdakı düyməyə basın.');
 };
 const target=()=>{
  const current=drag.current;if(!current)return;
  const row=document.elementFromPoint(current.x,current.y)?.closest<HTMLElement>('[data-home-project]');
  current.target=row&&list.current?.contains(row)?row.dataset.homeProject||null:null;
  setOver(current.target||'');
 };
 const tick=()=>{
  const current=drag.current;if(!current)return;
  const edge=85;const delta=current.y<edge?-Math.ceil((edge-current.y)/5):current.y>innerHeight-edge?Math.ceil((current.y-innerHeight+edge)/5):0;
  if(delta){window.scrollBy({top:delta,behavior:'instant'});target();}
  frame.current=requestAnimationFrame(tick);
 };
 const start=(event:PointerEvent<HTMLElement>,slug:string)=>{
  if(event.button!==0||!event.isPrimary||drag.current)return;
  const button=(event.target as Element).closest('button');
  if(button&&!button.hasAttribute('data-home-grip'))return;
  // A touch can scroll the list normally; dragging starts on the grip.
  if(event.pointerType==='touch'&&!button?.hasAttribute('data-home-grip'))return;
  event.preventDefault();
  drag.current={slug,target:slug,x:event.clientX,y:event.clientY,pointer:event.pointerId,element:event.currentTarget};
  event.currentTarget.setPointerCapture(event.pointerId);setActive(slug);setOver(slug);
  frame.current=requestAnimationFrame(tick);
 };
 const finish=(event:PointerEvent<HTMLElement>,cancel=false)=>{
  const current=drag.current;if(!current||current.pointer!==event.pointerId)return;
  const destination=current.target;stop();
  if(!cancel&&destination)move(current.slug,order.indexOf(destination));
 };
 return <div className="admin-slideshow-order">
  <h3>Hərəkətli layihələrin sırası</h3>
  <p className="admin-hint" id="home-order-help">Layihənin şəklini, adını və ya tutacağını sol kliklə basılı saxlayıb istədiyiniz sıraya sürüşdürün. Telefonda tutacaqdan istifadə edin. Klaviatura ilə ↑ / ↓, ləğv etmək üçün Esc.</p>
  <div ref={list} className="home-order-list" onDragStart={e=>e.preventDefault()}>
   {order.map((slug,index)=>{const project=data.projects.find(p=>p.slug===slug);if(!project)return null;return <article key={slug} data-home-project={slug} className={'home-order-row'+(active===slug?' is-dragging':'')+(over===slug&&active!==slug?' is-drop-target':'')}
    onPointerDown={e=>start(e,slug)} onPointerMove={e=>{if(drag.current?.pointer!==e.pointerId)return;drag.current.x=e.clientX;drag.current.y=e.clientY;target();}}
    onPointerUp={e=>finish(e)} onPointerCancel={e=>finish(e,true)} onLostPointerCapture={()=>{if(drag.current)stop();}}>
    <button data-home-grip type="button" className="home-order-grip" aria-describedby="home-order-help" aria-label={project.title+' — sıralamaq üçün tutub sürüşdürün'} onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();move(slug,index+(e.key==='ArrowUp'?-1:1));}}}><GripVertical size={22}/></button>
    <span className="home-order-number">{String(index+1).padStart(2,'0')}</span>
    <RenderImage className="home-order-image" src={project.heroImage||project.coverImage||project.images[0]} alt="" sizes="80px" loading="lazy"/>
    <div className="home-order-title"><strong>{project.title}</strong><small>{project.category}{project.status==='draft'?' · Qaralama':project.status==='archived'?' · Arxiv':''}</small></div>
    <div className="home-order-actions"><button type="button" disabled={index===0} aria-label={project.title+' — əvvələ çək'} onClick={()=>move(slug,index-1)}><ArrowUp size={18}/></button><button type="button" disabled={index===order.length-1} aria-label={project.title+' — sona çək'} onClick={()=>move(slug,index+1)}><ArrowDown size={18}/></button></div>
   </article>;})}
  </div>
  <p className="admin-order-status" role="status">{status}</p>
  <p className="admin-hint">Layihələr bölməsində “Ana səhifədə göstər” düyməsi ilə lentə əlavə edin. Yeni sıra “Dəyişiklikləri saxla” düyməsindən sonra saytda görünəcək.</p>
 </div>;
}
