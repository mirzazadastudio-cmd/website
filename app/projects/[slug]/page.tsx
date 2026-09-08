import Link from 'next/link';
import {notFound,permanentRedirect} from 'next/navigation';
import type {Metadata} from 'next';
import {Header,Footer} from '@/components/studio-chrome';
import {ProjectStory} from '@/components/project-story';
import {getContent,getPublicContent} from '@/lib/content-store';
import {hasCategory} from '@/lib/projects';
import {canonical,pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export function generateMetadata({params}:{params:{slug:string}}):Metadata{const {slug}=params;const {data}=getPublicContent();const project=data.projects.find(p=>p.slug===slug);return project?pageMetadata(project.seoTitle||project.title,project.seoDescription||project.description,'/projects/'+project.slug):{title:'Project not found',robots:{index:false,follow:false}};}
export default function ProjectPage({params}:{params:{slug:string}}){
 const {slug}=params;const {data:{projects,collections}}=getPublicContent();const index=projects.findIndex(project=>project.slug===slug);
 if(index<0){const {data}=getContent();const target=data.projectRedirects?.[slug];const redirected=projects.find(p=>p.id===target);if(redirected)permanentRedirect('/projects/'+redirected.slug);if(slug==='central-interiors'&&projects.some(p=>p.slug==='central-ave'))permanentRedirect('/projects/central-ave');notFound();}
 const project=projects[index],next=projects[(index+1)%projects.length],previous=projects[(index-1+projects.length)%projects.length];
 const schema={'@context':'https://schema.org','@type':'VisualArtwork',name:project.title,description:project.description,url:canonical('/projects/'+project.slug),creator:{'@type':'Organization',name:'Mirzazada Studio'},...(project.location?{contentLocation:{'@type':'Place',name:project.location}}:{})};
 return <><Header/><main id="main"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><section className="project-intro section"><Link className="back-link" href="/projects">← All projects</Link><div className="project-heading"><div><p className="eyebrow">{project.category.toUpperCase()}</p><h1>{project.title}</h1></div><div><p>{project.description}</p><p className="project-type">{project.type}</p></div></div><dl className="project-facts">{[['Location',project.location],['Year',project.year],['Services',project.services?.filter(Boolean).join(' · ')],['Client',project.client],['Architect / designer',project.credit]].filter(([,value])=>value).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><nav className="project-collections" aria-label="Explore related collections">{collections.filter(c=>hasCategory(project,c.category)).map(c=><Link key={c.slug} href={'/collections/'+c.slug}>{c.category} ↗</Link>)}</nav></section><ProjectStory project={project}/><section className="next-project"><div className="project-pagination"><Link href={'/projects/'+previous.slug}>← {previous.title}</Link><Link href="/projects">All projects</Link></div><p className="eyebrow">NEXT PERSPECTIVE</p><Link href={'/projects/'+next.slug}><h2>{next.title}</h2><span>↗</span></Link><a className="text-link" href="/contact">Discuss a similar project ↗</a></section></main><Footer/></>;
}
