'use client';
import {useMemo,useState} from 'react';
import type {SiteContent} from '@/lib/content-types';
import {contentTextFields,uiSources,type TextLocale,type TextField} from '@/lib/content-texts';
import {translateText,translatedField} from '@/lib/text-translation';
const locales=[['en','English'],['az','Azərbaycan'],['ru','Русский'],['tr','Türkçe']] as const;
type Row={key:string;group:string;label:string;source:string;max:number;field?:TextField};
export function AdminLanguages({data,edit}:{data:SiteContent;edit:(fn:(data:SiteContent)=>void)=>void}){
 const [locale,setLocale]=useState<TextLocale>('az'),[group,setGroup]=useState('Ana səhifə'),[search,setSearch]=useState(''),[page,setPage]=useState(0);
 const rows=useMemo<Row[]>(()=>[...contentTextFields(data).map(field=>({...field,field})),...uiSources.map(source=>({key:'ui:'+source,group:'İnterfeys',label:source,source,max:15000}))],[data]);
 const groups=Array.from(new Set(rows.map(row=>row.group)));
 const value=(row:Row)=>row.field?translatedField(row.source,row.key,locale,data.texts):translateText(row.source,locale,data.texts?.ui);
 const matches=rows.filter(row=>(group==='Hamısı'||row.group===group)&&(!search||(row.label+' '+row.source+' '+value(row)).toLocaleLowerCase().includes(search.toLocaleLowerCase())));
 const pages=Math.max(1,Math.ceil(matches.length/20)),current=Math.min(page,pages-1);
 function change(row:Row,text:string){edit(d=>{
  if(row.field&&locale==='en'){contentTextFields(d).find(field=>field.key===row.key)?.set(text);return;}
  d.texts??={ui:{},fields:{}};
  if(row.field){d.texts.fields[row.key]??={};d.texts.fields[row.key][locale as 'az'|'ru'|'tr']={source:row.source,text};}
  else {d.texts.ui[row.source]??={};d.texts.ui[row.source][locale]=text;}
 });}
 function reset(row:Row){edit(d=>{if(!d.texts)return;if(row.field&&locale!=='en'){delete d.texts.fields[row.key]?.[locale];if(!Object.keys(d.texts.fields[row.key]||{}).length)delete d.texts.fields[row.key];}else if(!row.field){delete d.texts.ui[row.source]?.[locale];if(!Object.keys(d.texts.ui[row.source]||{}).length)delete d.texts.ui[row.source];}});}
 return <section className="admin-home-editor admin-language-editor"><h2>Dillər və mətnlər</h2><p className="admin-hint">Bölməni və dili seçib mətni dəyişin. Sonra yuxarıdakı “Dəyişiklikləri saxla” düyməsinə basın. English bölməsində edilən dəyişikliklər əsas redaktorlarla eyni məzmuna yazılır.</p>
 <div className="admin-language-toolbar"><label>Redaktə dili<select aria-label="Redaktə dili" value={locale} onChange={e=>{setLocale(e.target.value as TextLocale);setPage(0)}}>{locales.map(([code,name])=><option key={code} value={code}>{code.toUpperCase()} — {name}</option>)}</select></label><label>Bölmə<select aria-label="Mətn bölməsi" value={group} onChange={e=>{setGroup(e.target.value);setPage(0)}}><option>Hamısı</option>{groups.map(group=><option key={group}>{group}</option>)}</select></label><label>Mətn axtar<input value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} placeholder="Başlıq, layihə adı və ya mətn"/></label></div>
 <p className="admin-hint">İnterfeys bölməsində menyular, düymələr, başlıqlar və kateqoriya adları var. Şəkillər, videolar, ünvanlar və sıralama bütün dillər üçün ortaqdır. Hazır tərcümə olmayan yeni mətn ingiliscə görünür; onu burada yaza bilərsiniz.</p>
 <p aria-live="polite">{matches.length} mətn · {locales.find(([code])=>code===locale)?.[1]}</p>
 <div className="admin-language-rows">{matches.slice(current*20,current*20+20).map(row=>{
 const saved=row.field&&locale!=='en'?data.texts?.fields[row.key]?.[locale]:undefined;
 const customized=row.field?!!saved:data.texts?.ui[row.source]?.[locale]!==undefined;
 const stale=saved&&saved.source!==row.source;
 return <article className="admin-language-row" key={row.key} data-text-key={row.key}><div className="admin-language-row-heading"><h3>{row.label}</h3><span>{row.group}</span></div>
 {locale!=='en'&&<div className="admin-language-source"><span>English — əsas mətn</span><p>{row.source||'Əsas mətn hələ yazılmayıb.'}</p></div>}
 <label>{locale.toUpperCase()} — {row.field&&locale==='en'?'əsas mətn':'görünən mətn'}<textarea lang={locale} dir="ltr" aria-label={locale.toUpperCase()+' — '+row.label} value={value(row)} rows={row.source.length>400||row.source.includes('\n')?7:3} maxLength={row.max} onChange={e=>change(row,e.target.value)}/></label>
 <div className="admin-language-row-actions"><small>{stale?'İngiliscə mətn dəyişib — tərcüməni nəzərdən keçirin.':customized?'Fərdi mətn':locale==='en'&&row.field?'Əsas məzmun':locale!=='en'&&value(row)===row.source?'Əsas mətn göstərilir':'Hazır mətn'} · {value(row).length}/{row.max}</small>{customized&&<button className="text-link" type="button" onClick={()=>reset(row)}>Hazır mətnə qaytar</button>}</div>{row.source.includes('{count}')&&<p className="admin-hint">Sayın göstərilməsi üçün {'{count}'} hissəsini saxlayın.</p>}
 </article>;
 })}</div>{!matches.length&&<p>Mətn tapılmadı. Axtarışı və ya bölməni dəyişin.</p>}
 <div className="admin-language-pagination"><button className="outline-button" type="button" disabled={current===0} onClick={()=>setPage(current-1)}>← Əvvəlki</button><span>{current+1} / {pages}</span><button className="outline-button" type="button" disabled={current+1>=pages} onClick={()=>setPage(current+1)}>Növbəti →</button></div>
 </section>;
}
