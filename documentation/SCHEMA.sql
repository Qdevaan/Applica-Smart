-- =====================================================================
-- Applica-Smart — Complete Database Schema
-- Apply against a fresh Supabase project. RLS is DISABLED on all tables
-- per project decision. Re-enable + add policies before production.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Helper: updated_at trigger function
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  -- core
  name text,
  email text,
  phone text,
  address text,
  bio text,
  -- visual
  photo_url text,
  accent_color text default '#1e3a5f',
  -- arrays (JSONB)
  experience       jsonb not null default '[]'::jsonb,
  education        jsonb not null default '[]'::jsonb,
  skills           jsonb not null default '[]'::jsonb,
  skill_levels     jsonb not null default '[]'::jsonb,
  hobbies          jsonb not null default '[]'::jsonb,
  links            jsonb not null default '[]'::jsonb,
  projects         jsonb not null default '[]'::jsonb,
  certifications   jsonb not null default '[]'::jsonb,
  languages        jsonb not null default '[]'::jsonb,
  publications     jsonb not null default '[]'::jsonb,
  awards           jsonb not null default '[]'::jsonb,
  volunteer        jsonb not null default '[]'::jsonb,
  references_list  jsonb not null default '[]'::jsonb,
  -- prefs
  preferences      jsonb not null default '{}'::jsonb,
  template_prefs   jsonb not null default '{}'::jsonb,
  cv_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles disable row level security;

drop trigger if exists profiles_updated on public.profiles;
create trigger profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- cv_documents
-- ---------------------------------------------------------------------
create table if not exists public.cv_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id text not null,
  title text,
  data_snapshot jsonb not null,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cv_documents disable row level security;

create index if not exists cv_documents_user_idx on public.cv_documents(user_id);

drop trigger if exists cv_documents_updated on public.cv_documents;
create trigger cv_documents_updated
  before update on public.cv_documents
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- job_applications
-- ---------------------------------------------------------------------
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_title text,
  company text,
  job_url text,
  location text,
  salary_min int,
  salary_max int,
  status text not null default 'pending',
  notes text,
  applied_at timestamptz,
  response_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.job_applications disable row level security;

create index if not exists job_applications_user_idx on public.job_applications(user_id);
create index if not exists job_applications_status_idx on public.job_applications(status);

-- ---------------------------------------------------------------------
-- cover_letters
-- ---------------------------------------------------------------------
create table if not exists public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.job_applications(id) on delete set null,
  template_id text,
  body text,
  created_at timestamptz not null default now()
);
alter table public.cover_letters disable row level security;

create index if not exists cover_letters_user_idx on public.cover_letters(user_id);

-- ---------------------------------------------------------------------
-- saved_jobs (recommendations cache)
-- ---------------------------------------------------------------------
create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  external_id text,
  source text,
  title text,
  company text,
  url text,
  location text,
  match_score numeric,
  match_reasons jsonb,
  saved_at timestamptz not null default now()
);
alter table public.saved_jobs disable row level security;

create index if not exists saved_jobs_user_idx on public.saved_jobs(user_id);

-- ---------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('generated-cvs', 'generated-cvs', false)
  on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Auto-create profile row on signup
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
