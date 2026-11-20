-- Cloud saves for 팜팜몬.
-- Only the auth user id (the key) and the game save data are stored here.
-- No names, emails or other personal information are kept in public tables.

create table public.saves (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null check (pg_column_size(data) < 512000),
  updated_at timestamptz not null default now()
);

alter table public.saves enable row level security;

create policy "saves_select_own" on public.saves
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "saves_insert_own" on public.saves
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "saves_update_own" on public.saves
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "saves_delete_own" on public.saves
  for delete to authenticated using ((select auth.uid()) = user_id);
