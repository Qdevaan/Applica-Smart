-- =====================================================================
-- Applica-Smart - Complete Database Schema
-- Apply against a fresh Supabase project. RLS is DISABLED on all tables
-- per project decision. Re-enable + add policies before production.
--
-- This schema reflects what the frontend code actually reads/writes
-- (src/services/*) and is the canonical source of truth.
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
-- One row per auth.users row. Auto-created via on_auth_user_created
-- trigger (see bottom of file).
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  -- core identity
  name    text,
  email   text,
  phone   text,
  address text,
  bio     text,

  -- visual
  photo_url    text,
  accent_color text default '#1e3a5f',

  -- structured arrays / objects (JSONB)
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

  -- preference blobs
  -- preferences:    NotificationPrefs ({ email, push, applicationUpdates })
  -- template_prefs: TemplatePrefs     ({ defaultTemplateId, ... })
  preferences     jsonb not null default '{}'::jsonb,
  template_prefs  jsonb not null default '{}'::jsonb,

  -- last generated CV public URL
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
-- One row per generated CV PDF. Written by services/cv.service.ts.
-- ---------------------------------------------------------------------
create table if not exists public.cv_documents (
  id uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  template_used text not null,
  file_url      text,
  created_at    timestamptz not null default now()
);
alter table public.cv_documents disable row level security;

create index if not exists cv_documents_user_idx on public.cv_documents(user_id);
create index if not exists cv_documents_user_created_idx
  on public.cv_documents(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- cover_letter_documents
-- One row per generated cover letter PDF.
-- Written by services/coverLetter.service.ts.
-- ---------------------------------------------------------------------
create table if not exists public.cover_letter_documents (
  id uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  template_used text not null,
  job_title     text,
  company       text,
  file_url      text,
  body          text,
  created_at    timestamptz not null default now()
);
alter table public.cover_letter_documents disable row level security;

create index if not exists cover_letter_documents_user_idx
  on public.cover_letter_documents(user_id);
create index if not exists cover_letter_documents_user_created_idx
  on public.cover_letter_documents(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- job_applications
-- User-tracked job applications. Written by services/jobApplication.service.ts.
-- ---------------------------------------------------------------------
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  job_title   text,
  company     text,
  job_url     text,
  location    text,
  salary_min  int,
  salary_max  int,
  status      text not null default 'pending',
  notes       text,
  applied_at  timestamptz,
  response_at timestamptz,
  created_at  timestamptz not null default now()
);
alter table public.job_applications disable row level security;

create index if not exists job_applications_user_idx
  on public.job_applications(user_id);
create index if not exists job_applications_status_idx
  on public.job_applications(status);
create index if not exists job_applications_user_created_idx
  on public.job_applications(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------
-- avatars (public): profile photos, written by services/avatar.service.ts
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

-- cvs (public): generated CV PDFs, written by services/cv.service.ts
insert into storage.buckets (id, name, public)
  values ('cvs', 'cvs', true)
  on conflict (id) do nothing;

-- cover_letters (public): generated cover letter PDFs,
-- written by services/coverLetter.service.ts
insert into storage.buckets (id, name, public)
  values ('cover_letters', 'cover_letters', true)
  on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Storage policies (storage.objects has RLS enabled by Supabase default)
-- Pattern: each user owns a folder named by their auth.uid().
-- Files at path "{auth.uid()}/whatever" are writable by that user;
-- everything in these public buckets is world-readable.
-- ---------------------------------------------------------------------
do $$
declare
  b text;
  buckets text[] := array['avatars', 'cvs', 'cover_letters'];
begin
  foreach b in array buckets loop
    -- public read
    execute format(
      'drop policy if exists %I on storage.objects',
      b || '_public_read'
    );
    execute format(
      'create policy %I on storage.objects for select using (bucket_id = %L)',
      b || '_public_read', b
    );

    -- authenticated insert into own folder
    execute format(
      'drop policy if exists %I on storage.objects',
      b || '_owner_insert'
    );
    execute format(
      'create policy %I on storage.objects for insert to authenticated '
      || 'with check (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text)',
      b || '_owner_insert', b
    );

    -- authenticated update own files
    execute format(
      'drop policy if exists %I on storage.objects',
      b || '_owner_update'
    );
    execute format(
      'create policy %I on storage.objects for update to authenticated '
      || 'using (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text) '
      || 'with check (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text)',
      b || '_owner_update', b, b
    );

    -- authenticated delete own files
    execute format(
      'drop policy if exists %I on storage.objects',
      b || '_owner_delete'
    );
    execute format(
      'create policy %I on storage.objects for delete to authenticated '
      || 'using (bucket_id = %L and (storage.foldername(name))[1] = auth.uid()::text)',
      b || '_owner_delete', b
    );
  end loop;
end $$;

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
