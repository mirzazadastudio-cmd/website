import {fieldText,t} from '@/lib/i18n';
import {pageMetadata} from '@/lib/seo';
import type {Metadata} from 'next';
import {getPublicContent as getContent} from '@/lib/content-store';
import {Header,Footer} from '@/components/studio-chrome';
import {RenderImage} from '@/components/render-image';
import {Contact} from '@/components/contact';
export const dynamic='force-dynamic';
export const metadata=pageMetadata('About Ilkin Mirzazada','Meet Ilkin Mirzazada, architect and 3D visualization specialist behind Mirzazada Studio.','/about');
export default function AboutPage(){
 const {data:{profile,settings,projects}}=getContent();
 const collaboration=projects.find(project=>project.slug==='marina-village');
 return <><Header/><main id="main"><section className="section about-hero"><div className="about-portrait"><RenderImage src={profile.portrait} alt={fieldText(settings.founder,'settings:founder')} loading="eager" fetchPriority="high"/></div><div className="about-intro"><p className="eyebrow">{t("THE PERSON BEHIND THE PERSPECTIVE")}</p><h1>{fieldText(settings.founder,'settings:founder')}<span>.</span></h1><p className="about-role">{fieldText(profile.role,'profile:role')}</p><p className="about-lead">{fieldText(profile.introduction,'profile:introduction')}</p><div className="about-facts"><div><strong>{fieldText(profile.experience,'profile:experience')}</strong><span>{t("Professional experience")}</span></div><div><strong>{fieldText(profile.location,'profile:location')}</strong><span>{t("Based in · working internationally")}</span></div></div>{profile.linkedin&&<a className="text-link" href={profile.linkedin} target="_blank" rel="noreferrer">{t("Professional profile on LinkedIn ↗")}</a>}</div></section>
 <section className="section about-story"><div><p className="eyebrow">{t("ARCHITECTURE / PRODUCTS / ATMOSPHERE")}</p><h2>{t("One eye for detail.")}<br/>{t("Many scales of work.")}</h2></div><div className="prose">{fieldText(profile.biography, "profile:biography").split(/\n\s*\n/).map((paragraph,i)=><p key={i}>{paragraph}</p>)}<p>{fieldText(profile.markets,'profile:markets')}</p></div></section>
 <section className="section about-background"><div><p className="eyebrow">{t("FOCUS")}</p><ul>{fieldText(profile.expertise, "profile:expertise").split('\n').filter(Boolean).map((line,i)=><li key={i}>{line}</li>)}</ul></div><div><p className="eyebrow">{t("EDUCATION")}</p><p>{fieldText(profile.education,'profile:education')}</p><p className="profile-source">{t("Career details from")} <a href={profile.linkedin||'https://www.linkedin.com/in/mrzzd/'} target="_blank" rel="noreferrer">{t("LinkedIn")}</a> {t("and")} <a href="https://www.twine.net/mrzzd" target="_blank" rel="noreferrer">{t("Twine")}</a>.</p></div></section>
 {profile.collaboration&&<section className="about-collaboration">{collaboration&&<a className="collaboration-image" href={'/projects/'+collaboration.slug}><RenderImage src={collaboration.heroImage||collaboration.images[0]} alt={t(collaboration.title)} loading="lazy"/></a>}<div><p className="eyebrow">{t("SELECTED COLLABORATION")}</p><h2>{t("A shared perspective.")}</h2><p>{fieldText(profile.collaboration,'profile:collaboration')}</p>{collaboration&&<a className="text-link" href={'/projects/'+collaboration.slug}>{t("View the project ↗")}</a>}</div></section>}
 <Contact/></main><Footer/></>;
}
