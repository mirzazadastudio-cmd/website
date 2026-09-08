import {pageMetadata} from '@/lib/seo';
import type {Metadata} from 'next';
import {getPublicContent as getContent} from '@/lib/content-store';
import {Header,Footer} from '@/components/studio-chrome';
import {JournalCard,Testimonials} from '@/components/journal';
export const dynamic='force-dynamic';
export const metadata=pageMetadata('Blog — Studio notes','Notes on architectural visualization, outdoor living and the details behind a render.','/blog');
export default function BlogPage(){const {data}=getContent();const posts=data.journal.filter(post=>post.published);return <><Header/><main id="main"><section className="section blog-intro"><p className="eyebrow">MIRZAZADA STUDIO / BLOG</p><h1>Behind the<br/><span>perspective.</span></h1><p>Notes on architecture, outdoor living<br/>and the details that make an image.</p><div className="journal-grid">{posts.map(post=><JournalCard key={post.slug} post={post}/>)}</div>{!posts.length&&<p className="editorial-empty">New studio notes are on their way.</p>}</section><Testimonials/><section className="section blog-outro"><h2>Let’s create the next perspective.</h2><a className="text-link" href="/#contact">Start a conversation ↗</a></section></main><Footer/></>;}
