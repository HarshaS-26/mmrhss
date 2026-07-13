/*
-------------------------------------------------------
MMRHSS CMS
Module : Gallery
File   : 02_gallery.sql
Purpose: Creates gallery table and storage policies
-------------------------------------------------------
*/
-- Gallery Table
create table if not exists gallery (
    id uuid primary key default gen_random_uuid(),
    title varchar(100) not null,
    category varchar(50) not null,
    image_url text not null,
    status varchar(20) not null default 'published',
    display_order int default 0,
    created_at timestamp with time zone default now()
);

-- Enable RLS
alter table gallery enable row level security;

-- Remove old policies if they exist
drop policy if exists "Allow authenticated users to manage gallery" on gallery;
drop policy if exists "Allow public read published gallery" on gallery;
drop policy if exists "Authenticated Full Access" on gallery;
drop policy if exists "Public Read Published" on gallery;

-- Table policies
create policy "Gallery public read"
on gallery
for select
to anon, authenticated
using (status = 'published' or auth.role() = 'authenticated');

create policy "Gallery authenticated insert"
on gallery
for insert
to authenticated
with check (true);

create policy "Gallery authenticated update"
on gallery
for update
to authenticated
using (true)
with check (true);

create policy "Gallery authenticated delete"
on gallery
for delete
to authenticated
using (true);

-- Storage bucket policies
drop policy if exists "Gallery images public read" on storage.objects;
drop policy if exists "Gallery images authenticated upload" on storage.objects;
drop policy if exists "Gallery images authenticated update" on storage.objects;
drop policy if exists "Gallery images authenticated delete" on storage.objects;

create policy "Gallery images public read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'gallery-images');

create policy "Gallery images authenticated upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'gallery-images');

create policy "Gallery images authenticated update"
on storage.objects
for update
to authenticated
using (bucket_id = 'gallery-images')
with check (bucket_id = 'gallery-images');

create policy "Gallery images authenticated delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'gallery-images');