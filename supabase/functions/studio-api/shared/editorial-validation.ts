import type {SiteContent} from './content-types.ts';
import type {StudioProfile} from './studio-content.ts';
import {defaultCollections} from './collections.ts';
import {mediaSources} from './media-sources.ts';
import {hasCategory,isPublished} from './projects.ts';
const text=(value:unknown,max=2000)=>{if(typeof value!=='string'||value.length>max)throw Error('Mətn sahəsi düzgün deyil.');return value;};
const flag=(value:unknown)=>{if(typeof value!=='boolean')throw Error('Yayım statusu düzgün deyil.');return value;};
const slug=(value:unknown)=>{const result=text(value,80);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result))throw Error('Ünvan düzgün deyil.');return result;};
export function validateEditorial(d:SiteContent,image:(v:unknown)=>string,projects:SiteContent['projects']){
 if(!d.profile||!Array.isArray(d.collections)||(d.collections.length!==defaultCollections.length&&!(d.collections.length===defaultCollections.length-1&&!d.collections.some(c=>c.category==='AI'))))throw Error('Profil və kateqoriyalar düzgün deyil.');
 const profile={} as StudioProfile;
 for(const key of ['role','experience','location','introduction','biography','markets','expertise','education','collaboration'] as const)profile[key]=text(d.profile[key],key==='biography'?6000:2000);
 profile.portrait=image(d.profile.portrait);
 profile.linkedin=text(d.profile.linkedin,300);
 if(profile.linkedin&&!/^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9%_-]+\/?$/.test(profile.linkedin))throw Error('LinkedIn profil ünvanını düzgün yazın.');
 const seen=new Set<string>();
 const collections=d.collections.map(item=>{
  const original=defaultCollections.find(c=>c.slug===item.slug&&c.category===item.category);
  if(!original||seen.has(item.slug))throw Error('Kateqoriya təkrarlanır və ya düzgün deyil.');seen.add(item.slug);
  const featuredProject=text(item.featuredProject,80);
  if(featuredProject&&!projects.some(p=>p.slug===featuredProject&&hasCategory(p,item.category)))throw Error(item.category+': əsas layihə bu kateqoriyaya aid olmalıdır.');
  return {slug:item.slug,category:item.category,description:text(item.description,2000),scope:text(item.scope,500),featuredProject};
 });
 if(!collections.some(c=>c.category==='AI'))collections.push({...defaultCollections.find(c=>c.category==='AI')!});
 if(!Array.isArray(d.journal)||d.journal.length>50||!Array.isArray(d.testimonials)||d.testimonials.length>30)throw Error('Ən çox 50 blog yazısı və 30 rəy saxlanıla bilər.');
 const postSlugs=new Set<string>();
 const journal=d.journal.map(post=>{
  const id=slug(post.slug);if(postSlugs.has(id))throw Error('Blog ünvanı təkrarlanır.');postSlugs.add(id);
  const title=text(post.title,160);if(!title.trim())throw Error('Yazının başlığı boş ola bilməz.');
  const date=text(post.date,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw Error('Blog tarixi düzgün deyil.');
  const projectSlug=text(post.projectSlug,80);if(projectSlug&&!projects.some(p=>p.slug===projectSlug))throw Error('Blog üçün mövcud layihə seçin.');
  return {slug:id,title,excerpt:text(post.excerpt,600),body:text(post.body,15000),image:image(post.image),topic:text(post.topic,80),date,projectSlug,published:flag(post.published)};
 });
 const reviewIds=new Set<string>();
 const testimonials=d.testimonials.map(review=>{
  const id=slug(review.id);if(reviewIds.has(id))throw Error('Rəy təkrarlanır.');reviewIds.add(id);
  return {id,name:text(review.name,150),role:text(review.role,200),quote:text(review.quote,2000),sample:flag(review.sample),published:flag(review.published)};
 });
 return {profile,collections,journal,testimonials};
}
export function publicContent(data:SiteContent):SiteContent {
 const projects=data.projects.filter(isPublished);const slugs=new Set(projects.map(p=>p.slug));
 const result={...data,projectRedirects:Object.fromEntries(Object.entries(data.projectRedirects||{}).filter(([,id])=>projects.some(p=>p.id===id))),projects,settings:{...data.settings,homepage:{...data.settings.homepage,projectOrder:data.settings.homepage.projectOrder.filter(slug=>slugs.has(slug))}},journal:data.journal.filter(post=>post.published).map(post=>({...post,projectSlug:slugs.has(post.projectSlug)?post.projectSlug:''})),testimonials:data.testimonials.filter(review=>review.published&&!review.sample)};
 const used=mediaSources(result);return {...result,media:Object.fromEntries(Object.entries(data.media||{}).filter(([src])=>used.has(src))),crops:Object.fromEntries(Object.entries(data.crops).filter(([src])=>used.has(src)))};
}
