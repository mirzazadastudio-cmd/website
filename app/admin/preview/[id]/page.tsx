import {notFound} from 'next/navigation';

import {getContent} from '@/lib/content-store';
import {ContentProvider} from '@/components/content-provider';
import {ProjectStory} from '@/components/project-story';
export const metadata={title:'Private project preview',robots:{index:false,follow:false}};
export default function Preview({params}:{params:{id:string}}){const {id}=params;const {data}=getContent();const project=data.projects.find(p=>p.id===id);if(!project)notFound();return <ContentProvider data={data} allowMediaActions><main id="main"><section className="section"><a href="/admin">← Admin</a><p className="eyebrow">PRIVATE PREVIEW</p><h1>{project.title}</h1><p>{project.description}</p></section><ProjectStory project={project}/></main></ContentProvider>;}
