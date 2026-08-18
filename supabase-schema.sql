-- ==========================================
-- Yapil CRM — Supabase Database Schema
-- Вставьте этот SQL в Supabase -> SQL Editor и нажмите Run
-- ==========================================

-- 1. Создание таблицы лидов
create table if not exists public.leads (
  id text primary key,
  name text not null,
  phone text not null,
  raw_phone text,
  email text,
  services text[] default '{}',
  message text,
  status text default 'new' check (status in ('new', 'contacted', 'meeting', 'proposal', 'won', 'lost')),
  priority text default 'normal' check (priority in ('normal', 'high', 'urgent')),
  budget text,
  source text default 'contacts_form',
  source_details text,
  page_url text,
  referrer text,
  utm jsonb default '{}'::jsonb,
  notes jsonb default '[]'::jsonb,
  activities jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Индексы для быстрой фильтрации и поиска
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- 3. Включение Row Level Security (RLS)
alter table public.leads enable row level security;

-- 4. Политики доступа:
-- Разрешить анонимным пользователям сайта отправлять новые заявки
create policy "Allow anonymous submissions"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

-- Разрешить чтение и обновление заявок
create policy "Allow full access for authenticated and anon client"
  on public.leads
  for select
  to anon, authenticated
  using (true);

create policy "Allow update for leads"
  on public.leads
  for update
  to anon, authenticated
  using (true);

create policy "Allow delete for leads"
  on public.leads
  for delete
  to anon, authenticated
  using (true);

-- 5. Включение Realtime (чтобы заявки появлялись на доске моментально)
alter publication supabase_realtime add table public.leads;
