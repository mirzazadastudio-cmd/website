import {hasCategory, type Category, type Project} from './projects.ts';
export type Collection = {slug:string;category:Category;description:string;scope:string;featuredProject:string};
export const defaultCollections:Collection[] = [
 {slug:'residential',category:'Residential',description:'Places to live, from entire residential quarters to intimate private homes. Architecture in its everyday setting.',scope:'Residential complexes · Apartments · Private homes',featuredProject:'skyline-residences'},
 {slug:'large-buildings',category:'Large Buildings',description:'Architecture at a larger scale. Residential developments, waterfront destinations and hospitality buildings, seen in their wider context.',scope:'Large developments · Hospitality · Urban architecture',featuredProject:'marina-village'},
 {slug:'restoration',category:'Restoration',description:'A new perspective on existing architecture. Façade renewal studies exploring proportion, materials and a building’s relationship with the street.',scope:'Façade renewal · Urban rehabilitation · Material studies',featuredProject:'komfor-residences'},
 {slug:'outdoor-systems',category:'Outdoor Systems',description:'Outdoor living, made visible. Pergolas, bioclimatic roofs and glass systems presented in homes, hospitality spaces and product settings.',scope:'Pergolas · Bioclimatic roofs · Glass systems',featuredProject:'terrace-hotel'},
 {slug:'street',category:'Street',description:'Buildings as part of the city. Street-level perspectives, active frontages and the spaces connecting architecture to daily life.',scope:'Streetscapes · Urban corners · Public spaces',featuredProject:'white-city'},
 {slug:'exterior',category:'Exterior',description:'Light, material and context. Exterior perspectives that communicate a design from its place in the landscape down to the façade.',scope:'Architectural exteriors · Landscape · Atmosphere',featuredProject:'perth-waterfront'},
 {slug:'interior',category:'Interior',description:'A closer view of a space. Interior perspectives shaped by natural light, material relationships and the way people inhabit a room.',scope:'Living spaces · Hospitality interiors · Enclosed terraces',featuredProject:'central-ave'},
 {slug:'product-technical',category:'Product & Technical',description:'From the complete system to the smallest connection. Product renderings, assembly views and cutaways that make mechanisms easier to understand.',scope:'Product modeling · Louver mechanisms · Glass assemblies',featuredProject:'louver-mechanism'},
];
export function collectionProjects(projects:Project[],collection:Collection):Project[]{
 const matching=projects.filter(project=>hasCategory(project,collection.category));
 const featured=matching.find(project=>project.slug===collection.featuredProject);
 return featured?[featured,...matching.filter(project=>project!==featured)]:matching;
}
