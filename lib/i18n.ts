import {useSyncExternalStore} from 'react';
import {translateText,translatedField} from './text-translation';
import type {SiteTexts} from './content-texts';
let activeTexts:SiteTexts|undefined;
export function setActiveTexts(texts?:SiteTexts){activeTexts=texts;}
export const languages=[{code:'en',name:'English'},{code:'az',name:'Azərbaycan'},{code:'ru',name:'Русский'},{code:'tr',name:'Türkçe'}] as const;
export type Locale=typeof languages[number]['code'];
const storageKey='mirzazada:language';
let locale:Locale='en';
const listeners=new Set<()=>void>();
const valid=(value:unknown):value is Locale=>languages.some(language=>language.code===value);
export function initializeLanguage(){if(typeof window==='undefined')return;try{const saved=localStorage.getItem(storageKey);if(valid(saved))locale=saved;}catch{}document.documentElement.lang=locale;}
export function setLanguage(next:Locale){if(!valid(next))return;locale=next;if(typeof document!=='undefined')document.documentElement.lang=next;try{localStorage.setItem(storageKey,next);}catch{}listeners.forEach(listener=>listener());}
function subscribe(listener:()=>void){listeners.add(listener);const sync=(event:StorageEvent)=>{if(event.key===storageKey&&valid(event.newValue)){locale=event.newValue;document.documentElement.lang=locale;listeners.forEach(fn=>fn());}};if(typeof window!=='undefined')window.addEventListener('storage',sync);return()=>{listeners.delete(listener);if(typeof window!=='undefined')window.removeEventListener('storage',sync);};}
export function useLanguage(){return useSyncExternalStore(subscribe,()=>locale,()=>'en' as Locale);}
export const languageTag=()=>({en:'en-GB',az:'az-AZ',ru:'ru-RU',tr:'tr-TR'}[locale]);
/** Plain text only: React escapes edited copy; source IDs and URLs never change. */
export function t<T>(value:T):T{if(typeof value!=="string")return value;const trimmed=value.trim();if(!trimmed)return value;return (value.slice(0,value.indexOf(trimmed))+translateText(trimmed,locale,activeTexts?.ui)+value.slice(value.indexOf(trimmed)+trimmed.length)) as T;}
export function fieldText(value:string|undefined,key:string):string{return translatedField(value||"",key,locale,activeTexts);}
