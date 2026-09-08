import type {ProjectBlock,Frame} from './project-blocks';
import catalog from './project-catalog.json';
export const projectCategories = ['Residential', 'Large Buildings', 'Restoration', 'Outdoor Systems', 'Street', 'Exterior', 'Interior', 'Product & Technical', 'AI'] as const;
export type Category = (typeof projectCategories)[number];
export const projectTopics = ['Pergolas', 'Bioclimatic roofs', 'Glass systems', 'Exterior views', 'Interior views', 'Assembly & cutaways'] as const;
export type ProjectTopic = (typeof projectTopics)[number];
export type Project = {id?:string;status?:'draft'|'published'|'archived';location?:string;year?:string;client?:string;credit?:string;services?:string[];coverFrame?:Frame;blocks?:ProjectBlock[];createdAt?:string;updatedAt?:string;publishedAt?:string;seoTitle?:string;seoDescription?:string;displayPermission?:'unreviewed'|'confirmed'|'confidential';slug:string;title:string;category:Category;categories?:Category[];topics?:ProjectTopic[];type:string;description:string;images:string[];coverImage?:string;heroImage?:string;heroPosition?:string};
export const projects = catalog as Project[];
export const hasCategory = (project:Project, category:Category) => project.category===category || !!project.categories?.includes(category);

export const isPublished=(project:Project)=>project.status!=='draft'&&project.status!=='archived'&&project.displayPermission!=='confidential';
