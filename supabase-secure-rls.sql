-- 1. Сброс старых публичных политик
drop policy if exists "Allow anonymous submissions" on public.leads;
drop policy if exists "Allow full access for authenticated and anon client" on public.leads;
drop policy if exists "Allow update for leads" on public.leads;
drop policy if exists "Allow delete for leads" on public.leads;
drop policy if exists "Allow authenticated full access" on public.leads;
drop policy if exists "Anon can only insert leads" on public.leads;
drop policy if exists "Admin full access for leads" on public.leads;

-- 2. Включаем защиту Row Level Security (RLS)
alter table public.leads enable row level security;

-- 3. ПОЛИТИКА 1: Публичные посетители сайта (anon)
-- Могут ТОЛЬКО отправлять новые заявки (чтение и удаление заблокированы)
create policy "Anon can only insert leads"
  on public.leads
  for insert
  to anon
  with check (true);

-- 4. ПОЛИТИКА 2: Авторизованный администратор (authenticated)
-- Имеет полный доступ (просмотр, редактирование, удаление)
create policy "Admin full access for leads"
  on public.leads
  for all
  to authenticated
  using (true)
  with check (true);
