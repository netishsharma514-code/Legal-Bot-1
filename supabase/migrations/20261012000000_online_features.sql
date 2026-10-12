create table if not exists public.conversations (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  messages jsonb not null default '[]'::jsonb
    check (jsonb_typeof(messages) = 'array')
);

alter table public.conversations enable row level security;

create policy "Users can read their own conversations"
  on public.conversations for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own conversations"
  on public.conversations for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own conversations"
  on public.conversations for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own conversations"
  on public.conversations for delete to authenticated
  using ((select auth.uid()) = user_id);

create table if not exists public.consultation_inquiries (
  id text primary key,
  inquiry jsonb not null check (jsonb_typeof(inquiry) = 'object'),
  mode text check (mode in ('chamber', 'phone', 'video')),
  created_at timestamptz not null default now()
);

alter table public.consultation_inquiries enable row level security;

create table if not exists public.lawyer_applications (
  id uuid primary key default gen_random_uuid(),
  application jsonb not null check (jsonb_typeof(application) = 'object'),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.lawyer_applications enable row level security;
