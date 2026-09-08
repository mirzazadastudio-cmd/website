import type {ReactNode} from 'react';
import {ContentProvider} from '@/components/content-provider';
import {MediaProtection} from '@/components/media-protection';
import {CampaignAttribution} from '@/components/campaign-attribution';
import {setContent} from '@/lib/content-store';
import type {ContentRecord} from '@/lib/content-types';
import {setPathname} from './navigation';
import Home from '@/app/page';
import Animation from '@/app/animation/page';
import About from '@/app/about/page';
import Services from '@/app/services/page';
import Projects from '@/app/projects/page';
import Project,{generateMetadata as projectMeta} from '@/app/projects/[slug]/page';
import Collections,{generateMetadata as collectionMeta} from '@/app/collections/[slug]/page';
import Blog from '@/app/blog/page';
import Post,{generateMetadata as postMeta} from '@/app/blog/[slug]/page';
import Contact from '@/app/contact/page';
import {AdminPanel} from '@/components/admin-panel';
import Preview from '@/app/admin/preview/[id]/page';
import NotFound from '@/app/not-found';
import {pageMetadata} from '@/lib/seo';
export function resolvePage(path:string){
 const clean=path.replace(/\/$/,'')||'/';const parts=clean.split('/');
 const params={slug:decodeURIComponent(parts[2]||'')};
 if(clean==='/')return {node:<Home/>,meta:pageMetadata('Mirzazada Studio — Architecture & Visualization','Architectural visualization by Ilkin Mirzazada. Explore exterior, interior, restoration and outdoor projects.','/')};
 if(clean==='/animation')return {node:<Animation/>,meta:pageMetadata('Animation — Mirzazada Studio','Five-second architectural, interior and outdoor-system films by Mirzazada Studio.','/animation')};
 if(clean==='/about')return {node:About(),meta:pageMetadata('About Ilkin Mirzazada','Architect and 3D visualization specialist in Baku.','/about')};
 if(clean==='/services')return {node:Services(),meta:pageMetadata('Services','Architectural, interior, product and outdoor visualization.','/services')};
 if(clean==='/projects')return {node:<Projects/>,meta:pageMetadata('Projects','Architecture and visualization portfolio.','/projects')};
 if(parts.length===3&&parts[1]==='projects')return {node:Project({params}),meta:projectMeta({params})};
 if(parts.length===3&&parts[1]==='collections')return {node:Collections({params}),meta:collectionMeta({params})};
 if(clean==='/blog')return {node:Blog(),meta:pageMetadata('Studio notes','Architecture, visualization and studio perspectives.','/blog')};
 if(parts.length===3&&parts[1]==='blog')return {node:Post({params}),meta:postMeta({params})};
 if(clean==='/contact')return {node:<Contact/>,meta:pageMetadata('Contact','Discuss your next project with Mirzazada Studio.','/contact')};
 if(clean==='/admin')return {node:<AdminPanel/>,meta:{title:'Admin — Mirzazada Studio',robots:{index:false}}};
 if(parts.length===4&&parts[1]==='admin'&&parts[2]==='preview')return {node:Preview({params:{id:parts[3]}}),meta:{title:'Private preview',robots:{index:false}}};
 return {node:<NotFound/>,meta:{title:'Page not found',robots:{index:false}}};
}
export function App({record,path,node}:{record:ContentRecord;path:string;node?:ReactNode}){
 setContent(record);setPathname(path);
 let content=node;try{content??=resolvePage(path).node;}catch(error){if((error as Error).message.startsWith('REDIRECT:')&&typeof window!=='undefined')window.location.replace((error as Error).message.slice(9));content=<NotFound/>;}
 return <ContentProvider data={record.data} allowMediaActions={path.startsWith('/admin')}><a className="skip-link" href="#main">Skip to content</a><MediaProtection/><CampaignAttribution/>{content}</ContentProvider>;
}
