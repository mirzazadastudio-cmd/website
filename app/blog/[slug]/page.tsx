import {fieldText,t,languageTag} from '@/lib/i18n';
import {pageMetadata} from '@/lib/seo';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {getPublicContent as getContent} from '@/lib/content-store';
import {Header,Footer} from '@/components/studio-chrome';
import {RenderImage} from '@/components/render-image';
import {Testimonials} from '@/components/journal';
export const dynamic='force-dynamic';
export function generateMetadata({params}:{params:{slug:string}}):Metadata{const {slug}=params;const {data}=getContent();const post=data.journal.find(p=>p.slug===slug&&p.published);return post?pageMetadata(post.title,post.excerpt,'/blog/'+post.slug):{title:'Note not found',robots:{index:false}};}
export default function BlogPost({params}:{params:{slug:string}}){const {slug}=params;const {data}=getContent();const post=data.journal.find(p=>p.slug===slug&&p.published);if(!post)notFound();const project=data.projects.find(p=>p.slug===post.projectSlug);return <><Header/><main id="main"><article><header className="section article-heading"><a className="back-link" href="/blog">{t("← Studio notes")}</a><p className="eyebrow">{fieldText(post.topic,'post:'+post.slug+':topic')} / <time dateTime={post.date}>{t(new Date(post.date).toLocaleDateString(languageTag(),{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}))}</time></p><h1>{fieldText(post.title,'post:'+post.slug+':title')}</h1><p>{fieldText(post.excerpt,'post:'+post.slug+':excerpt')}</p><span>{t("By")} {fieldText(data.settings.founder,'settings:founder')} {t("· Mirzazada Studio")}</span></header>{post.topic!=='AI'&&<div className="article-cover"><RenderImage src={post.image} alt={fieldText(post.title,'post:'+post.slug+':title')} loading="eager"/></div>}<div className="article-body prose">{fieldText(post.body, "post:"+post.slug+":body").split(/\n\s*\n/).map((paragraph,i)=><p key={i}>{paragraph}</p>)}{project&&<a className="text-link" href={'/projects/'+project.slug}>{t("Explore")} {fieldText(project.title,'project:'+(project.id||'project-'+project.slug)+':title')} ↗</a>}</div></article><Testimonials/></main><Footer/></>;}
