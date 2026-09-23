'use client';
import {t} from '@/lib/i18n';
import { useState } from 'react';
import {RenderImage} from '@/components/render-image';
import { ArrowLeft, ArrowRight, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function ProjectGallery({images,title}:{images:string[];title:string}) {
 const [active,setActive]=useState<number|null>(null);
 const move=(delta:number)=>setActive(i=>i===null?null:(i+delta+images.length)%images.length);
 return <><div className="detail-gallery" data-protected-media>{images.map((src,i)=><button key={src} className={`gallery-image ${i===0?'gallery-lead':''}`} onClick={()=>setActive(i)} aria-label={t(`Enlarge ${title}, view ${i+1}`)}><RenderImage src={src} alt={t(`${title} — architectural visualization, view ${i+1}`)} loading={i===0?'eager':'lazy'}/><span><Maximize2 size={18}/> {t("View")} {String(i+1).padStart(2,'0')}</span></button>)}</div><Dialog open={active!==null} onOpenChange={open=>{if(!open)setActive(null)}}><DialogContent className="lightbox" data-protected-media onKeyDown={e=>{if(e.key==='ArrowRight')move(1);if(e.key==='ArrowLeft')move(-1)}}><DialogTitle>{t(title)}</DialogTitle><DialogDescription>{t("Use the arrows to explore. Press Escape to close.")}</DialogDescription>{active!==null&&<RenderImage fit="cover" src={images[active]} alt={t(`${title}, view ${active+1}`)}/>}<div className="lightbox-controls"><button onClick={()=>move(-1)} aria-label={t("Previous image")}><ArrowLeft/></button><span>{(active??0)+1} / {images.length}</span><button onClick={()=>move(1)} aria-label={t("Next image")}><ArrowRight/></button></div></DialogContent></Dialog></>;
}
