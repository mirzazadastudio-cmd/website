import {getDb} from '@/db';
import {adminIdentity,json} from '@/lib/admin-auth';
export async function GET(){if(!await adminIdentity())return json({error:'Giriş tələb olunur.'},401);const assets=await getDb().prepare('SELECT metadata FROM studio_assets ORDER BY created_at DESC').all<{metadata:string}>();return json({items:assets.results.map(row=>JSON.parse(row.metadata))});}
