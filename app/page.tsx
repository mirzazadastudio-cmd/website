'use client';
import {fieldText,t} from '@/lib/i18n';
import {AnimationBanner} from '@/components/animation-banner';
import {CollectionLinks} from '@/components/collection-view';
import {AIJournalTeaser,JournalTeaser} from '@/components/journal';
import {collectionProjects} from '@/lib/collections';
import {RenderImage} from '@/components/render-image';
import { useRef, useState } from 'react';
import { useHomeScrollMotion } from '@/components/home-scroll-motion';
import { ArrowUpRight } from 'lucide-react';
import { ProjectReel } from '@/components/project-reel';
import { PortfolioCard } from '@/components/portfolio-card';
import { LiveProjectGrid } from '@/components/live-project-grid';
import { Header, Footer } from '@/components/studio-chrome';
import { Contact } from '@/components/contact';
import { type Category, projectCategories, hasCategory } from '@/lib/projects';
import { useSiteContent } from '@/components/content-provider';

const categories: ('All projects' | Category)[] = ['All projects',...projectCategories];

export default function Home() {
 const {settings:siteConfig,projects,collections}=useSiteContent();
 const main = useRef<HTMLElement>(null);
 useHomeScrollMotion(main, siteConfig);
 const services=siteConfig.services.slice(0,4);
 const [filter,setFilter]=useState<(typeof categories)[number]>('All projects');
 const [expanded,setExpanded]=useState(false);
 const activeCollection=collections.find(collection=>collection.category===filter);
 const filtered=activeCollection?collectionProjects(projects,activeCollection):projects.filter(p=>filter==='All projects'||hasCategory(p,filter));
 const visible=expanded||filter!=='All projects'?filtered:filtered.slice(0,12);
 return <><Header/><main id="main" ref={main} className="home-scroll-motion"><ProjectReel/><AnimationBanner/>
 <div className="discipline-strip"><span>{t("Architecture")}</span><span className="strip-star">✳</span><span>{t("Interiors")}</span><span className="strip-star">✳</span><span>{t("Visualization")}</span><span className="strip-star">✳</span><span>{t("Outdoor living")}</span><span className="strip-star">✳</span></div>
 <section id="projects" className="section projects-section live-grid-surface"><LiveProjectGrid/><div className="section-title"><div><p className="eyebrow">{t("01 / PORTFOLIO")}</p><h2>{t("Selected perspectives.")}</h2></div><p>{t("A collection of spaces, materials")}<br/>{t("and the stories between them.")}</p></div><CollectionLinks/><div className="filter-bar"><div className="filters" aria-label={t("Filter projects")}>{categories.map(category=><button key={category} aria-pressed={filter===category} className={filter===category?'active':''} onClick={()=>{setFilter(category);setExpanded(false)}}>{t(category)}<sup>{category==='All projects'?projects.length:projects.filter(p=>hasCategory(p,category)).length}</sup></button>)}</div><span className="filter-count" aria-live="polite">{String(filtered.length).padStart(2,'0')} {t("PROJECTS")}</span></div>{activeCollection&&<div className="active-collection"><div><h3>{t(activeCollection.category)}</h3><p>{fieldText(activeCollection.scope,'collection:'+activeCollection.slug+':scope')}</p></div><a className="text-link" href={'/collections/'+activeCollection.slug}>{t("Explore the full collection")} <ArrowUpRight size={20}/></a></div>}{!visible.length&&<div className="collection-empty"><h3>{t("New perspectives are taking shape.")}</h3><p>{t("AI-generated projects and concepts will appear here as they are published.")}</p><a className="text-link" href="/collections/ai">{t("Explore the AI collection ↗")}</a></div>}<div className="project-grid">{visible.map(project=><PortfolioCard key={project.slug} project={project} number={projects.indexOf(project)+1}/>)}</div>{filter==='All projects'&&<div className="all-projects-row"><p>{t(expanded?'The complete collection.':'Different scales. One considered approach.')}</p><button className="outline-button" onClick={()=>setExpanded(!expanded)}>{t(expanded?'Show selected projects':`View all ${projects.length} projects`)}<span>{expanded?'−':'+'}</span></button></div>}</section>
 <section id="studio" className="studio-section"><div className="studio-visual"><RenderImage src={siteConfig.homepage.studioImage} alt={t("Sunlight through a pergola over an outdoor dining space")} loading="lazy"/><p>{t("LIGHT. MATERIAL. ATMOSPHERE.")}</p></div><div className="studio-copy"><p className="eyebrow">{t("02 / THE STUDIO")}</p><h2>{t("More than an image.")}<br/><span>{t("A sense of place.")}</span></h2><p>{t("Mirzazada Studio brings architecture, visualization and product storytelling together. We collaborate with design studios, developers and manufacturers to communicate spaces and ideas.")}</p><p>{t("We look beyond the geometry. The way light falls, the texture of a surface, the feeling of being there — these are the details that bring a design to life.")}</p><a className="text-link" href="/about">{t("About our studio")} <ArrowUpRight size={20}/></a><div className="studio-signature"><div>{t("Architecture · Interiors · Outdoor systems")}<small>{t("From the first concept to the final presentation.")}</small></div></div></div></section>
 <section className="section services-section" id="services"><div className="section-title"><div><p className="eyebrow">{t("03 / WHAT WE DO")}</p><h2>{t("Your vision, made visible.")}</h2></div><p>{t("From the first concept")}<br/>{t("to the final perspective.")}</p></div><div className="service-list">{services.map((service,i)=><a href="/services" className="service-row" key={service.title}><span className="service-number">0{i+1}</span><RenderImage src={service.image} alt={""} loading="lazy"/><div><h3>{fieldText(service.title,'service:'+i+':title')}</h3><p>{fieldText(service.text,'service:'+i+':text')}</p></div><span className="service-tag">{fieldText(service.tag,'service:'+i+':tag')}</span><ArrowUpRight className="service-arrow" size={30}/></a>)}</div></section>
 <AIJournalTeaser/><JournalTeaser/><Contact/></main><Footer/></>;
}
