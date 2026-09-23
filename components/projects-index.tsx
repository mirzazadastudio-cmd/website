'use client';
import {t} from '@/lib/i18n';
import {useState} from 'react';
import {useSiteContent} from './content-provider';
import {projectCategories,hasCategory,type Category} from '@/lib/projects';
import {PortfolioCard} from './portfolio-card';
import {LiveProjectGrid} from './live-project-grid';
export function ProjectsIndex(){const {projects}=useSiteContent();const [filter,setFilter]=useState<Category|'All'>('All');const filtered=projects.filter(p=>filter==='All'||hasCategory(p,filter));return <section className="section live-grid-surface"><LiveProjectGrid/><p className="eyebrow">{t("MIRZAZADA STUDIO / PORTFOLIO")}</p><h1 className="page-heading">{t("A considered perspective.")}<br/><span>{t("At every scale.")}</span></h1><div className="filter-bar"><div className="filters">{(['All',...projectCategories] as const).map(category=><button key={category} aria-pressed={filter===category} className={filter===category?'active':''} onClick={()=>setFilter(category)}>{t(category)}<sup>{category==='All'?projects.length:projects.filter(p=>hasCategory(p,category)).length}</sup></button>)}</div></div><div className="project-grid">{filtered.map(project=><PortfolioCard key={project.id||project.slug} project={project} number={projects.indexOf(project)+1}/>)}</div>{!filtered.length&&<p>{t("No published projects in this collection yet.")}</p>}</section>;}
