import {canonical} from '@/lib/seo';
export function GET(){return new Response('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: '+canonical('/sitemap.xml')+'\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});}
