import {mediaUrl} from '@/web/api';
'use client';
import {useMediaActions,useSiteContent} from './content-provider';
import {useCallback, type CSSProperties, type SyntheticEvent} from 'react';

// Retire image redirects cached while the custom domain certificate was changing.
// Keep this version stable so successful image responses remain cacheable.
function renderUrl(src:string){
 const url=mediaUrl(src);
 return url.startsWith('/images/')?url+(url.includes('?')?'&':'?')+'v=20260908-https':url;
}
export function RenderImage({src,alt,fit='cover',...props}:{src:string;alt:string;fit?:'cover'|'contain';className?:string;style?:CSSProperties;loading?:'lazy'|'eager';fetchPriority?:'high'|'low'|'auto';width?:number|string;height?:number|string;sizes?:string}){
 const content=useSiteContent(),crop=content.crops[src],media=content.media?.[src];
 const allowMediaActions=useMediaActions();
 const originalSrc=renderUrl(src);
 // A failed responsive candidate (including an old cached domain redirect) gets
 // one fresh request for the original. HTTPS certificate checks still apply.
 const retryImage=useCallback((image:HTMLImageElement)=>{
  if(image.dataset.fallbackFor===originalSrc)return;
  image.dataset.fallbackFor=originalSrc;
  const fresh=new URL(originalSrc,window.location.href);
  fresh.searchParams.set('_image_retry',Date.now().toString(36));
  image.removeAttribute('srcset');
  image.removeAttribute('sizes');
  image.src=fresh.href;
 },[originalSrc]);
 const imageRef=useCallback((image:HTMLImageElement|null)=>{
  // Static HTML can finish loading before React attaches its error listener.
  if(image?.complete&&!image.naturalWidth&&image.currentSrc)retryImage(image);
 },[retryImage]);
 const recover={ref:imageRef,onError:(event:SyntheticEvent<HTMLImageElement>)=>retryImage(event.currentTarget)};
 const preventSave=(event:SyntheticEvent)=>{if(!allowMediaActions)event.preventDefault();};
 const protection={
  'data-protected-render':allowMediaActions?undefined:'',
  onContextMenu:preventSave,onDragStart:preventSave,onCopy:preventSave,onCut:preventSave,
 };
 if(!crop?.bottom)return <img {...recover} width={media?.width} height={media?.height} src={renderUrl(src)} srcSet={media?.variants.map(v=>`${renderUrl(v.src)} ${v.width}w`).join(', ')} sizes={props.sizes||'(max-width: 700px) 100vw, 50vw'} alt={alt} {...props} {...protection} draggable={allowMediaActions} style={{...props.style,objectFit:fit}}/>;
 const height=crop.height*(1-crop.bottom);
 const position=String(props.style?.objectPosition||'50% 50%').split(' ');
 const align=(value:string|undefined)=>value==='0%'||value==='left'||value==='top'?'Min':value==='100%'||value==='right'||value==='bottom'?'Max':'Mid';
 return <svg className={props.className} style={props.style} {...protection} role="img" aria-label={alt} viewBox={`0 0 ${crop.width} ${height}`} preserveAspectRatio={`x${align(position[0])}Y${align(position[1])} ${fit==='contain'?'meet':'slice'}`}><title>{alt}</title><foreignObject width={crop.width} height={crop.height}><img {...recover} src={renderUrl(src)} srcSet={media?.variants.map(v=>`${renderUrl(v.src)} ${v.width}w`).join(', ')} sizes={props.sizes||'(max-width: 700px) 100vw, 50vw'} width={crop.width} height={crop.height} alt="" loading={props.loading} fetchPriority={props.fetchPriority} draggable={allowMediaActions} style={{display:'block',width:'100%',height:'100%'}}/></foreignObject></svg>;
}
