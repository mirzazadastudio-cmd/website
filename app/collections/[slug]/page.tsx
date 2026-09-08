import {pageMetadata} from '@/lib/seo';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {getPublicContent as getContent} from '@/lib/content-store';
import {Header,Footer} from '@/components/studio-chrome';
import {CollectionView} from '@/components/collection-view';
export const dynamic='force-dynamic';
export function generateMetadata({params}:{params:{slug:string}}):Metadata{const {slug}=params;const {data}=getContent();const collection=data.collections.find(c=>c.slug===slug);return collection?pageMetadata(collection.category,collection.description,'/collections/'+slug):{title:'Collection not found',robots:{index:false}};}
export default function CollectionPage({params}:{params:{slug:string}}){const {slug}=params;const {data}=getContent();if(!data.collections.some(c=>c.slug===slug))notFound();return <><Header/><main id="main"><CollectionView key={slug} slug={slug}/></main><Footer/></>;}
