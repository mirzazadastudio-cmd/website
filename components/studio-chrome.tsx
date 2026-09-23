'use client';
import {LanguageSwitcher} from './language-switcher';
import {fieldText,t} from '@/lib/i18n';
import {RenderImage} from './render-image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, ArrowUpRight } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { useSiteContent } from '@/components/content-provider';

export function Header() {
 const {settings:siteConfig,projects}=useSiteContent();
 const [open, setOpen] = useState(false);
 const [hidden,setHidden]=useState(false);
 const [scrolled,setScrolled]=useState(false);
 useEffect(()=>{
  let last=window.scrollY,travel=0,frame=0;
  const update=()=>{
   frame=0;const y=Math.max(0,window.scrollY),delta=y-last;last=y;
   setScrolled(y>12);
   if(y<100){setHidden(false);travel=0;return;}
   if(Math.abs(delta)<1)return;
   travel=Math.sign(delta)===Math.sign(travel)?travel+delta:delta;
   if(Math.abs(travel)>=10){setHidden(travel>0);travel=0;}
  };
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
  window.addEventListener('scroll',scroll,{passive:true});update();
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',scroll);};
 },[]);
 const otherLinks=siteConfig.navigation.filter(n=>!/^animations?$/i.test(n.label)&&!['/animation','/animation/','/#animations'].includes(n.href));
 const navigation=[...otherLinks.slice(0,1),{label:'Animation',href:'/animation/'},...otherLinks.slice(1)];
 return <div className="site-header-shell" data-hidden={hidden&&!open} data-scrolled={scrolled}><header className="site-header"><Link href="/" className="wordmark" aria-label={t(`${siteConfig.name} home`)}>{siteConfig.logoUrl?<RenderImage className="brand-logo" src={siteConfig.logoUrl} alt={t("Mirzazada Studio")} fit="contain"/>:<>{t("MIRZAZADA")}<span>{t("STUDIO")}</span></>}</Link><nav aria-label={t("Main navigation")}>{navigation.map(n => <Link key={n.label} href={n.href}>{t(n.label)}</Link>)}</nav><div className="header-actions"><LanguageSwitcher/><Link href="/#contact" className="header-cta">{t("Let's talk")} <ArrowUpRight size={19}/></Link><Sheet open={open} onOpenChange={setOpen}><SheetTrigger className="mobile-toggle" aria-label={t("Open navigation")}><Menu size={23}/></SheetTrigger><SheetContent className="mobile-sheet"><SheetTitle>{t("Mirzazada Studio")}</SheetTitle><SheetDescription>{t("Architecture & visualization")}</SheetDescription><nav aria-label={t("Mobile navigation")}>{navigation.map(n=><Link key={n.label} href={n.href} onClick={()=>setOpen(false)}>{t(n.label)}<ArrowUpRight/></Link>)}</nav></SheetContent></Sheet></div></header></div>;
}
export function Footer() {
 const {settings:siteConfig,projects}=useSiteContent();
 return <footer className="footer"><div className="footer-top"><Link href="/" className="wordmark">{siteConfig.logoUrl?<RenderImage className="brand-logo" src={siteConfig.logoUrl} alt={t("Mirzazada Studio")} fit="contain"/>:<>{t("MIRZAZADA")}<span>{t("STUDIO")}</span></>}</Link><p>{t("Architecture imagined.")}<br/>{t("Atmosphere made visible.")}</p><a href="#main" className="back-top">{t("Back to top ↑")}</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {fieldText(siteConfig.name,'settings:name')}</span><a href={'mailto:'+siteConfig.contact.email}>{t(siteConfig.contact.email)}</a><span>{t("by")} {fieldText(siteConfig.founder,'settings:founder')}</span></div></footer>;
}
