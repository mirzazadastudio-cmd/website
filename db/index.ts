import { env } from 'cloudflare:workers';
export function runtime(){ return env as unknown as {DB:D1Database;MEDIA:R2Bucket;ADMIN_OWNER_EMAIL?:string}; }
export function getDb(){if(!runtime().DB)throw new Error('Database unavailable');return runtime().DB;}
