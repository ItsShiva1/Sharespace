-- ShareSpace - Supabase Database Setup Script

-- 1. Create the 'snippets' table for detailed code snippets
create table if not exists public.snippets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tabs jsonb not null default '[]'::jsonb,
  uploads jsonb not null default '[]'::jsonb,
  lang text,
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
  user_id uuid references auth.users(id) on delete cascade,
  snippet_id uuid, -- Reference to snippets.id or same as id for standalone uploads
  title text not null,
  lang text,
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
-- Anyone can view public snippets
create policy "Public snippets are viewable by everyone" 
on public.snippets for select 
using (is_public = true);

-- Anyone can create a snippet (anonymous or logged in)
create policy "Anyone can insert snippets" 
on public.snippets for insert 
with check (true);

-- 5. Create Policies for 'history'
-- Users can only view their own history
create policy "Users can view their own history" 
on public.history for select 
using (auth.uid() = user_id);

-- Users can only insert their own history
create policy "Users can insert their own history" 
on public.history for insert 
with check (auth.uid() = user_id);

-- Users can update their own history (for pinning/etc)
create policy "Users can update their own history" 
on public.history for update 
using (auth.uid() = user_id);

-- Users can delete their own history
create policy "Users can delete their own history" 
on public.history for delete 
using (auth.uid() = user_id);

-- 6. Storage Instructions
-- In the Supabase Dashboard, create a PUBLIC bucket named 'uploads'.
-- Add the following storage policies:
-- Policy: "Public Access" -> ALLOW SELECT for 'public'
-- Policy: "Authenticated Upload" -> ALLOW INSERT/UPDATE for 'authenticated'
