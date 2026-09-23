import { projects } from './projects';
// Edit brand, navigation and contact information here.
// Set contact.isPlaceholder to false after replacing all sample details.
export const siteConfig = {
  name: 'Mirzazada Studio',
  founder: 'Ilkin Mirzazada',
  logoUrl:'',
  tagline: ['Imagined with purpose.', 'Rendered with feeling.'],
  introduction: 'We turn architectural ideas into images that feel real. Thoughtful spaces. Compelling perspectives.',
  navigation: [{ label: 'Projects', href: '/projects' }, { label: 'Animations', href: '/#animations' }, { label: 'About', href: '/about' }, { label: 'Services', href: '/services' }, { label: 'Contact', href: '/contact' }],
  // The order below controls the moving homepage cards.
  homepage: {
    projectOrder: ['skyline-residences', 'garden-residences', 'courtyard-quarter', 'arcade-residences', 'marina-village', 'perth-waterfront', 'komfor-residences', 'winter-park-corner', 'terrace-hotel', 'urban-facade', 'central-ave', 'portobello', 'winter-garden', 'pool-pavilion', 'louver-mechanism', 'sliding-glass'],
    cycleSeconds: 140,
    studioImage: '/images/beverly-hills-1.webp',
  },
  services: [
 {title:'Architectural visualization',text:'Exterior images that communicate scale, context and the character of a building.',tag:'EXTERIORS',image:'/images/marina-village-thumb.webp'},
 {title:'Interior visualization',text:'Material, light and composition. Images that let you experience a space before it exists.',tag:'INTERIORS',image:'/images/central-interiors-thumb.webp'},
 {title:'Outdoor & product visuals',text:'Pergolas, terraces and outdoor living. Detailed visuals that place your product in its world.',tag:'OUTDOOR LIVING',image:'/images/portobello-thumb.webp'},
 {title:'Animation & visual storytelling',text:'From precise models to moving perspectives, a fuller way to present your design.',tag:'IN MOTION',image:'/images/pool-pavilion-thumb.webp'},
 {title:'3D Modeling',text:'Detailed architectural and product models for visualization and presentation.',tag:'3D MODELING',image:'/images/louver-mechanism-catalog-1.webp'},
 {title:'Masterplan & Landscape Visualization',text:'Neighborhoods, public spaces and landscapes communicated through clear master views.',tag:'MASTERPLAN',image:'/images/courtyard-quarter-catalog-1.webp'},
 {title:'Façade & Concept Development',text:'Façade renewal, material alternatives and architectural concepts explored through visualization.',tag:'FAÇADE',image:'/images/urban-facade-catalog-1.webp'},
].map((service,i)=>({...service,audience:['Architecture studios and developers','Interior designers and hospitality teams','Outdoor-living and glazing manufacturers','Teams presenting a space or product in motion','Manufacturers and design studios','Developers and landscape architects','Architects and façade development teams'][i],deliverables:['Exterior perspectives and material studies.','Interior perspectives, lighting and material-focused views.','Pergolas and glass systems in context, product and detail views.','Animated perspectives and AI-assisted visual presentations.','Detailed 3D models and presentation-ready product assets.','Master views, aerial perspectives and landscape visualization.','Façade concepts, renewal studies and material alternatives.'][i]})),
  contact: { isPlaceholder: false, email: 'hello@mirzazadastudio.com', phone: '+994 XX XXX XX XX', whatsapp: '', instagram: '@mirzazada.studio', instagramUrl: 'https://www.instagram.com/mirzazada.studio/', behanceUrl:'' },
};
