import type { SiteContent } from './content-types';
import type { Project } from './projects';
import { projects, projectCategories } from './projects';
import previousCatalog from './catalog-v1.json';
import crops from './image-crops.json';
import catalogV2 from './catalog-v2.json';
import {defaultCollections} from './collections';
import {hasCategory} from './projects';
import {defaultProfile,defaultJournal,defaultTestimonials} from './studio-content';
import {siteConfig} from './site-config';

export const CATALOG_VERSION = 4;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// Upgrade the original saved collection once, while retaining edits made in Admin.
// Persisting the version marker prevents later removals or reordering being undone.
function upgradeV2(content: SiteContent): SiteContent {
  if ((content.catalogVersion || 0) >= 2) return content;
  const existing = new Map(content.projects.map(project => [project.slug, project]));
  const baseline = new Map(previousCatalog.map(project => [project.slug, project]));
  const updated: Project[] = [];
  for (const project of projects) {
    const old = existing.get(project.slug);
    const original = baseline.get(project.slug);
    if (original && !old) continue;
    if (old && !original) { updated.push(old); continue; }
    const next = structuredClone(project);
    if (old && original) {
      for (const key of ['title', 'type', 'description', 'images', 'coverImage', 'heroImage', 'heroPosition'] as const) {
        if (!same(old[key], (original as Record<string, unknown>)[key])) Object.assign(next, { [key]: old[key] });
      }
    }
    updated.push(next);
  }
  // The interior and exterior of 491 Central Avenue are one project.
  const interior = existing.get('central-interiors');
  const originalInterior = baseline.get('central-interiors');
  const central = updated.find(project => project.slug === 'central-ave');
  if (interior && central && originalInterior) {
    const added = interior.images.filter(src => !originalInterior.images.includes(src));
    central.images = Array.from(new Set([...central.images, ...added]));
    if (interior.description !== originalInterior.description) central.description += '\n\n' + interior.description;
  }
  for (const old of content.projects) {
    if (old.slug === 'central-interiors' || projects.some(project => project.slug === old.slug)) continue;
    const category = projectCategories.includes(old.category) ? old.category : 'Exterior';
    updated.push({ ...old, category, categories: old.categories || [category] });
  }
  return {
    ...content,
    catalogVersion: 2,
    projects: updated,
    crops: { ...crops, ...content.crops },
    settings: { ...content.settings, homepage: { ...content.settings.homepage, projectOrder: updated.map(project => project.slug), cycleSeconds: 180 } },
  };
}

// Add collections and editorial content once. Keep owner-written fields and removals.
function upgradeV3(input:SiteContent):SiteContent {
 if((input.catalogVersion||0)>=3)return input;
 const content=upgradeV2(input);
 const normalize=(category:string)=>category==='Building'?'Large Buildings':category==='Product Modeling'?'Product & Technical':category;
 const updated=content.projects.map(project=>{
  const baseline=catalogV2.find(item=>item.slug===project.slug);
  const curated=projects.find(item=>item.slug===project.slug);
  const unchanged=baseline&&same(project.category,baseline.category)&&same(project.categories,baseline.categories);
  if(curated&&unchanged)return {...project,category:curated.category,categories:curated.categories,topics:project.topics||curated.topics};
  return {...project,category:normalize(project.category) as Project['category'],categories:project.categories?.map(category=>normalize(category) as Project['category']),topics:project.topics||curated?.topics||[]};
 });
 const featuredOrder=siteConfig.homepage.projectOrder.filter(slug=>updated.some(project=>project.slug===slug));
 return {...content,catalogVersion:3,projects:updated,
  settings:{...content.settings,navigation:siteConfig.navigation,homepage:{...content.settings.homepage,
   ...(same(content.settings.homepage.projectOrder,content.projects.map(project=>project.slug))?{projectOrder:featuredOrder.length?featuredOrder:updated.slice(0,1).map(project=>project.slug),cycleSeconds:140}:{})
  }},
  collections:(content.collections||structuredClone(defaultCollections)).map(collection=>({...collection,featuredProject:updated.some(project=>project.slug===collection.featuredProject&&hasCategory(project,collection.category))?collection.featuredProject:''})),
  profile:content.profile||structuredClone(defaultProfile),
  journal:(content.journal||structuredClone(defaultJournal)).map(post=>({...post,projectSlug:updated.some(project=>project.slug===post.projectSlug)?post.projectSlug:''})),
  testimonials:content.testimonials||structuredClone(defaultTestimonials),
 };
}

export function upgradeCatalog(input:SiteContent):SiteContent{
 if((input.catalogVersion||0)>=CATALOG_VERSION)return input;
 const data=upgradeV3(input);const stamp='2026-09-08T00:00:00.000Z';
 return {...data,catalogVersion:CATALOG_VERSION,projectRedirects:data.projectRedirects||{},projects:data.projects.map(project=>({...project,id:project.id||'project-'+project.slug,status:project.status||'published',location:project.location||'',year:project.year||'',client:project.client||'',credit:project.credit||'',services:project.services||[],coverFrame:project.coverFrame||{x:50,y:50,zoom:1},createdAt:project.createdAt||stamp,updatedAt:project.updatedAt||stamp,publishedAt:project.publishedAt||stamp,seoTitle:project.seoTitle||'',seoDescription:project.seoDescription||'',displayPermission:project.displayPermission||'unreviewed'})),settings:{...data.settings,logoUrl:data.settings.logoUrl||'',services:(data.settings.services.length===4?[...data.settings.services,...siteConfig.services.slice(4)]:data.settings.services).map((service,i)=>({...service,audience:service.audience||siteConfig.services[i]?.audience||'',deliverables:service.deliverables||siteConfig.services[i]?.deliverables||''})),navigation:siteConfig.navigation,contact:{...data.settings.contact,email:'hello@mirzazadastudio.com',isPlaceholder:false,behanceUrl:data.settings.contact.behanceUrl||'',instagram:'@mirzazada.studio',instagramUrl:'https://www.instagram.com/mirzazada.studio/'}},testimonials:data.testimonials.map(review=>review.sample?{...review,published:false}:review)};
}
