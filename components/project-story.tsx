'use client';
import {useState} from 'react';
import {RenderImage} from './render-image';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from './ui/dialog';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import type {Project} from '@/lib/projects';
import {newBlock,videoEmbed,type ProjectBlock,type BlockImage} from '@/lib/project-blocks';
export function legacyBlocks(project:Project):ProjectBlock[]{return project.images.map((src,i)=>({...newBlock('image',src,'image-'+i),createdAt:project.createdAt||'',updatedAt:project.updatedAt||'',images:[{src,alt:project.title+' — view '+(i+1),caption:'',credit:'',frame:{x:50,y:50,zoom:1}}]}));}
function VideoBlock({block}:{block:ProjectBlock}){const [loaded,setLoaded]=useState(false);const url=videoEmbed(block.url);if(!url)return null;return <div className="story-video">{loaded?<iframe src={url} title={block.text||'Project video'} allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:<button type="button" onClick={()=>setLoaded(true)}>{block.poster&&<RenderImage src={block.poster} alt=""/>}<span>Play project video ↗<small>Loads from {url.includes('vimeo')?'Vimeo':'YouTube'} when you choose to play.</small></span></button>}</div>;}
export function ProjectStory({project}:{project:Project}){
 const blocks=project.blocks??legacyBlocks(project);const images=blocks.flatMap(block=>block.images.filter(image=>image.src));const [active,setActive]=useState<number|null>(null);
 const move=(delta:number)=>setActive(value=>value===null?null:(value+delta+images.length)%images.length);
 const renderImage=(item:BlockImage,index:number,sizes='96vw')=><figure key={index}><button className="story-image" data-protected-media style={{overflow:'hidden'}} onClick={()=>setActive(images.indexOf(item))} aria-label={'Enlarge '+(item.alt||project.title)}><RenderImage src={item.src} alt={item.alt||project.title} fit="contain" sizes={sizes} loading={images[0]===item?'eager':'lazy'} fetchPriority={images[0]===item?'high':undefined} style={{objectPosition:`${item.frame.x}% ${item.frame.y}%`,transform:`scale(${item.frame.zoom})`,transformOrigin:`${item.frame.x}% ${item.frame.y}%`}}/></button>{(item.caption||item.credit)&&<figcaption>{item.caption}{item.credit&&<small>{item.credit}</small>}</figcaption>}</figure>;
 return <><div className="project-story">{blocks.map(block=><section key={block.id} className={`story-block story-${block.type} story-${block.layout} story-space-${block.spacing}`}>
 {block.type==='image'&&block.images.filter(image=>image.src).map((item,index)=>renderImage(item,index))}
 {block.type==='columns'&&<div className="story-columns" style={{gridTemplateColumns:`repeat(${Math.max(1,block.images.length)},minmax(0,1fr))`}}>{block.images.filter(image=>image.src).map((item,index)=>renderImage(item,index,`(max-width: 650px) 96vw, ${Math.floor(96/block.images.length)}vw`))}</div>}
 {block.type==='heading'&&(block.level==='h3'?<h3>{block.text}</h3>:<h2>{block.text}</h2>)}
 {block.type==='text'&&<div className="prose">{block.text.split(/\n\s*\n/).map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div>}
 {block.type==='video'&&<VideoBlock block={block}/>}
 </section>)}</div><Dialog open={active!==null} onOpenChange={open=>{if(!open)setActive(null)}}><DialogContent className="lightbox story-lightbox" data-protected-media onKeyDown={event=>{if(event.key==='ArrowRight')move(1);if(event.key==='ArrowLeft')move(-1)}}><DialogTitle>{project.title}</DialogTitle><DialogDescription>Use the arrows to explore. Press Escape to close.</DialogDescription>{active!==null&&images[active]&&<RenderImage src={images[active].src} alt={images[active].alt||project.title} fit="contain"/>}<div className="lightbox-controls"><button aria-label="Previous image" onClick={()=>move(-1)}><ArrowLeft/></button><span>{(active??0)+1} / {images.length}</span><button aria-label="Next image" onClick={()=>move(1)}><ArrowRight/></button></div></DialogContent></Dialog></>;
}
