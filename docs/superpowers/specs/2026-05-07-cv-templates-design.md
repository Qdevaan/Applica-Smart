# CV Templates Expansion + Schema Refresh — Design Spec

**Date:** 2026-05-07
**Project:** Applica-Smart
**Scope:** Project A of multi-part redesign (A → B1 → B2 → B3 → B4)

## Summary

Add 10 new visually + structurally unique CV templates (bringing total from 7 to 17), refresh Supabase schema with new optional fields the templates need, refactor template selection to a registry pattern, and write a complete fresh `SCHEMA.sql` for the project.

## Goals

1. Give users wide stylistic variety when generating CVs (developer, academic, designer, executive, infographic, etc.).
2. Replace hardcoded template `switch` in `CVGenerator.tsx` with data-driven registry.
3. Establish a complete, authoritative DB schema file users can apply against a fresh Supabase project.
4. Extend Profile type to carry data needed by richer templates (photos, links, projects, certifications, languages, publications, awards, volunteer, skill proficiency levels).

## Non-Goals (deferred)

- ProfileForm UI for new fields. Templates render gracefully when fields absent. Form expansion is a follow-up project.
- Running the SQL against a live Supabase instance. User applies manually.
- Cover letter template expansion.
- Project B (motion redesign with framer-motion).
- Re-skinning existing 7 templates.

## Constraints

- **Render engine:** `@react-pdf/renderer`. PDF primitives only (`Document`, `Page`, `View`, `Text`, `Image`, `Svg`, `StyleSheet`). No HTML/CSS/Tailwind in template files.
- **RLS:** Disabled on all new tables/columns per user request. Auth still required for app login, but row policies are off.
- **Backward compat:** Existing 7 templates and existing Profile reads must keep working unchanged. New fields are additive and optional.
- **Stack:** React 19, TS, Vite, Tailwind v4, framer-motion v12 (not used in PDF templates), Supabase JS v2.

## Schema Design

### Approach
JSONB extension on existing flat tables. Matches the existing pattern (education, experience already JSONB arrays). Single-row reads continue to work. No joins introduced.

### `public.profiles`

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  -- core
  name text, email text, phone text, address text, bio text,
  -- visual
  photo_url text,
  accent_color text default '#1e3a5f',
  -- arrays (JSONB)
  experience jsonb default '[]'::jsonb,
  education jsonb default '[]'::jsonb,
  skills jsonb default '[]'::jsonb,           -- string[]
  skill_levels jsonb default '[]'::jsonb,     -- [{name, level:1-5}]
  hobbies jsonb default '[]'::jsonb,
  links jsonb default '[]'::jsonb,            -- [{label,url,icon}]
  projects jsonb default '[]'::jsonb,         -- [{id,name,role,description,link,tech[],startDate,endDate}]
  certifications jsonb default '[]'::jsonb,   -- [{id,name,issuer,date,url,credentialId}]
  languages jsonb default '[]'::jsonb,        -- [{name,proficiency}]
  publications jsonb default '[]'::jsonb,     -- [{id,title,venue,year,url,authors}]
  awards jsonb default '[]'::jsonb,           -- [{id,title,issuer,year,description}]
  volunteer jsonb default '[]'::jsonb,        -- [{id,organization,role,startDate,endDate,description}]
  references_list jsonb default '[]'::jsonb,  -- [{id,name,contact,relation}]
  -- prefs
  preferences jsonb default '{}'::jsonb,
  template_prefs jsonb default '{}'::jsonb,
  cv_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles disable row level security;
```

### `public.cv_documents`

```sql
create table public.cv_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  template_id text not null,
  title text,
  data_snapshot jsonb not null,
  pdf_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.cv_documents disable row level security;
```

### `public.job_applications`

```sql
create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  job_title text, company text, job_url text, location text,
  salary_min int, salary_max int,
  status text default 'pending', -- pending|applied|response|interview|offer|rejected
  notes text,
  applied_at timestamptz,
  response_at timestamptz,
  created_at timestamptz default now()
);
alter table public.job_applications disable row level security;
```

### `public.cover_letters`

```sql
create table public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  job_id uuid references public.job_applications(id) on delete set null,
  template_id text,
  body text,
  created_at timestamptz default now()
);
alter table public.cover_letters disable row level security;
```

### `public.saved_jobs`

```sql
create table public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  external_id text, source text,
  title text, company text, url text, location text,
  match_score numeric, match_reasons jsonb,
  saved_at timestamptz default now()
);
alter table public.saved_jobs disable row level security;
```

### Triggers

```sql
create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger cv_documents_updated before update on public.cv_documents
  for each row execute function public.set_updated_at();
```

### Storage

```sql
insert into storage.buckets (id, name, public) values ('avatars','avatars',true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('generated-cvs','generated-cvs',false) on conflict do nothing;
```

## TypeScript Type Extensions

In `src/lib/supabase.ts`, add new interfaces and extend `Profile`:

```ts
export interface Link { label: string; url: string; icon?: string; }
export interface Project { id: string; name: string; role?: string; description?: string; link?: string; tech?: string[]; startDate?: string; endDate?: string; }
export interface Certification { id: string; name: string; issuer: string; date?: string; url?: string; credentialId?: string; }
export interface Language { name: string; proficiency: 'native'|'fluent'|'professional'|'intermediate'|'basic'; }
export interface Publication { id: string; title: string; venue?: string; year?: string; url?: string; authors?: string[]; }
export interface Award { id: string; title: string; issuer?: string; year?: string; description?: string; }
export interface Volunteer { id: string; organization: string; role: string; startDate?: string; endDate?: string; description?: string; }
export interface Reference { id: string; name: string; contact?: string; relation?: string; }
export interface SkillLevel { name: string; level: 1|2|3|4|5; }

export interface Profile {
  // existing fields kept
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  bio: string | null;
  experience: Experience[];
  education: Education[];
  skills: string[];
  hobbies: string[];
  preferences: string | null; // legacy column kept; jsonb in DB but read-as-string accepted
  cv_link: string | null;
  created_at: string;
  updated_at: string;
  // new optional fields
  photo_url?: string | null;
  accent_color?: string | null;
  skill_levels?: SkillLevel[];
  links?: Link[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  publications?: Publication[];
  awards?: Award[];
  volunteer?: Volunteer[];
  references_list?: Reference[];
  template_prefs?: { defaultTemplateId?: string; accentColor?: string };
}
```

All new fields are optional. Existing reads in CVGenerator and templates continue to work because new fields default to `undefined` and templates check before rendering.

## Template Registry

New file `src/components/cv/templates/index.ts`:

```ts
import ModernTemplate from './ModernTemplate';
// ... imports for all 17

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<{ profile: Profile }>;
  accent: string;
  category: 'classic' | 'modern' | 'creative' | 'technical' | 'academic';
  needsPhoto?: boolean;
}

export const TEMPLATES: TemplateMeta[] = [
  // existing 7
  { id: 'modern',     name: 'Modern',     ... },
  { id: 'classic',    name: 'Classic',    ... },
  { id: 'minimal',    name: 'Minimal',    ... },
  { id: 'creative',   name: 'Creative',   ... },
  { id: 'executive',  name: 'Executive',  ... },
  { id: 'compact',    name: 'Compact',    ... },
  { id: 'ats',        name: 'ATS',        ... },
  // 10 new
  { id: 'timeline',     ... },
  { id: 'sidebar-color',... },
  { id: 'academic',     ... },
  { id: 'infographic',  ... },
  { id: 'photo-header', ... },
  { id: 'dev',          ... },
  { id: 'editorial',    ... },
  { id: 'portfolio',    ... },
  { id: 'elegant',      ... },
  { id: 'gradient',     ... },
];

export type TemplateId = typeof TEMPLATES[number]['id'];
export const getTemplate = (id: string) => TEMPLATES.find(t => t.id === id);
```

`CVGenerator.tsx` refactored:
- Replace any hardcoded `switch(templateId)` with `getTemplate(id)?.component`.
- Thumbnail grid maps over `TEMPLATES`, shows name + category + needsPhoto badge.
- Filter dropdown by category.

## New Templates (Spec)

All 10 below render `<Document><Page size="A4">…</Page></Document>` and accept `{ profile: Profile }`.

### 1. TimelineTemplate
- Single column, A4.
- Vertical spine line on left (~20% width), dot per experience/education entry, role/company stacked to right.
- Header: name big, role tagline below, contact row.
- Sections: Summary, Experience (timeline), Education (timeline), Skills (pill row), Projects (if present).
- Accent: `#0f172a` (slate-900) default, overridable via `accent_color`.

### 2. SidebarColorTemplate
- Two-col, sidebar 35% left full-color (`accent_color`), main 65% white.
- Sidebar: optional photo (circle, top), contact, skills (bullets), languages (if present), hobbies.
- Main: name (white-on-color band continuation or top-aligned), summary, experience, education, projects (if present).
- Distinguishes from existing Modern (which uses dark blue sidebar but different layout / no photo support).

### 3. AcademicTemplate
- Two-column dense layout, serif (Times). Black/white only.
- Header: centered name + email/phone/affiliation.
- Sections: Education (priority), Publications (numbered list, IEEE-ish), Research Experience, Grants/Awards, Teaching, Service, Skills, References.
- Renders only when academic-relevant data present; falls back to standard sections otherwise.

### 4. InfographicTemplate
- Single column with visual elements.
- Skill bars (Svg `Rect` filled to `level/5 * width`).
- Language proficiency rings (Svg `Circle` arc-fill).
- Donut chart for "Time spent" if user provides it (skip if absent).
- Accent color drives bar/ring fill.

### 5. PhotoHeaderTemplate
- Top header band (~25% page height) with circular photo (Svg clip or `Image` masked), large name, tagline.
- Below: two-col body — left contact + skills + langs, right summary + experience + education.
- Requires `photo_url`. If missing, falls back to large initials in colored circle.

### 6. DevTemplate
- Monospace fonts (`Courier`).
- Header: name + handle-style links (`@github`, `@linkedin`).
- "Contributions" Svg grid (52w × 7h squares) — random pattern if no real data; deterministic from `name` hash.
- Project cards: title, tech tags, description, link.
- Sections: Summary, Experience (compact), Projects (cards), Skills (categorized), Education.

### 7. EditorialTemplate
- Magazine-style. Serif display fonts. Multi-column body.
- Drop cap on summary first letter.
- Pull-quote callout (uses bio second sentence if available, else skip).
- Section headers are large numeric ("01 Experience").

### 8. PortfolioTemplate
- Designer-focused. Bold sans-serif (Helvetica heavy).
- Asymmetric grid, large name with role pill.
- Project thumbnails (Svg colored blocks if no image, else Image from `project.thumbnail` if added).
- Sections: Selected Work (projects), Experience, Skills, Education.

### 9. ElegantSerifTemplate
- High-end consulting / executive variant.
- Serif (`Times`), centered name with gold (`#b8860b`) double rule.
- Two-column body but text-only.
- Restrained: name, summary, experience, education, languages, references.

### 10. GradientTemplate
- Top header band with gradient (Svg `LinearGradient` or two overlapping `Rect`s w/ alpha for fake gradient — `@react-pdf/renderer` supports linearGradient via `Defs`/`LinearGradient`).
- Pill-tag skills with rounded `Rect` Svg backgrounds.
- Body: modern sans (Helvetica), single column, plenty of color accents.
- Sections: Summary, Experience, Skills (pills), Projects, Education.

## Sample Data

Extend `TEMPLATE_PREVIEW.ts` `sampleProfile` with:
- `photo_url`: placeholder URL
- `links`: 3 examples (GitHub, LinkedIn, Portfolio)
- `projects`: 2 examples (with tech arrays)
- `certifications`: 1 example
- `languages`: 2 examples (English native, Spanish fluent)
- `publications`: 1 example (for Academic)
- `awards`: 1 example
- `volunteer`: 1 example
- `skill_levels`: maps existing skills to 4–5 levels

Existing 7 templates ignore the new fields, so no regression.

## File Plan

**New files:**
- `documentation/SCHEMA.sql`
- `src/components/cv/templates/TimelineTemplate.tsx`
- `src/components/cv/templates/SidebarColorTemplate.tsx`
- `src/components/cv/templates/AcademicTemplate.tsx`
- `src/components/cv/templates/InfographicTemplate.tsx`
- `src/components/cv/templates/PhotoHeaderTemplate.tsx`
- `src/components/cv/templates/DevTemplate.tsx`
- `src/components/cv/templates/EditorialTemplate.tsx`
- `src/components/cv/templates/PortfolioTemplate.tsx`
- `src/components/cv/templates/ElegantSerifTemplate.tsx`
- `src/components/cv/templates/GradientTemplate.tsx`
- `src/components/cv/templates/index.ts` (registry)

**Modified files:**
- `src/lib/supabase.ts` (extend types)
- `src/pages/CVGenerator.tsx` (use registry instead of switch)
- `src/components/cv/templates/TEMPLATE_PREVIEW.ts` (sample data extended)

## Implementation Order

1. Write `documentation/SCHEMA.sql`.
2. Extend types in `src/lib/supabase.ts`.
3. Create `index.ts` registry with existing 7 wired in.
4. Refactor `CVGenerator.tsx` to use registry (verify existing flow still works).
5. Extend `TEMPLATE_PREVIEW.ts` sample data.
6. Build templates in this order (simplest → most complex):
   1. ElegantSerifTemplate
   2. EditorialTemplate
   3. TimelineTemplate
   4. GradientTemplate
   5. SidebarColorTemplate
   6. PhotoHeaderTemplate
   7. DevTemplate
   8. PortfolioTemplate
   9. AcademicTemplate
   10. InfographicTemplate
7. Register each new template in `index.ts` as it's built.
8. Run `npm run build` after each group of 3 templates to catch type/import errors early.

## Risks & Mitigations

- **PDF runtime errors not caught at build time.** `@react-pdf/renderer` throws at render, not compile. Mitigation: stick to documented primitives, mirror patterns from existing 7 templates. Manual visual check needed; flag this to user.
- **Font availability.** `@react-pdf/renderer` ships Helvetica, Times, Courier. Custom fonts need `Font.register` with web URL. Mitigation: only use built-ins for v1.
- **Photo loading.** `<Image src={url}>` fails if URL unreachable. Mitigation: PhotoHeaderTemplate falls back to initials circle when `photo_url` missing.
- **Svg gradient support.** `@react-pdf/renderer` v3+ supports `LinearGradient`. Verify. Mitigation: if unsupported, fake gradient with 5 layered `Rect`s decreasing alpha.
- **Schema not applied.** User must run `SCHEMA.sql` against Supabase. App still works on existing schema; new fields default `undefined`. Mitigation: README note, app degrades gracefully.

## Acceptance Criteria

- `npm run build` passes.
- `documentation/SCHEMA.sql` exists, contains all 5 tables + storage buckets + triggers, RLS disabled on all new tables.
- 17 templates registered in `src/components/cv/templates/index.ts`.
- `CVGenerator.tsx` no longer hardcodes template switch; uses registry.
- All 17 thumbnails render in template picker (placeholder images OK).
- Generating a PDF for any of the 10 new templates with the sample profile produces a valid PDF (no render exceptions). User-verified manually.
- Existing 7 templates continue to work unchanged.

## Out of Scope (next projects)

- B1: Motion design system (variants library, page transitions, primitives)
- B2: Landing + Auth redesign
- B3: DashboardLayout / Navbar shell redesign
- B4: Dashboard / Jobs / CV Generator / Profile / Settings page redesigns
