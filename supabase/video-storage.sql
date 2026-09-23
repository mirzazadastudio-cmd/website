-- Apply together with studio-api after release approval.
-- A dedicated public bucket contains owner-uploaded portfolio videos only.
-- No client INSERT/UPDATE policy: the owner-only API issues upload tokens.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('studio-videos','studio-videos',true,52428800,array['video/mp4','video/webm'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
