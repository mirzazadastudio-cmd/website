import type {Project} from './projects.ts';
import {defaultFrame,videoEmbed,type Frame,type ProjectBlock} from './project-blocks.ts';
const text=(v:unknown,max:number)=>{if(typeof v!=='string'||v.length>max)throw Error('Layihə mətni düzgün deyil.');return v;};
export function validFrame(value:unknown):Frame{if(!value)return {...defaultFrame};const f=value as Frame;if(![f.x,f.y,f.zoom].every(Number.isFinite)||f.x<0||f.x>100||f.y<0||f.y>100||f.zoom<1||f.zoom>3)throw Error('Kadr fokusu düzgün deyil.');return {x:f.x,y:f.y,zoom:f.zoom};}
export function validateProjectDetails(project:Project,image:(value:unknown)=>string){
 const status=project.status||'published';if(!['draft','published','archived'].includes(status))throw Error('Layihə statusu düzgün deyil.');
 const id=text(project.id||'project-'+project.slug,100);if(!/^[a-zA-Z0-9_-]+$/.test(id))throw Error('Layihə identifikatoru düzgün deyil.');
 const year=text(project.year||'',4);if(year&&!/^(19|20)\d{2}$/.test(year))throw Error('İli dörd rəqəmlə yazın.');
 const services=project.services||[];if(!Array.isArray(services)||services.length>15)throw Error('Xidmət siyahısı düzgün deyil.');
 const permission=project.displayPermission||'unreviewed';if(!['unreviewed','confirmed','confidential'].includes(permission))throw Error('Paylaşma statusu düzgün deyil.');if(permission==='confidential'&&status==='published')throw Error('Məxfi layihəni yayımlamaq olmaz. Qaralama seçin.');
 let blocks:ProjectBlock[]|undefined;
 if(project.blocks!==undefined){if(!Array.isArray(project.blocks)||project.blocks.length>100)throw Error('Ən çox 100 blok əlavə edilə bilər.');if(status==='published'&&project.blocks.length===0)throw Error('Yayım üçün ən azı bir məzmun bloku əlavə edin.');const ids=new Set<string>();blocks=project.blocks.map(block=>{
  const bid=text(block.id,100);if(!/^[\w-]+$/.test(bid)||ids.has(bid))throw Error('Blok təkrarlanır.');ids.add(bid);
  if(!['image','columns','text','heading','video','spacer'].includes(block.type)||!['full','contained'].includes(block.layout)||!['small','medium','large'].includes(block.spacing)||!['h2','h3'].includes(block.level))throw Error('Blok növü düzgün deyil.');
  if(!Array.isArray(block.images)||block.images.length>3)throw Error('Blokda ən çox üç şəkil ola bilər.');
  const images=block.images.map(item=>({src:item.src?image(item.src):'',alt:text(item.alt||'',400),caption:text(item.caption||'',1000),credit:text(item.credit||'',300),frame:validFrame(item.frame)}));
  const url=text(block.url||'',500);if(url&&!videoEmbed(url))throw Error('Video üçün YouTube və ya Vimeo ünvanı istifadə edin.');
  const body=text(block.text||'',15000);
  if(status==='published'){
   if(block.type==='image'&&(images.length!==1||!images[0].src))throw Error('Şəkil blokuna render seçin.');
   if(block.type==='columns'&&(images.length<2||images.some(item=>!item.src)))throw Error('Sütun blokuna iki və ya üç render seçin.');
   if(['heading','text'].includes(block.type)&&!body.trim())throw Error('Boş mətn blokunu doldurun və ya çıxarın.');
   if(block.type==='video'&&!url)throw Error('Video ünvanını əlavə edin.');
  }
  return {id:bid,type:block.type,layout:block.layout,images,text:body,level:block.level,url,poster:block.poster?image(block.poster):'',spacing:block.spacing,createdAt:text(block.createdAt||'',40),updatedAt:text(block.updatedAt||'',40)};
 });}
 return {id,status,location:text(project.location||'',200),year,client:text(project.client||'',200),credit:text(project.credit||'',300),services:services.map(v=>text(v,150)),coverFrame:validFrame(project.coverFrame),blocks,createdAt:text(project.createdAt||'',40),updatedAt:text(project.updatedAt||'',40),publishedAt:text(project.publishedAt||'',40),seoTitle:text(project.seoTitle||'',150),seoDescription:text(project.seoDescription||'',320),displayPermission:permission};
}
