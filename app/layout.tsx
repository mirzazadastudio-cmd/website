import type { Metadata } from 'next';
import './globals.css';
import {CampaignAttribution} from '@/components/campaign-attribution';
import {pageMetadata,canonicalOrigin} from '@/lib/seo';
import {MediaProtection} from '@/components/media-protection';
import {publicContent} from '@/lib/editorial-validation';
import {getContent} from '@/lib/content-store';
import {ContentProvider} from '@/components/content-provider';
export const dynamic='force-dynamic';
export const metadata:Metadata={...pageMetadata('Mirzazada Studio — Architecture & Visualization','Architectural visualization by Ilkin Mirzazada. Explore exterior, interior, restoration and outdoor projects.','/'),title:{default:'Mirzazada Studio — Architecture & Visualization',template:'%s — Mirzazada Studio'},icons:{icon:'/favicon.svg'},metadataBase:new URL(canonicalOrigin)};
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { const {data}=await getContent(); return <html lang="en"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'ProfessionalService',name:'Mirzazada Studio',url:canonicalOrigin,description:'Architectural visualization, 3D modeling and outdoor living visualization.',founder:{'@type':'Person',name:'Ilkin Mirzazada'},address:{'@type':'PostalAddress',addressLocality:'Baku',addressCountry:'AZ'},sameAs:[data.settings.contact.instagramUrl,data.settings.contact.behanceUrl,data.profile.linkedin].filter(Boolean)}).replace(/</g,'\\u003c')}}/><a className="skip-link" href="#main">Skip to content</a><ContentProvider data={publicContent(data)}><MediaProtection/><CampaignAttribution/>{children}</ContentProvider></body></html>; }
