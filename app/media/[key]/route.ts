import {runtime,getDb} from '@/db';
import {adminIdentity} from '@/lib/admin-auth';
import {getPublicContent} from '@/lib/content-store';
import {mediaSources} from '@/lib/media-sources';
export async function GET(request:Request,{params}:{params:Promise<{key:string}>}){
 const {key}=await params;if(!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(key))return new Response('Not found',{status:404});
 const isAdmin=!!await adminIdentity();
 if(!isAdmin){
  const {data}=await getPublicContent(),used=mediaSources(data);let permitted=used.has('/media/'+key);
  if(!permitted){const checksum=key.split('-')[0];if(/^[a-f0-9]{64}$/.test(checksum)){const asset=await getDb().prepare('SELECT src FROM studio_assets WHERE id=?').bind(checksum).first<{src:string}>();permitted=!!asset&&used.has(asset.src);}}
  if(!permitted)return new Response('Not found',{status:404});
 }
 const object=await runtime().MEDIA.get(key);if(!object)return new Response('Not found',{status:404});const headers=new Headers();object.writeHttpMetadata(headers);headers.set('X-Content-Type-Options','nosniff');headers.set('ETag',object.httpEtag);headers.set('Cache-Control',isAdmin?'private,no-store':'private,max-age=300');return new Response(object.body,{headers});
}
