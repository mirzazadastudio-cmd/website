import {mediaUrl} from '@/web/api';
'use client';
import {useMediaActions,useSiteContent} from './content-provider';
import type {CSSProperties,SyntheticEvent} from 'react';

export function RenderImage({src,alt,fit='cover',...props}:{src:string;alt:string;fit?:'cover'|'contain';className?:string;style?:CSSProperties;loading?:'lazy'|'eager';fetchPriority?:'high'|'low'|'auto';width?:number|string;height?:number|string;sizes?:string}){
 const content=useSiteContent(),crop=content.crops[src],media=content.media?.[src];
 const allowMediaActions=useMediaActions();
 const preventSave=(event:SyntheticEvent)=>{if(!allowMediaActions)event.preventDefault();};
 const protection={
  'data-protected-render':allowMediaActions?undefined:'',
  onContextMenu:preventSave,onDragStart:preventSave,onCopy:preventSave,onCut:preventSave,
 };
 if(!crop?.bottom)return <img width={media?.width} height={media?.height} src={mediaUrl(src)} srcSet={media?.variants.map(v=>`${mediaUrl(v.src)} ${v.width}w`).join(', ')} sizes={props.sizes||'(max-width: 700px) 100vw, 50vw'} alt={alt} {...props} {...protection} draggable={allowMediaActions} style={{...props.style,objectFit:fit}}/>;
 const height=crop.height*(1-crop.bottom);
 const position=String(props.style?.objectPosition||'50% 50%').split(' ');
 const align=(value:string|undefined)=>value==='0%'||value==='left'||value==='top'?'Min':value==='100%'||value==='right'||value==='bottom'?'Max':'Mid';
 return <svg className={props.className} style={props.style} {...protection} role="img" aria-label={alt} viewBox={`0 0 ${crop.width} ${height}`} preserveAspectRatio={`x${align(position[0])}Y${align(position[1])} ${fit==='contain'?'meet':'slice'}`}><title>{alt}</title><foreignObject width={crop.width} height={crop.height}><img src={mediaUrl(src)} srcSet={media?.variants.map(v=>`${mediaUrl(v.src)} ${v.width}w`).join(', ')} sizes={props.sizes||'(max-width: 700px) 100vw, 50vw'} width={crop.width} height={crop.height} alt="" loading={props.loading} fetchPriority={props.fetchPriority} draggable={allowMediaActions} style={{display:'block',width:'100%',height:'100%'}}/></foreignObject></svg>;
}
