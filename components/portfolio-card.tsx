'use client';
import {fieldText,t} from '@/lib/i18n';
import { ArrowUpRight } from 'lucide-react';
import { RenderImage } from './render-image';
import type { Project } from '@/lib/projects';

export function PortfolioCard({ project, number }: { project: Project; number: number }) {
  const previews=Array.from({length:project.images.length?4:0},(_,index)=>({src:project.images[index%project.images.length],detail:index>=project.images.length}));
  return <a href={`/projects/${project.slug}`} className="project-card immersive-project-card" data-grid-card data-protected-media>
    <div className="project-cover">
      <RenderImage src={project.coverImage || project.images[0]} alt={t(`${project.title} — ${project.category.toLowerCase()} visualization`)} loading="lazy" style={{objectPosition:`${project.coverFrame?.x??50}% ${project.coverFrame?.y??50}%`,transform:`scale(${project.coverFrame?.zoom??1})`,transformOrigin:`${project.coverFrame?.x??50}% ${project.coverFrame?.y??50}%`}} width="900" height="675"/>
      <span className="project-number">{String(number).padStart(2, '0')}</span>
      <span className="project-open" aria-hidden="true"><ArrowUpRight size={25}/></span>
      <div className="project-hover-panel" aria-hidden="true">
        <span className="project-hover-category">{t(project.category)}</span>
        <h4>{fieldText(project.title,'project:'+(project.id||'project-'+project.slug)+':title')}</h4>
        <p>{fieldText(project.description,'project:'+(project.id||'project-'+project.slug)+':description')}</p>
        <div className="project-hover-renders">{previews.map(({src,detail},index) => <span key={index}><RenderImage src={src} alt={""} sizes="(max-width: 1100px) 280px, 400px" loading="lazy" style={detail?{transform:'scale(1.55)',transformOrigin:'70% 45%'}:undefined}/>{detail&&<small>{t("Detail")}</small>}</span>)}</div>
        <span className="project-hover-enter">{t("Explore project")} <ArrowUpRight size={19}/></span>
      </div>
    </div>
    <div className="project-caption"><div><h3>{fieldText(project.title,'project:'+(project.id||'project-'+project.slug)+':title')}</h3><p>{[fieldText(project.type,'project:'+(project.id||'project-'+project.slug)+':type'),fieldText(project.location,'project:'+(project.id||'project-'+project.slug)+':location'),project.year].filter(Boolean).join(' · ')}</p></div><span>{t(project.category)}</span></div>
  </a>;
}
