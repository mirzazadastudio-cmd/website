'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

/** Browser deterrents only; publicly rendered media is never copy-proof. */
export function MediaProtection(){
 const pathname=usePathname();
 useEffect(()=>{
  if(pathname==='/admin'||pathname?.startsWith('/admin/'))return;
  const protectedSelector='[data-protected-render], [data-protected-media]';
  const editableSelector='input, textarea, select, [contenteditable]:not([contenteditable="false"])';
  const targetElement=(target:EventTarget|null)=>target instanceof Element?target:target instanceof Node?target.parentElement:null;
  const protects=(target:EventTarget|null)=>{
   const element=targetElement(target);
   if(!element||element.closest(editableSelector))return false;
   return !!element.closest(protectedSelector)||!!element.closest('a, button, figure')?.querySelector('[data-protected-render]');
  };
  const contextMenu=(event:MouseEvent)=>{if(protects(event.target))event.preventDefault();};
  const dragStart=(event:DragEvent)=>{
   if(!protects(event.target))return;
   event.preventDefault();
   event.dataTransfer?.clearData();
  };
  const clipboard=(event:ClipboardEvent)=>{
   if(targetElement(event.target)?.closest(editableSelector))return;
   if(protects(event.target)){event.preventDefault();return;}
   const selection=window.getSelection();
   if(!selection||selection.isCollapsed)return;
   const media=document.querySelectorAll('[data-protected-render]');
   for(let i=0;i<selection.rangeCount;i++){
    const range=selection.getRangeAt(i);
    if(Array.from(media).some(node=>range.intersectsNode(node))){event.preventDefault();return;}
   }
  };
  const keyDown=(event:KeyboardEvent)=>{
   // Keep arrows, Escape, zoom, assistive shortcuts and form editing available.
   if((event.ctrlKey||event.metaKey)&&!event.altKey&&event.key.toLowerCase()==='s')event.preventDefault();
  };
  document.addEventListener('contextmenu',contextMenu,true);
  document.addEventListener('dragstart',dragStart,true);
  document.addEventListener('copy',clipboard,true);
  document.addEventListener('cut',clipboard,true);
  document.addEventListener('keydown',keyDown,true);
  return()=>{
   document.removeEventListener('contextmenu',contextMenu,true);
   document.removeEventListener('dragstart',dragStart,true);
   document.removeEventListener('copy',clipboard,true);
   document.removeEventListener('cut',clipboard,true);
   document.removeEventListener('keydown',keyDown,true);
  };
 },[pathname]);
 return null;
}
