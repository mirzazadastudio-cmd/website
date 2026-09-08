
create table public.studio_owner(id text primary key check(id='main'),email text not null,user_id uuid unique references auth.users(id),setup_hash text);
create table public.studio_content(id text primary key check(id='main'),data jsonb not null,revision integer not null default 0,updated_at timestamptz not null default now());
create table public.studio_public_content(id text primary key check(id='main'),data jsonb not null,revision integer not null default 0,updated_at timestamptz not null default now());
create table public.studio_revisions(revision integer primary key,data jsonb not null,created_at timestamptz not null default now());
create table public.studio_assets(id uuid primary key,checksum text not null unique,original_path text not null,metadata jsonb not null,created_at timestamptz not null default now());
create table public.studio_inquiries(id uuid primary key,name text not null,email text not null,company text not null default '',project_type text not null,deadline text not null default '',message text not null,attribution text not null default '{}',status text not null default 'new' check(status in ('new','reviewing','replied','closed','spam')),notification text not null default 'not_configured',created_at timestamptz not null default now());
create index studio_inquiries_created_idx on public.studio_inquiries(created_at desc);
create table public.studio_rate_limits(key text primary key,count integer not null,expires_at timestamptz not null);
alter table public.studio_owner enable row level security;
alter table public.studio_content enable row level security;
alter table public.studio_public_content enable row level security;
alter table public.studio_revisions enable row level security;
alter table public.studio_assets enable row level security;
alter table public.studio_inquiries enable row level security;
alter table public.studio_rate_limits enable row level security;
revoke all on public.studio_owner,public.studio_content,public.studio_public_content,public.studio_revisions,public.studio_assets,public.studio_inquiries,public.studio_rate_limits from anon,authenticated;
grant all on public.studio_owner,public.studio_content,public.studio_public_content,public.studio_revisions,public.studio_assets,public.studio_inquiries,public.studio_rate_limits to service_role;
grant select on public.studio_public_content to anon,authenticated;
create policy "Published studio content" on public.studio_public_content for select to anon,authenticated using(id='main');

create function public.studio_save(expected_revision integer,full_data jsonb,published_data jsonb) returns integer language plpgsql security invoker set search_path='' as $$
declare previous public.studio_content%rowtype;
begin
 select * into previous from public.studio_content where id='main' for update;
 if not found or previous.revision<>expected_revision then raise exception 'CONFLICT'; end if;
 insert into public.studio_revisions(revision,data) values(previous.revision,previous.data) on conflict do nothing;
 update public.studio_content set data=full_data,revision=revision+1,updated_at=now() where id='main';
 insert into public.studio_public_content(id,data,revision) values('main',published_data,expected_revision+1)
 on conflict(id) do update set data=excluded.data,revision=excluded.revision,updated_at=now();
 delete from public.studio_revisions where revision not in(select revision from public.studio_revisions order by revision desc limit 30);
 return expected_revision+1;
end; $$;
revoke execute on function public.studio_save(integer,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.studio_save(integer,jsonb,jsonb) to service_role;

create function public.studio_rate_limit(rate_key text,limit_count integer,window_seconds integer) returns boolean language plpgsql security invoker set search_path='' as $$
declare current_count integer;
begin
 delete from public.studio_rate_limits where expires_at<now();
 insert into public.studio_rate_limits(key,count,expires_at) values(rate_key,1,now()+make_interval(secs=>window_seconds))
 on conflict(key) do update set count=public.studio_rate_limits.count+1 returning count into current_count;
 return current_count>limit_count;
end; $$;
revoke execute on function public.studio_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.studio_rate_limit(text,integer,integer) to service_role;

create function public.studio_claim_setup(token_hash text) returns text language plpgsql security invoker set search_path='' as $$
declare owner_email text;
begin
 update public.studio_owner set setup_hash=null where id='main' and user_id is null and setup_hash=token_hash returning email into owner_email;
 return owner_email;
end; $$;
revoke execute on function public.studio_claim_setup(text) from public,anon,authenticated;
grant execute on function public.studio_claim_setup(text) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('studio-originals','studio-originals',false,20971520,array['image/jpeg','image/png','image/webp']),
('studio-media','studio-media',true,20971520,array['image/webp']) on conflict(id) do nothing;
