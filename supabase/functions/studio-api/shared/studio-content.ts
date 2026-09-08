import aiStudioNotes from './ai-studio-notes.json' with {type:'json'};
export type StudioProfile = {
 portrait:string;role:string;experience:string;location:string;introduction:string;biography:string;
 markets:string;expertise:string;education:string;collaboration:string;linkedin:string;
};
export type JournalPost = {slug:string;title:string;excerpt:string;body:string;image:string;topic:string;date:string;projectSlug:string;published:boolean};
export type Testimonial = {id:string;name:string;role:string;quote:string;sample:boolean;published:boolean};
export const defaultProfile:StudioProfile = {
 portrait:'/images/ilkin-mirzazada.webp',role:'Architect & 3D Visualization Specialist',experience:'12+ years',location:'Baku, Azerbaijan',
 introduction:'I’m Ilkin Mirzazada, an architect and 3D visualization specialist. I create images that help people understand architecture, experience a space and see the potential of a product.',
 biography:'My work moves between large urban developments, residential and hospitality spaces, and detailed outdoor systems. Lighting, materials and composition connect these different scales.\n\nAlongside architectural visualization, I create product presentations and 3D assets for marketing, web configurators and client presentations. My workflow includes SketchUp, Lumion, V-Ray and Adobe Photoshop, supported by AI-assisted processes where useful.',
 markets:'Working with clients across the USA, Europe, the Middle East and Australia.',
 expertise:'Architectural visualization\nInterior & exterior rendering\nPergolas, louvered roofs & glass systems\nProduct modeling & animation\n3D assets for web configurators',
 education:'Azerbaijan University of Architecture and Construction · 2013–2017',
 collaboration:'Sea Breeze — Marina Village, Baku. Architectural visualization in collaboration with Qala Group, with a focus on pedestrian areas, public spaces and the waterfront connection.',
 linkedin:'https://www.linkedin.com/in/mrzzd/',
};
export const defaultJournal:JournalPost[] = [
 ...aiStudioNotes,
 {slug:'architecture-at-street-level',title:'Architecture at street level.',excerpt:'Why the space around a building matters as much as the building itself.',topic:'Architecture',date:'2026-09-08',image:'/images/marina-village-catalog-1.webp',projectSlug:'marina-village',published:true,body:'A building is rarely experienced in isolation. Its character also comes from the pavement, planting, entrances and the spaces between façades. A street-level view brings those relationships into focus.\n\nIn an architectural image, people and landscape help establish scale. The direction of light reveals depth; a carefully chosen viewpoint makes circulation and the public realm easier to read.\n\nThe Marina Village collection explores waterfront architecture through these connected perspectives. Open the project to see the broader setting and individual views.'},
 {slug:'outdoor-spaces-through-light',title:'Outdoor spaces, through light.',excerpt:'Pergolas and glass systems seen as part of the space they create.',topic:'Outdoor Systems',date:'2026-09-08',image:'/images/winter-garden-catalog-1.webp',projectSlug:'winter-garden',published:true,body:'A pergola is both a product and a place. The frame, roof and glazing define the system, while light and its setting explain how that system might feel in use.\n\nExterior views show the relationship to a house, terrace or landscape. Views from within the enclosure help communicate transparency, shade and proportions at a more personal scale.\n\nA useful set of renders moves between those perspectives. Explore the Outdoor Systems collection for pergolas, bioclimatic roofs and glazed spaces in different settings.'},
 {slug:'from-system-to-detail',title:'From system to detail.',excerpt:'A closer look at product assemblies, louver mechanisms and cutaway views.',topic:'Product & Technical',date:'2026-09-08',image:'/images/louver-mechanism-catalog-1.webp',projectSlug:'louver-mechanism',published:true,body:'A complete product view explains the silhouette. A closer view can explain how parts relate to one another: a profile, a moving louver or a connection hidden inside an assembly.\n\nCutaway and assembly renders make those relationships visible. Consistent materials and a clear viewpoint help the viewer move from the finished system to its individual elements.\n\nThese visualizations support product communication and presentations. The Product & Technical collection brings together the available mechanism and glass-system studies.'},
];
export const defaultTestimonials:Testimonial[] = [
 {id:'sample-architecture',name:'Example client',role:'Architecture · sample review',quote:'The images helped us present the space clearly, with a strong sense of light and material.',sample:true,published:true},
 {id:'sample-outdoor',name:'Example client',role:'Outdoor systems · sample review',quote:'Seeing the system in context made the design much easier to discuss and understand.',sample:true,published:true},
];
