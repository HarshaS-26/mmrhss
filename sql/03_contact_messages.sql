create table if not exists public.contact_messages (
    id uuid primary key default gen_random_uuid(),

    name text not null,
    email text,
    phone text,
    message text not null,

    status text not null default 'unread'
        check (status in ('unread', 'read', 'closed')),

    created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;


drop policy if exists "Public can submit contact messages"
on public.contact_messages;

drop policy if exists "Authenticated users can manage contact messages"
on public.contact_messages;


create policy "Public can submit contact messages"
on public.contact_messages
for insert
to anon
with check (true);


create policy "Authenticated users can manage contact messages"
on public.contact_messages
for all
to authenticated
using (true)
with check (true);