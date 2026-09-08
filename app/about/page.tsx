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
 return <><Header/><main id="main"><section className="section about-hero"><div className="about-portrait"><RenderImage src={profile.portrait} alt={settings.founder} loading="eager" fetchPriority="high"/></div><div className="about-intro"><p className="eyebrow">THE PERSON BEHIND THE PERSPECTIVE</p><h1>{settings.founder}<span>.</span></h1><p className="about-role">{profile.role}</p><p className="about-lead">{profile.introduction}</p><div className="about-facts"><div><strong>{profile.experience}</strong><span>Professional experience</span></div><div><strong>{profile.location}</strong><span>Based in · working internationally</span></div></div>{profile.linkedin&&<a className="text-link" href={profile.linkedin} target="_blank" rel="noreferrer">Professional profile on LinkedIn ↗</a>}</div></section>
 <section className="section about-story"><div><p className="eyebrow">ARCHITECTURE / PRODUCTS / ATMOSPHERE</p><h2>One eye for detail.<br/>Many scales of work.</h2></div><div className="prose">{profile.biography.split(/\n\s*\n/).map((paragraph,i)=><p key={i}>{paragraph}</p>)}<p>{profile.markets}</p></div></section>
 <section className="section about-background"><div><p className="eyebrow">FOCUS</p><ul>{profile.expertise.split('\n').filter(Boolean).map((line,i)=><li key={i}>{line}</li>)}</ul></div><div><p className="eyebrow">EDUCATION</p><p>{profile.education}</p><p className="profile-source">Career details from <a href={profile.linkedin||'https://www.linkedin.com/in/mrzzd/'} target="_blank" rel="noreferrer">LinkedIn</a> and <a href="https://www.twine.net/mrzzd" target="_blank" rel="noreferrer">Twine</a>.</p></div></section>
 {profile.collaboration&&<section className="about-collaboration">{collaboration&&<a className="collaboration-image" href={'/projects/'+collaboration.slug}><RenderImage src={collaboration.heroImage||collaboration.images[0]} alt={collaboration.title} loading="lazy"/></a>}<div><p className="eyebrow">SELECTED COLLABORATION</p><h2>A shared perspective.</h2><p>{profile.collaboration}</p>{collaboration&&<a className="text-link" href={'/projects/'+collaboration.slug}>View the project ↗</a>}</div></section>}
 <Contact/></main><Footer/></>;
}
