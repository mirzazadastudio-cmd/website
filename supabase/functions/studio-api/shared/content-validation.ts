import {validateAnimations} from './animation-playlist.ts';
import type {SiteContent} from './content-types.ts';
import {siteConfig} from './site-config.ts';
import {projectCategories,projectTopics} from './projects.ts';
import {CATALOG_VERSION} from './catalog-upgrade.ts';
import {validateProjectDetails} from './project-validation.ts';
import {validateEditorial} from './editorial-validation.ts';
const text=(v:unknown,max=2000)=>{if(typeof v!=='string'||v.length>max)throw Error('Mətn sahəsi düzgün deyil.');return v;};
const image=(v:unknown)=>{const s=text(v,200);if(!/^\/(images\/[a-zA-Z0-9._-]+\.(webp|png|jpe?g)|media\/[a-f0-9-]+\.(webp|png|jpg))$/.test(s))throw Error('Şəkil yolu düzgün deyil.');return s;};
export function validateContent(raw:unknown):SiteContent{
 const d=raw as SiteContent;if(!d||!Array.isArray(d.projects)||d.projects.length<1||d.projects.length>100)throw Error('1–100 layihə saxlanıla bilər.');
 const slugs=new Set<string>();
 const projects=d.projects.map(p=>{
  const slug=text(p.slug,80);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slugs.has(slug))throw Error('Layihə ünvanı təkrarlanır və ya düzgün deyil.');slugs.add(slug);
  if(!projectCategories.includes(p.category))throw Error('Kateqoriya düzgün deyil.');
  if(p.categories!==undefined&&(!Array.isArray(p.categories)||p.categories.length>projectCategories.length||p.categories.some(c=>!projectCategories.includes(c))))throw Error('Əlavə kateqoriyalar düzgün deyil.');
  if(!Array.isArray(p.images)||((p.status||'published')==='published'&&p.images.length<1)||p.images.length>100)throw Error('Yayım üçün ən azı bir render lazımdır; ən çox 100 render ola bilər.');
  if(p.topics!==undefined&&(!Array.isArray(p.topics)||p.topics.some(topic=>!projectTopics.includes(topic))))throw Error('Sistem növü düzgün deyil.');
  const title=text(p.title,150);if(!title.trim())throw Error('Layihə adı boş ola bilməz.');
  return {...validateProjectDetails(p,image),slug,title,category:p.category,topics:Array.from(new Set(p.topics||[])),categories:Array.from(new Set([p.category,...(p.categories||[])])),type:text(p.type,200),description:text(p.description,5000),images:p.images.map(image),coverImage:p.coverImage?image(p.coverImage):undefined,heroImage:p.heroImage?image(p.heroImage):undefined,heroPosition:/^\d{1,3}% \d{1,3}%$/.test(p.heroPosition||'')?p.heroPosition:undefined};
 });
 const s=d.settings;if(!s||!s.homepage||!s.contact||!Array.isArray(s.tagline)||s.tagline.length!==2)throw Error('Ana səhifə məlumatları düzgün deyil.');
 if(!Array.isArray(s.homepage.projectOrder)||s.homepage.projectOrder.length>100||new Set(s.homepage.projectOrder).size!==s.homepage.projectOrder.length||s.homepage.projectOrder.some(p=>!slugs.has(p)))throw Error('Ana səhifədə ən azı bir mövcud layihə seçin.');
 if(!Number.isFinite(s.homepage.cycleSeconds)||s.homepage.cycleSeconds<20||s.homepage.cycleSeconds>300)throw Error('Animasiya müddəti 20–300 saniyə olmalıdır.');
 const contact={isPlaceholder:!!s.contact.isPlaceholder,email:text(s.contact.email,200),phone:text(s.contact.phone,80),whatsapp:text(s.contact.whatsapp,30),instagram:text(s.contact.instagram,100),instagramUrl:text(s.contact.instagramUrl,300),behanceUrl:text(s.contact.behanceUrl||'',300)};
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))throw Error('E-poçt düzgün deyil.');
 if(contact.instagramUrl&&!/^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._\/-]*$/.test(contact.instagramUrl))throw Error('Instagram ünvanını HTTPS ilə yazın.');
 if(contact.behanceUrl&&!/^https:\/\/(www\.)?behance\.net\/[a-zA-Z0-9._\/-]*$/.test(contact.behanceUrl))throw Error('Behance ünvanı düzgün deyil.');
 if(!Array.isArray(s.services)||s.services.length<1||s.services.length>12)throw Error('1–12 xidmət əlavə edilə bilər.');
 const settings={...siteConfig,name:text(s.name,100),logoUrl:s.logoUrl?image(s.logoUrl):'',founder:text(s.founder,100),tagline:s.tagline.map(v=>text(v,120)),introduction:text(s.introduction,1000),homepage:{projectOrder:s.homepage.projectOrder,cycleSeconds:s.homepage.cycleSeconds,studioImage:image(s.homepage.studioImage)},contact,services:s.services.map(v=>({title:text(v.title,150),text:text(v.text,1000),tag:text(v.tag,100),image:image(v.image),audience:text(v.audience||'',500),deliverables:text(v.deliverables||'',1000)}))};
 const crops:SiteContent['crops']={};if(!d.crops||Object.keys(d.crops).length>5000)throw Error('Kadr məlumatı düzgün deyil.');
 for(const [src,crop] of Object.entries(d.crops)){image(src);if(!crop||![crop.width,crop.height,crop.bottom].every(Number.isFinite)||crop.width<1||crop.height<1||crop.width>20000||crop.height>20000||crop.bottom<0||crop.bottom>.35)throw Error('Kəsmə ölçüsü düzgün deyil.');crops[src]={width:crop.width,height:crop.height,bottom:crop.bottom};}
 const ids=projects.map(p=>p.id);if(new Set(ids).size!==ids.length)throw Error('Layihə identifikatoru təkrarlanır.');
 const projectRedirects:Record<string,string>={};for(const [from,to] of Object.entries(d.projectRedirects||{})){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(from)||typeof to!=='string'||!ids.includes(to))continue;projectRedirects[from]=to;}
 return {animations:validateAnimations(d.animations),catalogVersion:CATALOG_VERSION,projectRedirects,projects,settings,crops,...validateEditorial(d,image,projects)};
}
