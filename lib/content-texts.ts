import type {SiteContent} from './content-types';
import interfaceSources from './interface-text-sources.json';
import {animationVideos} from './animation-playlist';
export type TextLocale='en'|'az'|'ru'|'tr';
export type LocalizedField={source:string;text:string};
export type SiteTexts={ui:Record<string,Partial<Record<TextLocale,string>>>;fields:Record<string,Partial<Record<Exclude<TextLocale,'en'>,LocalizedField>>>};
export type TextField={key:string;group:string;label:string;source:string;max:number;set:(value:string)=>void};
export const textLocales=['en','az','ru','tr'] as const;
export const uiSources=interfaceSources;
export function contentTextFields(data:SiteContent):TextField[]{
 const result:TextField[]=[];
 const add=(key:string,group:string,label:string,obj:object,property:string,max=2000)=>{const target=obj as Record<string,unknown>;result.push({key,group,label,source:String(target[property]??''),max,set:value=>{target[property]=value;}});};
 const settings=data.settings;
 for(const [key,label,max] of [['name','Studiya adı',100],['founder','Müəllif',100],['introduction','Qısa təqdimat',1000]] as const)add('settings:'+key,'Ana səhifə',label,settings,key,max);
 settings.tagline.forEach((_,i)=>add('settings:tagline:'+i,'Ana səhifə','Əsas başlıq — sətir '+(i+1),settings.tagline,String(i),120));
 settings.services.forEach((item,i)=>{for(const [key,label,max] of [['title','Ad',150],['text','Təsvir',1000],['tag','Etiket',100],['audience','Müştəri növü',500],['deliverables','Təhvil verilən işlər',1000]] as const)add('service:'+i+':'+key,'Xidmətlər',item.title+' / '+label,item,key,max);});
 for(const [key,label,max] of [['role','Peşə başlığı',2000],['experience','Təcrübə',2000],['location','Məkan',2000],['introduction','Təqdimat',2000],['biography','Bioqrafiya',6000],['markets','Regionlar',2000],['expertise','İxtisaslaşma',2000],['education','Təhsil',2000],['collaboration','Əməkdaşlıq',2000]] as const)add('profile:'+key,'Haqqımda',label,data.profile,key,max);
 data.projects.forEach(item=>{
  const prefix='project:'+(item.id||'project-'+item.slug)+':';
  for(const [key,label,max] of [['title','Ad',150],['type','Növ',200],['description','Təsvir',5000],['location','Məkan',200],['client','Müştəri',200],['credit','Memar / dizayner',300],['seoTitle','SEO başlığı',150],['seoDescription','SEO təsviri',320]] as const)add(prefix+key,'Layihələr',item.title+' / '+label,item,key,max);
  item.services?.forEach((_,i)=>add(prefix+'services:'+i,'Layihələr',item.title+' / Xidmət '+(i+1),item.services!,String(i),150));
  item.blocks?.forEach(block=>{
   if(['heading','text','video'].includes(block.type))add(prefix+'block:'+block.id+':text','Layihə blokları',item.title+' / '+block.type,block,'text',15000);
   block.images.forEach((image,i)=>{for(const key of ['alt','caption','credit'])add(prefix+'block:'+block.id+':image:'+i+':'+key,'Layihə blokları',item.title+' / Şəkil '+(i+1)+' / '+key,image,key,({alt:400,caption:1000,credit:300} as Record<string,number>)[key]);});
  });
 });
 data.collections.forEach(item=>{for(const [key,label,max] of [['description','Təsvir',2000],['scope','İş növləri',500]] as const)add('collection:'+item.slug+':'+key,'Kateqoriyalar',item.category+' / '+label,item,key,max);});
 data.journal.forEach(item=>{for(const [key,label,max] of [['title','Başlıq',160],['excerpt','Qısa təsvir',600],['body','Tam mətn',15000],['topic','Mövzu',80]] as const)add('post:'+item.slug+':'+key,'Blog',item.title+' / '+label,item,key,max);});
 data.testimonials.forEach(item=>{for(const [key,label,max] of [['name','Müəllif',150],['role','Şirkət / rol',200],['quote','Rəy',2000]] as const)add('review:'+item.id+':'+key,'Rəylər',item.name+' / '+label,item,key,max);});
 animationVideos(data).forEach(item=>{for(const [key,label,max] of [['title','Ad',150],['kind','Kateqoriya',100],['description','Təsvir',1000]] as const){
  const field:TextField={key:'video:'+item.id+':'+key,group:'Animation',label:item.title+' / '+label,source:item[key],max,set:value=>{data.animations??=structuredClone(animationVideos(data));const target=data.animations.find(v=>v.id===item.id);if(target)target[key]=value;}};result.push(field);
 }});
 return result;
}
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
export function validateSiteTexts(raw:unknown,data:SiteContent):SiteTexts|undefined{
 if(raw===undefined)return undefined;
 if(!object(raw)||!object(raw.ui)||!object(raw.fields))throw Error('Dil məzmunu düzgün deyil.');
 if(Object.keys(raw.ui).length>uiSources.length||Object.keys(raw.fields).length>12000)throw Error('Dil sahələrinin sayı həddi keçir.');
 const result:SiteTexts={ui:{},fields:{}},allowed=new Map(contentTextFields(data).map(field=>[field.key,field]));
 for(const [source,values] of Object.entries(raw.ui)){
  if(!uiSources.includes(source)||!object(values))throw Error('İnterfeys mətni düzgün deyil.');
  const entry:Partial<Record<TextLocale,string>>={};
  for(const [locale,value] of Object.entries(values)){if(!textLocales.includes(locale as TextLocale)||typeof value!=='string'||value.length>15000)throw Error('Dil və ya mətn ölçüsü düzgün deyil.');if(source.includes('{count}')&&!value.includes('{count}'))throw Error('Say üçün {count} hissəsini saxlayın.');entry[locale as TextLocale]=value;}
  result.ui[source]=entry;
 }
 for(const [key,values] of Object.entries(raw.fields)){
  if(!object(values))throw Error('Tərcümə sahəsi düzgün deyil.');
  const field=allowed.get(key);if(!field)continue; // Removed items cannot retain public translations.
  const entry:SiteTexts['fields'][string]={};
  for(const [locale,value] of Object.entries(values)){
   if(!['az','ru','tr'].includes(locale)||!object(value)||typeof value.source!=='string'||typeof value.text!=='string'||value.source.length>15000||value.text.length>field.max)throw Error('Tərcümə sahəsinin dili və ya ölçüsü düzgün deyil.');
   entry[locale as 'az'|'ru'|'tr']={source:value.source,text:value.text};
  }
  result.fields[key]=entry;
 }
 return result;
}
/** Apply the same visibility rules as the English content, including translation source copies. */
export function publicSiteTexts(texts:SiteTexts|undefined,data:SiteContent):SiteTexts|undefined{
 if(!texts)return undefined;const keys=new Set(contentTextFields(data).map(field=>field.key));
 return {ui:texts.ui,fields:Object.fromEntries(Object.entries(texts.fields).filter(([key])=>keys.has(key)))};
}
/** Keep blog translations with the article when its URL is edited. */
export function reconcileSiteTexts(before:SiteContent,after:SiteContent){
 if(!after.texts)return;
 before.journal.forEach((post,i)=>{const next=after.journal[i];if(!next||next.slug===post.slug||after.journal.some(p=>p.slug===post.slug)||post.title!==next.title||post.body!==next.body)return;
 const prefix='post:'+post.slug+':';for(const key of Object.keys(after.texts!.fields))if(key.startsWith(prefix)){after.texts!.fields['post:'+next.slug+':'+key.slice(prefix.length)]=after.texts!.fields[key];delete after.texts!.fields[key];}
 });
}
