
import {cache} from 'react';
import {upgradeCatalog} from './catalog-upgrade';
import {projects} from './projects';
import {siteConfig} from './site-config';
import mediaDefaults from './image-variants.json';
import type {MediaInfo} from './media-types';
import crops from './image-crops.json';
import {defaultCollections} from './collections';
import {defaultProfile,defaultJournal,defaultTestimonials} from './studio-content';
import type {ContentRecord,SiteContent} from './content-types';
export const initialContent:SiteContent=upgradeCatalog({catalogVersion:3,projects,settings:siteConfig,crops,collections:defaultCollections,profile:defaultProfile,journal:defaultJournal,testimonials:defaultTestimonials});

export const initialRecord={data:{...initialContent,media:mediaDefaults},revision:0};
