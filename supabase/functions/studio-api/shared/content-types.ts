import type {Project} from './projects.ts';
import type {siteConfig} from './site-config.ts';
import type {Collection} from './collections.ts';
import type {StudioProfile,JournalPost,Testimonial} from './studio-content.ts';
export type Crop = {width:number;height:number;bottom:number};
export type SiteContent = {media?:Record<string,import('./media-types').MediaInfo>;catalogVersion?:number;projectRedirects?:Record<string,string>;projects:Project[];settings:typeof siteConfig;crops:Record<string,Crop>;collections:Collection[];profile:StudioProfile;journal:JournalPost[];testimonials:Testimonial[]};
export type ContentRecord = {data:SiteContent;revision:number};
