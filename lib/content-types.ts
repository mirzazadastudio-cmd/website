import type {Project} from './projects';
import type {siteConfig} from './site-config';
import type {Collection} from './collections';
import type {StudioProfile,JournalPost,Testimonial} from './studio-content';
export type Crop = {width:number;height:number;bottom:number};
export type SiteContent = {texts?:import("./content-texts").SiteTexts;animations?:import('./animation-playlist').AnimationVideo[];media?:Record<string,import('./media-types').MediaInfo>;catalogVersion?:number;projectRedirects?:Record<string,string>;projects:Project[];settings:typeof siteConfig;crops:Record<string,Crop>;collections:Collection[];profile:StudioProfile;journal:JournalPost[];testimonials:Testimonial[]};
export type ContentRecord = {data:SiteContent;revision:number};
