-- ShareSpace - Supabase Database Setup Script (Hybrid Firebase Auth Version)

-- MIGRATION NOTE: If you already have the history table, run this to allow Firebase Auth:
-- ALTER TABLE public.history DROP CONSTRAINT IF EXISTS history_user_id_fkey;
-- ALTER TABLE public.history ALTER COLUMN user_id TYPE text;

-- 1. Create the 'snippets' table for detailed code snippets
create table if not exists public.snippets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tabs jsonb not null default '[]'::jsonb,
  uploads jsonb not null default '[]'::jsonb,
  lang text,
  slug text unique,
  is_public boolean default true,
  share_url text,
  tags text[] default array[]::text[],
  views int8 default 0,
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- 2. Create the 'history' table for user history tracking
create table if not exists public.history (
  id uuid primary key default gen_random_uuid(),
  user_id text not null, -- Store Firebase UID as text (or uuid if valid)
  snippet_id uuid, -- Reference to snippets.id or same as id for standalone uploads
  title text not null,
  lang text,
  slug text,
  preview text,
  share_url text,
  file_count int4 default 0,
  upload_count int4 default 0,
  is_pinned boolean default false,
  views int8 default 0,
  tags text[] default array[]::text[],
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- 3. Enable Row Level Security (RLS)
alter table public.snippets enable row level security;
alter table public.history enable row level security;

-- 4. Create Policies for 'snippets'
-- (Using DO blocks to avoid errors if policies already exist)
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Public snippets are viewable by everyone') then
    create policy "Public snippets are viewable by everyone" on public.snippets for select using (is_public = true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Anyone can insert snippets') then
    create policy "Anyone can insert snippets" on public.snippets for insert with check (true);
  end if;
end $$;

-- 5. Create Policies for 'history' (Updated for Hybrid Firebase Auth)
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Anyone can view history by user_id') then
    -- We rely on the application to filter by the user's Firebase UID
    create policy "Anyone can view history by user_id" on public.history for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Anyone can insert their own history') then
    create policy "Anyone can insert their own history" on public.history for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Anyone can update their own history') then
    create policy "Anyone can update their own history" on public.history for update using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Anyone can delete their own history') then
    create policy "Anyone can delete their own history" on public.history for delete using (true);
  end if;
end $$;

-- 6. Storage Instructions
-- In the Supabase Dashboard, create a PUBLIC bucket named 'uploads'.
-- Add the following storage policies:
-- Policy: "Public Access" -> ALLOW SELECT for 'public'
-- Policy: "Authenticated Upload" -> ALLOW INSERT/UPDATE for 'authenticated'
