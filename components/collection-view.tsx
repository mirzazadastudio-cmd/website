'use client';
import {fieldText,t} from '@/lib/i18n';
import {useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {useSiteContent} from './content-provider';
import {RenderImage} from './render-image';
import {PortfolioCard} from './portfolio-card';
import {LiveProjectGrid} from './live-project-grid';
import {collectionProjects} from '@/lib/collections';
import {projectTopics,type ProjectTopic} from '@/lib/projects';

export function CollectionLinks(){
 const {collections,projects}=useSiteContent();
 const featured=['large-buildings','restoration','outdoor-systems','product-technical'];
 return <div className="collection-links" aria-label={t("Explore specialist collections")}>{featured.flatMap(slug=>{
  const collection=collections.find(c=>c.slug===slug);if(!collection)return [];
  const items=collectionProjects(projects,collection);const first=items[0];if(!first)return [];
  return [<a href={'/collections/'+collection.slug} className="collection-tile" data-protected-media key={slug}><RenderImage src={first.coverImage||first.images[0]} alt={""} loading="lazy"/><div><span>{String(items.length).padStart(2,'0')} {t("PROJECTS")}</span><h3>{t(collection.category)}</h3><ArrowUpRight size={22}/></div></a>];
 })}</div>;
}
export function CollectionView({slug}:{slug:string}){
 const {collections,projects}=useSiteContent();
 const collection=collections.find(c=>c.slug===slug)!;
 const items=collectionProjects(projects,collection),feature=items[0];
 const [topic,setTopic]=useState<ProjectTopic|'All'>('All');
 const topics=projectTopics.filter(value=>items.some(p=>p.topics?.includes(value)));
 const shown=items.filter(project=>topic==='All'||project.topics?.includes(topic));
 return <><section className="section collection-intro"><a className="back-link" href="/#projects">{t("← All projects")}</a><div className="collection-heading"><div><p className="eyebrow">{t("THE COLLECTION /")} {String(items.length).padStart(2,'0')} {t("PROJECTS")}</p><h1>{t(collection.category)}</h1></div><div><p>{fieldText(collection.description,'collection:'+collection.slug+':description')}</p><span>{fieldText(collection.scope,'collection:'+collection.slug+':scope')}</span></div></div><nav className="collection-nav" aria-label={t("Project collections")}>{collections.filter(c=>c.category==='AI'||collectionProjects(projects,c).length>0).map(c=><a key={c.slug} href={'/collections/'+c.slug} aria-current={c.slug===slug?'page':undefined}>{t(c.category)}</a>)}</nav></section>
 {feature&&<a className="collection-feature" data-protected-media href={'/projects/'+feature.slug}><RenderImage src={feature.heroImage||feature.images[0]} alt={fieldText(feature.title,'project:'+(feature.id||'project-'+feature.slug)+':title')} loading="eager" fetchPriority="high"/><div className="collection-feature-caption"><div><p className="eyebrow">{t("FEATURED PERSPECTIVE")}</p><h2>{fieldText(feature.title,'project:'+(feature.id||'project-'+feature.slug)+':title')}</h2><p>{fieldText(feature.type,'project:'+(feature.id||'project-'+feature.slug)+':type')}</p></div><span>{t("Explore project")} <ArrowUpRight size={25}/></span></div></a>}
 <section className="section collection-work live-grid-surface"><LiveProjectGrid/><div className="section-title"><div><p className="eyebrow">{t("EXPLORE THE COLLECTION")}</p><h2>{t("Every perspective.")}</h2></div><p>{items.length} {t("projects")}<br/>{fieldText(collection.scope,'collection:'+collection.slug+':scope')}</p></div>
 {topics.length>0&&<div className="filter-bar"><div className="filters" aria-label={t("Filter system views")}>{(['All',...topics] as const).map(value=><button key={value} aria-pressed={topic===value} className={topic===value?'active':''} onClick={()=>setTopic(value)}>{t(value)}<sup>{value==='All'?items.length:items.filter(p=>p.topics?.includes(value)).length}</sup></button>)}</div></div>}
 <p className="collection-results" aria-live="polite">{shown.length} {t(shown.length===1?'project':'projects')}{topic!=='All'&&<> · {t(topic)}</>}</p>
 <div className="project-grid">{shown.map(project=><PortfolioCard key={project.slug} project={project} number={items.indexOf(project)+1}/>)}</div>{!items.length&&<p className="editorial-empty">{t("New perspectives are on their way.")}</p>}
 <div className="collection-cta"><p>{t("A project in this field?")}</p><a className="text-link" href="/#contact">{t("Let’s work together")} <ArrowUpRight size={20}/></a></div></section></>;
}
