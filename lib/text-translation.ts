import dictionary from './translations.json';
import type {SiteTexts,TextLocale} from './content-texts';
const entries=dictionary as Record<string,string[]>;
const normalized=new Map(Object.keys(entries).map(key=>[key.toLocaleLowerCase('en'),key]));
export function translateText(source:string,locale:TextLocale,overrides?:SiteTexts['ui']):string{
 const key=Object.hasOwn(entries,source)?source:normalized.get(source.toLocaleLowerCase('en'));
 const custom=overrides?.[source]?.[locale]??(key?overrides?.[key]?.[locale]:undefined);
 if(custom!==undefined)return custom;
 if(key)return locale==='en'?source:entries[key][{az:0,ru:1,tr:2}[locale]];
 const phrase=(value:string)=>translateText(value,locale,overrides);
 const pattern=source.match(/^View all (\d+) projects$/);if(pattern)return phrase('View all {count} projects').replace('{count}',pattern[1]);
 const duration=source.match(/^([\d.,]+) san\.$/);if(duration)return duration[1]+' '+phrase('sec.');
 const count=source.match(/^(\d+) (projects?|PROJECTS)$/);if(count)return count[1]+' '+phrase(count[2]);
 if(/ · |\n| \/ /.test(source))return source.split(/( · |\n| \/ )/).map((part,index)=>index%2?part:phrase(part)).join('');
 const arrows=source.match(/^([←↑↗→]\s*)?(.+?)(\s*[←↑↗→])?$/);if(arrows&&(arrows[1]||arrows[3]))return (arrows[1]||'')+phrase(arrows[2])+(arrows[3]||'');
 for(const prefix of ['View ','Enlarge ','Play ','Pause '])if(source.startsWith(prefix))return phrase(prefix.trim())+' '+source.slice(prefix.length);
 return source;
}
export function translatedField(source:string,key:string,locale:TextLocale,texts?:SiteTexts):string{
 if(locale!=='en'){const custom=texts?.fields[key]?.[locale];if(custom)return custom.text;}
 return translateText(source,locale,texts?.ui);
}
