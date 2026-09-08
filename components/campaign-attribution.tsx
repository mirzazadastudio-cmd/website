'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
export function CampaignAttribution(){const pathname=usePathname();useEffect(()=>{if(pathname?.startsWith('/admin'))return;try{const query=new URLSearchParams(window.location.search);for(const key of ['utm_source','utm_medium','utm_campaign','utm_content']){const value=query.get(key);if(value)sessionStorage.setItem('studio:'+key,value.slice(0,300));}}catch{/* Attribution is optional when browser storage is unavailable. */}},[pathname]);return null;}
