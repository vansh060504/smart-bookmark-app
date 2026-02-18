-- Bookmarks table: private per user
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text not null,
  created_at timestamptz not null default now()
);

-- Index for fast lookups by user
create index bookmarks_user_id_idx on public.bookmarks (user_id);

-- Enable RLS
alter table public.bookmarks enable row level security;

-- Users can only read/insert/update/delete their own bookmarks
create policy "Users can read own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bookmarks"
  on public.bookmarks for update
  using (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- Realtime: include table in publication and send full row on change
alter publication supabase_realtime add table public.bookmarks;
alter table public.bookmarks replica identity full;
