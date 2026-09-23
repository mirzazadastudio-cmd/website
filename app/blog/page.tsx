import {t} from '@/lib/i18n';
import {pageMetadata} from '@/lib/seo';
import type {Metadata} from 'next';
import {getPublicContent as getContent} from '@/lib/content-store';
import {Header,Footer} from '@/components/studio-chrome';
import {JournalCard,Testimonials} from '@/components/journal';
export const dynamic='force-dynamic';
export const metadata=pageMetadata('Blog — Studio notes','Notes on architectural visualization, outdoor living and the details behind a render.','/blog');
export default function BlogPage(){const {data}=getContent();const posts=data.journal.filter(post=>post.published);return <><Header/><main id="main"><section className="section blog-intro"><p className="eyebrow">{t("MIRZAZADA STUDIO / BLOG")}</p><h1>{t("Behind the")}<br/><span>{t("perspective.")}</span></h1><p>{t("Notes on architecture, outdoor living")}<br/>{t("and the details that make an image.")}</p><div className="journal-grid">{posts.map(post=><JournalCard key={post.slug} post={post}/>)}</div>{!posts.length&&<p className="editorial-empty">{t("New studio notes are on their way.")}</p>}</section><Testimonials/><section className="section blog-outro"><h2>{t("Let’s create the next perspective.")}</h2><a className="text-link" href="/#contact">{t("Start a conversation ↗")}</a></section></main><Footer/></>;}
