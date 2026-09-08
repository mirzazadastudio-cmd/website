import {Header,Footer} from '@/components/studio-chrome';
import {ProjectsIndex} from '@/components/projects-index';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('Projects','Architectural, interior, restoration and outdoor-system visualization by Mirzazada Studio.','/projects');
export default function ProjectsPage(){return <><Header/><main id="main"><ProjectsIndex/></main><Footer/></>;}
