import fs from 'node:fs';
import path from 'node:path';
import {render,routes,record,seed,setSnapshot} from '../.prerender/render.js';
const response=await fetch('https://wjynujdjmtgpzzllnwgf.supabase.co/rest/v1/studio_public_content?id=eq.main&select=data,revision',{headers:{apikey:'sb_publishable_O3P3930RyQWPdc9-czr6OQ_IoxwYQ7t'}});
if(!response.ok)throw Error('Cannot retrieve current public content: '+response.status);
const [snapshot]=await response.json();if(!snapshot?.data?.projects)throw Error('Public content is missing');setSnapshot(snapshot);
const template=fs.readFileSync('dist/index.html','utf8');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const route of routes){const {html,meta}=render(route);const title=String(meta.title||'Mirzazada Studio'),description=String(meta.description||'');const canonical='https://mirzazadastudio.com'+(route==='/'?'/':route+'/');const tags=`<meta name="description" content="${esc(description)}"/><link rel="canonical" href="${canonical}"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(description)}"/><meta property="og:url" content="${canonical}"/><meta name="twitter:card" content="summary"/><meta name="twitter:title" content="${esc(title)}"/>${route.startsWith('/admin')?'<meta name="robots" content="noindex,nofollow"/>':''}`;const output=template.replace(/<title>.*?<\/title>/,`<title>${esc(title)}</title>`).replace('<!--metadata-->',tags).replace('<!--app-->',html);const file=path.join('dist',route,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,output);}
fs.writeFileSync('dist/site-content.json',JSON.stringify(record));
// Only a public fallback is shipped. Full seed is a local deployment intermediate.
fs.writeFileSync('.prerender/seed.json',JSON.stringify(seed));
fs.writeFileSync('dist/404.html',template.replace('<!--metadata-->','<meta name="robots" content="noindex"/>'));
fs.writeFileSync('dist/robots.txt','User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://mirzazadastudio.com/sitemap.xml\n');
fs.writeFileSync('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.filter(p=>!p.startsWith('/admin')).map(p=>'<url><loc>https://mirzazadastudio.com'+p+'</loc></url>').join('')+'</urlset>');
console.log(`Prerendered ${routes.length} routes; public snapshot contains ${record.data.projects.length} projects.`);
