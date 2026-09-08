'use client';
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
 const navigation=siteConfig.navigation.some(n=>n.href==='/animation')?siteConfig.navigation:[...siteConfig.navigation.slice(0,1),{label:'Animation',href:'/animation'},...siteConfig.navigation.slice(1)];
 return <div className="site-header-shell" data-hidden={hidden&&!open} data-scrolled={scrolled}><header className="site-header"><Link href="/" className="wordmark" aria-label={`${siteConfig.name} home`}>{siteConfig.logoUrl?<RenderImage className="brand-logo" src={siteConfig.logoUrl} alt="Mirzazada Studio" fit="contain"/>:<>MIRZAZADA<span>STUDIO</span></>}</Link><nav aria-label="Main navigation">{navigation.map(n => <Link key={n.label} href={n.href}>{n.label}</Link>)}</nav><div className="header-actions"><Link href="/#contact" className="header-cta">Let's talk <ArrowUpRight size={19}/></Link><Sheet open={open} onOpenChange={setOpen}><SheetTrigger className="mobile-toggle" aria-label="Open navigation"><Menu size={23}/></SheetTrigger><SheetContent className="mobile-sheet"><SheetTitle>Mirzazada Studio</SheetTitle><SheetDescription>Architecture & visualization</SheetDescription><nav aria-label="Mobile navigation">{navigation.map(n=><Link key={n.label} href={n.href} onClick={()=>setOpen(false)}>{n.label}<ArrowUpRight/></Link>)}</nav></SheetContent></Sheet></div></header></div>;
}
export function Footer() {
 const {settings:siteConfig,projects}=useSiteContent();
 return <footer className="footer"><div className="footer-top"><Link href="/" className="wordmark">{siteConfig.logoUrl?<RenderImage className="brand-logo" src={siteConfig.logoUrl} alt="Mirzazada Studio" fit="contain"/>:<>MIRZAZADA<span>STUDIO</span></>}</Link><p>Architecture imagined.<br/>Atmosphere made visible.</p><a href="#main" className="back-top">Back to top ↑</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {siteConfig.name}</span><a href={'mailto:'+siteConfig.contact.email}>{siteConfig.contact.email}</a><span>by {siteConfig.founder}</span></div></footer>;
}
