import {renderToString} from 'react-dom/server';
import {App,resolvePage} from './app';
import {initialRecord} from '@/lib/initial-content';
import {publicContent} from '@/lib/editorial-validation';
import {setContent} from '@/lib/content-store';
import {setPathname} from './navigation';
export const seed=initialRecord;
export const record={...seed,data:publicContent(seed.data)};
export const routes=['/','/animation','/about','/services','/projects','/blog','/contact','/admin',...record.data.projects.map(p=>'/projects/'+p.slug),...record.data.collections.map(c=>'/collections/'+c.slug),...record.data.journal.map(p=>'/blog/'+p.slug)];
export function render(path:string){setContent(record);setPathname(path);const page=resolvePage(path);return {html:renderToString(<App record={record} path={path} node={page.node}/>),meta:page.meta};}

export function setSnapshot(snapshot:typeof record){Object.assign(record,snapshot);routes.splice(0,routes.length,...["/","/animation","/about","/services","/projects","/blog","/contact","/admin",...record.data.projects.map(p=>"/projects/"+p.slug),...record.data.collections.map(c=>"/collections/"+c.slug),...record.data.journal.map(p=>"/blog/"+p.slug)]);}
