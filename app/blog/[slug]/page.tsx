import {pageMetadata} from '@/lib/seo';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {getPublicContent as getContent} from '@/lib/content-store';
import {Header,Footer} from '@/components/studio-chrome';
import {RenderImage} from '@/components/render-image';
import {Testimonials} from '@/components/journal';
export const dynamic='force-dynamic';
export function generateMetadata({params}:{params:{slug:string}}):Metadata{const {slug}=params;const {data}=getContent();const post=data.journal.find(p=>p.slug===slug&&p.published);return post?pageMetadata(post.title,post.excerpt,'/blog/'+post.slug):{title:'Note not found',robots:{index:false}};}
export default function BlogPost({params}:{params:{slug:string}}){const {slug}=params;const {data}=getContent();const post=data.journal.find(p=>p.slug===slug&&p.published);if(!post)notFound();const project=data.projects.find(p=>p.slug===post.projectSlug);return <><Header/><main id="main"><article><header className="section article-heading"><a className="back-link" href="/blog">← Studio notes</a><p className="eyebrow">{post.topic} / <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})}</time></p><h1>{post.title}</h1><p>{post.excerpt}</p><span>By {data.settings.founder} · Mirzazada Studio</span></header><div className="article-cover"><RenderImage src={post.image} alt={post.title} loading="eager"/></div><div className="article-body prose">{post.body.split(/\n\s*\n/).map((paragraph,i)=><p key={i}>{paragraph}</p>)}{project&&<a className="text-link" href={'/projects/'+project.slug}>Explore {project.title} ↗</a>}</div></article><Testimonials/></main><Footer/></>;}
