import type {Metadata} from 'next';
import {AdminPanel} from '@/components/admin-panel';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Admin',robots:{index:false,follow:false}};
export default function Admin(){return <AdminPanel/>;}
