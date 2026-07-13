/*
-------------------------------------------------------
MMRHSS CMS
Module : News & Events
File   : 01_news.sql
Purpose: Creates News table and storage policies
-------------------------------------------------------
*/

-- =====================================================
-- NEWS TABLE
-- =====================================================

create table if not exists public.news_events (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null,
    category text not null default 'News',
    event_date date not null,
    image_url text,
    link_url text,
    status text not null default 'published',
    created_at timestamp with time zone default now()
);

alter table public.news_events enable row level security;


-- =====================================================
-- REMOVE OLD NEWS POLICIES
-- =====================================================

drop policy if exists "Allow Select"
on public.news_events;

drop policy if exists "Allow Insert"
on public.news_events;

drop policy if exists "Allow Update"
on public.news_events;

drop policy if exists "Allow Delete"
on public.news_events;

drop policy if exists "Authenticated users can manage news"
on public.news_events;

drop policy if exists "Public can read published news"
on public.news_events;


-- =====================================================
-- FINAL NEWS POLICIES
-- Matches the two policies currently shown in Supabase
-- =====================================================

create policy "Authenticated users can manage news"
on public.news_events
for all
to authenticated
using (true)
with check (true);

create policy "Public can read published news"
on public.news_events
for select
to public
using (status = 'published');


-- =====================================================
-- STORAGE POLICIES FOR news-images
-- =====================================================

drop policy if exists
"Authenticated users can upload news images"
on storage.objects;

drop policy if exists
"Authenticated users can update news images"
on storage.objects;

drop policy if exists
"Public can view news images"
on storage.objects;

drop policy if exists
"Authenticated users can delete news images"
on storage.objects;


create policy "Authenticated users can upload news images"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'news-images'
);

create policy "Public can view news images"
on storage.objects
for select
to public
using (
    bucket_id = 'news-images'
);

create policy "Authenticated users can delete news images"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'news-images'
);