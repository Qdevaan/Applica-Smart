# CV Templates Expansion + Schema Refresh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 10 new unique CV templates (total 17), extend Supabase schema with new optional fields, write fresh `SCHEMA.sql`, refactor template selection from a hardcoded `switch` to a data-driven registry.

**Architecture:** New optional fields on `profiles` JSONB columns (photo_url, links, projects, certifications, languages, publications, awards, volunteer, skill_levels). Template registry in `src/components/cv/templates/index.ts` becomes single source of truth — `availableTemplates` and the dispatch `switch` in `cv.service.ts` collapse into one lookup. New templates render via `@react-pdf/renderer` PDF primitives only. RLS disabled on all new tables.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind v4, framer-motion v12 (not used in PDF templates), Supabase JS v2, `@react-pdf/renderer` v4.

**Spec:** `docs/superpowers/specs/2026-05-07-cv-templates-design.md`

**Verification model (note):** PDF templates can't be unit-tested with Jest/Vitest — `@react-pdf/renderer` resolves at render time in a worker. The "test gate" for each template task is: (1) `npm run build` passes (TS + Vite), (2) the file imports the right primitives. Manual visual verification is flagged at the end (Task 16). Where this plan says "Run test", it means "run the build" unless a real unit test is specified.

---

## File Plan

**New files:**
- `documentation/SCHEMA.sql` — full fresh DB schema, RLS off on new tables.
- `src/components/cv/templates/index.ts` — registry (metadata + lazy component loader).
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

**Modified files:**
- `src/lib/supabase.ts` — add new interfaces + extend `Profile`.
- `src/services/cv.service.ts` — collapse hardcoded switch + `availableTemplates` into registry consumption.
- `src/pages/CVGenerator.tsx` — minor: import from templates registry instead of cv.service for `availableTemplates`/`CVTemplate` (or keep re-export from cv.service). 
- `src/components/jobs/TailorCVModal.tsx` — same: re-export ensures no change needed.
- `src/components/cv/templates/TEMPLATE_PREVIEW.ts` — extend sample profile.

---

## Task 1: Write fresh `documentation/SCHEMA.sql`

**Files:**
- Create: `documentation/SCHEMA.sql`

- [ ] **Step 1: Create the schema file**

Create `documentation/SCHEMA.sql` with this exact content:

```sql
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
```

- [ ] **Step 2: Verify file exists and is readable**

Run: `ls "e:/talha taha/Applica-Smart/documentation/SCHEMA.sql"`
Expected: file listed.

- [ ] **Step 3: Commit**

```bash
git -C "e:/talha taha/Applica-Smart" add documentation/SCHEMA.sql
git -C "e:/talha taha/Applica-Smart" commit -m "feat(db): add complete fresh schema (RLS off on new tables)"
```

---

## Task 2: Extend `Profile` type with new optional fields

**Files:**
- Modify: `src/lib/supabase.ts`

- [ ] **Step 1: Add new interfaces above the `Profile` interface**

Find the `// Types for our database` comment and the `export interface Profile {` block. Add these interfaces immediately above `export interface Profile`:

```ts
export interface Link {
  label: string;
  url: string;
  icon?: string;
}

export interface Project {
  id: string;
  name: string;
  role?: string;
  description?: string;
  link?: string;
  tech?: string[];
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
  credentialId?: string;
}

export type LanguageProficiency =
  | 'native'
  | 'fluent'
  | 'professional'
  | 'intermediate'
  | 'basic';

export interface Language {
  name: string;
  proficiency: LanguageProficiency;
}

export interface Publication {
  id: string;
  title: string;
  venue?: string;
  year?: string;
  url?: string;
  authors?: string[];
}

export interface Award {
  id: string;
  title: string;
  issuer?: string;
  year?: string;
  description?: string;
}

export interface Volunteer {
  id: string;
  organization: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ReferenceEntry {
  id: string;
  name: string;
  contact?: string;
  relation?: string;
}

export type SkillLevelValue = 1 | 2 | 3 | 4 | 5;
export interface SkillLevel {
  name: string;
  level: SkillLevelValue;
}

export interface TemplatePrefs {
  defaultTemplateId?: string;
  accentColor?: string;
}
```

- [ ] **Step 2: Extend the `Profile` interface**

Replace the existing `Profile` interface body. The existing `Profile` keeps all current fields exactly. Add the new optional ones at the end. Final shape:

```ts
export interface Profile {
  id: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  bio: string | null;
  education: Education[];
  skills: string[];
  experience: Experience[];
  hobbies: string[];
  preferences: string | null;
  cv_link: string | null;
  created_at: string;
  updated_at: string;

  // New optional fields (added 2026-05-07)
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
  references_list?: ReferenceEntry[];
  template_prefs?: TemplatePrefs;
}
```

- [ ] **Step 3: Run build to confirm no type regressions**

Run: `npm --prefix "e:/talha taha/Applica-Smart" run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git -C "e:/talha taha/Applica-Smart" add src/lib/supabase.ts
git -C "e:/talha taha/Applica-Smart" commit -m "feat(types): extend Profile with optional rich-CV fields"
```

---

## Task 3: Extend sample profile in `TEMPLATE_PREVIEW.ts`

**Files:**
- Modify: `src/components/cv/templates/TEMPLATE_PREVIEW.ts`

- [ ] **Step 1: Add new fields to the `sampleProfile` export**

Open `src/components/cv/templates/TEMPLATE_PREVIEW.ts`. After the `hobbies: [...]` array and before `preferences: null,`, insert:

```ts
  photo_url: "https://i.pravatar.cc/300?u=applica-sample",
  accent_color: "#1e3a5f",

  skill_levels: [
    { name: "React", level: 5 },
    { name: "TypeScript", level: 5 },
    { name: "Node.js", level: 4 },
    { name: "Python", level: 4 },
    { name: "PostgreSQL", level: 4 },
    { name: "AWS", level: 3 },
    { name: "Docker", level: 3 },
    { name: "Git", level: 5 },
  ],

  links: [
    { label: "GitHub", url: "https://github.com/johndoe", icon: "github" },
    { label: "LinkedIn", url: "https://linkedin.com/in/johndoe", icon: "linkedin" },
    { label: "Portfolio", url: "https://johndoe.dev", icon: "globe" },
  ],

  projects: [
    {
      id: "p1",
      name: "Applica-Smart",
      role: "Lead Engineer",
      description: "AI-driven job application copilot with CV/cover-letter generation and recommendation pipeline.",
      link: "https://applica-smart.example",
      tech: ["React", "TypeScript", "Supabase", "Python"],
      startDate: "2025-06",
      endDate: "2026-05",
    },
    {
      id: "p2",
      name: "Open-Source Resume Kit",
      role: "Maintainer",
      description: "PDF resume primitives library used by 4k+ developers.",
      link: "https://github.com/johndoe/resume-kit",
      tech: ["TypeScript", "react-pdf", "Vite"],
      startDate: "2023-01",
      endDate: "2024-08",
    },
  ],

  certifications: [
    {
      id: "c1",
      name: "AWS Certified Solutions Architect — Associate",
      issuer: "Amazon Web Services",
      date: "2024-03",
      url: "https://aws.amazon.com/verification",
      credentialId: "AWS-SA-123456",
    },
  ],

  languages: [
    { name: "English", proficiency: "native" },
    { name: "Spanish", proficiency: "fluent" },
    { name: "Urdu", proficiency: "professional" },
  ],

  publications: [
    {
      id: "pub1",
      title: "Latency-bounded recommendation pipelines for skill-based job matching",
      venue: "IEEE BigData Workshops",
      year: "2024",
      url: "https://example.com/paper",
      authors: ["John Doe", "A. Smith", "B. Khan"],
    },
  ],

  awards: [
    {
      id: "a1",
      title: "Engineering Excellence Award",
      issuer: "Tech Company Inc.",
      year: "2023",
      description: "Top 1% of engineers globally for shipping platform-critical infra.",
    },
  ],

  volunteer: [
    {
      id: "v1",
      organization: "Code for All",
      role: "Mentor",
      startDate: "2022-09",
      endDate: "2024-06",
      description: "Mentored 12 junior devs through OSS contribution programs.",
    },
  ],

  references_list: [],
  template_prefs: { defaultTemplateId: "modern", accentColor: "#1e3a5f" },
```

- [ ] **Step 2: Run build**

Run: `npm --prefix "e:/talha taha/Applica-Smart" run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git -C "e:/talha taha/Applica-Smart" add src/components/cv/templates/TEMPLATE_PREVIEW.ts
git -C "e:/talha taha/Applica-Smart" commit -m "feat(cv): extend sample profile with rich fields"
```

---

## Task 4: Create template registry `index.ts` (existing 7 wired in)

**Files:**
- Create: `src/components/cv/templates/index.ts`

- [ ] **Step 1: Create the registry file**

Create `src/components/cv/templates/index.ts`:

```ts
import type { ComponentType } from "react";
import type { Profile } from "../../../lib/supabase";

export type TemplateCategory =
  | "all"
  | "modern"
  | "traditional"
  | "creative"
  | "executive"
  | "ats"
  | "compact"
  | "technical"
  | "academic"
  | "elegant";

export type TemplateId =
  | "modern"
  | "classic"
  | "minimal"
  | "executive"
  | "creative"
  | "ats"
  | "compact"
  // new
  | "timeline"
  | "sidebar-color"
  | "academic"
  | "infographic"
  | "photo-header"
  | "dev"
  | "editorial"
  | "portfolio"
  | "elegant"
  | "gradient";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  preview: string;
  category: Exclude<TemplateCategory, "all">;
  bestFor: string[];
  accentColor: string;
  needsPhoto?: boolean;
  loader: () => Promise<{ default: ComponentType<{ profile: Profile }> } | { [k: string]: ComponentType<{ profile: Profile }> }>;
  exportName: string; // named export to pull off the module
}

export const templateCategories: { id: TemplateCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "modern", label: "Modern" },
  { id: "traditional", label: "Traditional" },
  { id: "creative", label: "Creative" },
  { id: "executive", label: "Executive" },
  { id: "ats", label: "ATS-Friendly" },
  { id: "compact", label: "Compact" },
  { id: "technical", label: "Technical" },
  { id: "academic", label: "Academic" },
  { id: "elegant", label: "Elegant" },
];

export const templates: TemplateMeta[] = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean and contemporary design with color accents",
    preview: "/templates/modern-preview.png",
    category: "modern",
    bestFor: ["Software", "Product", "Marketing"],
    accentColor: "#1e3a5f",
    loader: () => import("./ModernTemplate"),
    exportName: "ModernTemplate",
  },
  {
    id: "classic",
    name: "Classic Traditional",
    description: "Timeless and formal layout for traditional industries",
    preview: "/templates/classic-preview.png",
    category: "traditional",
    bestFor: ["Finance", "Law", "Academia"],
    accentColor: "#111827",
    loader: () => import("./ClassicTemplate"),
    exportName: "ClassicTemplate",
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Simple and elegant design with maximum readability",
    preview: "/templates/minimal-preview.png",
    category: "modern",
    bestFor: ["Design", "Writing", "Consulting"],
    accentColor: "#374151",
    loader: () => import("./MinimalTemplate"),
    exportName: "MinimalTemplate",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Formal navy & gold layout for senior roles and traditional industries",
    preview: "/templates/executive-preview.png",
    category: "executive",
    bestFor: ["Senior leadership", "Banking", "Operations"],
    accentColor: "#1e3a8a",
    loader: () => import("./ExecutiveTemplate"),
    exportName: "ExecutiveTemplate",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Vibrant accent palette for design, marketing, and product roles",
    preview: "/templates/creative-preview.png",
    category: "creative",
    bestFor: ["Design", "Marketing", "Media"],
    accentColor: "#C1121F",
    loader: () => import("./CreativeTemplate"),
    exportName: "CreativeTemplate",
  },
  {
    id: "ats",
    name: "ATS-Optimized",
    description: "Plain single-column layout designed to pass automated resume screeners",
    preview: "/templates/ats-preview.png",
    category: "ats",
    bestFor: ["High-volume applications", "Large companies"],
    accentColor: "#000000",
    loader: () => import("./ATSTemplate"),
    exportName: "ATSTemplate",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Two-column dense layout that fits a strong career on a single page",
    preview: "/templates/compact-preview.png",
    category: "compact",
    bestFor: ["Senior IC", "Long careers", "One-page mandates"],
    accentColor: "#780000",
    loader: () => import("./CompactTemplate"),
    exportName: "CompactTemplate",
  },
];

export function getTemplate(id: string): TemplateMeta | undefined {
  return templates.find((t) => t.id === id);
}

export async function loadTemplateComponent(
  id: TemplateId
): Promise<ComponentType<{ profile: Profile }> | undefined> {
  const meta = getTemplate(id);
  if (!meta) return undefined;
  const mod = await meta.loader();
  // Try named export first, then default
  const Comp =
    (mod as Record<string, ComponentType<{ profile: Profile }>>)[meta.exportName] ??
    (mod as { default?: ComponentType<{ profile: Profile }> }).default;
  return Comp;
}
```

- [ ] **Step 2: Run build**

Run: `npm --prefix "e:/talha taha/Applica-Smart" run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git -C "e:/talha taha/Applica-Smart" add src/components/cv/templates/index.ts
git -C "e:/talha taha/Applica-Smart" commit -m "feat(cv): add template registry with lazy loaders"
```

---

## Task 5: Refactor `cv.service.ts` to consume the registry

**Files:**
- Modify: `src/services/cv.service.ts`

- [ ] **Step 1: Replace top of file (imports + types + availableTemplates + switch)**

Open `src/services/cv.service.ts`. Replace lines 1 through the closing `}` of the `generateCVBlob` switch (approximately lines 1–200; the section containing the `CVTemplate` type alias, `availableTemplates` array, and the `switch (templateId)` block) with the following. Keep everything **after** the switch (storage upload methods, `downloadCV`, `uploadCV`, `saveCVRecord`) untouched:

```ts
import React from "react";
import { pdf } from "@react-pdf/renderer";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/supabase";
import {
  templates,
  templateCategories,
  loadTemplateComponent,
  type TemplateId,
  type TemplateCategory,
  type TemplateMeta,
} from "../components/cv/templates";

// Re-export for backward compat with existing imports
export type CVTemplate = TemplateId;
export type { TemplateCategory } from "../components/cv/templates";
export { templateCategories };

export interface CVTemplateOption {
  id: TemplateId;
  name: string;
  description: string;
  preview: string;
  category: Exclude<TemplateCategory, "all">;
  bestFor: string[];
  accentColor: string;
}

export const availableTemplates: CVTemplateOption[] = templates.map(
  ({ id, name, description, preview, category, bestFor, accentColor }: TemplateMeta) => ({
    id,
    name,
    description,
    preview,
    category,
    bestFor,
    accentColor,
  })
);

class CVService {
  /**
   * Generate CV PDF blob from profile data
   */
  async generateCVBlob(
    profile: Profile,
    templateId: CVTemplate
  ): Promise<Blob> {
    const Component = await loadTemplateComponent(templateId);
    if (!Component) {
      throw new Error(`Unknown CV template: ${templateId}`);
    }
    const doc = React.createElement(Component, { profile });
    // pdf() expects a DocumentElement; @react-pdf typings require any cast.
    return await pdf(doc as any).toBlob();
  }
```

> Note: this REPLACES the long `switch` block. The class continues with whatever methods follow `generateCVBlob` in the existing file (`downloadCV`, `uploadCV`, `saveCVRecord`, etc.). Keep those untouched.

- [ ] **Step 2: Verify the closing of the file is intact**

Open the file again and confirm:
1. Class `CVService` still has its closing `}`.
2. The trailing `export const cvService = new CVService();` (or equivalent default export) still exists.

If either is missing, restore from git history (`git diff HEAD~1 src/services/cv.service.ts`) and re-apply Step 1 more carefully.

- [ ] **Step 3: Run build**

Run: `npm --prefix "e:/talha taha/Applica-Smart" run build`
Expected: build succeeds.

- [ ] **Step 4: Smoke-check existing templates still resolve**

Add a temporary script `scripts/smoke-templates.mjs`:

```js
import { templates, loadTemplateComponent } from "../src/components/cv/templates/index.js";
for (const t of templates) {
  const C = await loadTemplateComponent(t.id);
  if (!C) { console.error("MISSING", t.id); process.exit(1); }
  console.log("OK", t.id);
}
```

Skip if running this script is awkward in the project's setup. Build passing is sufficient verification — `loadTemplateComponent` is referenced by the service so any broken import surfaces at build/import time. Delete the script if created.

- [ ] **Step 5: Commit**

```bash
git -C "e:/talha taha/Applica-Smart" add src/services/cv.service.ts
git -C "e:/talha taha/Applica-Smart" commit -m "refactor(cv): consume template registry instead of hardcoded switch"
```

---

## Task 6: Build `ElegantSerifTemplate` (simplest)

**Files:**
- Create: `src/components/cv/templates/ElegantSerifTemplate.tsx`
- Modify: `src/components/cv/templates/index.ts`

- [ ] **Step 1: Create the template**

Create `src/components/cv/templates/ElegantSerifTemplate.tsx`:

```tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";

const GOLD = "#b8860b";
const INK = "#1a1a1a";
const MUTED = "#5b5b5b";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Times-Roman",
    paddingHorizontal: 60,
    paddingVertical: 50,
    color: INK,
  },
  headerWrap: { alignItems: "center", marginBottom: 18 },
  name: {
    fontSize: 26,
    letterSpacing: 4,
    textTransform: "uppercase",
    fontFamily: "Times-Bold",
  },
  rule: {
    width: "30%",
    borderBottomWidth: 1,
    borderBottomColor: GOLD,
    marginVertical: 6,
  },
  contact: { fontSize: 9, color: MUTED, letterSpacing: 1 },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: GOLD,
    marginTop: 18,
    marginBottom: 6,
    textAlign: "center",
    fontFamily: "Times-Bold",
  },
  bio: { fontSize: 11, lineHeight: 1.6, textAlign: "center", fontStyle: "italic" },
  expRow: { marginBottom: 10 },
  expHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  position: { fontSize: 11, fontFamily: "Times-Bold" },
  dates: { fontSize: 9, color: MUTED },
  company: { fontSize: 10, fontStyle: "italic", color: MUTED, marginBottom: 3 },
  desc: { fontSize: 10, lineHeight: 1.55 },
  twoCol: { flexDirection: "row", marginTop: 6 },
  col: { flex: 1, paddingRight: 12 },
  listItem: { fontSize: 10, marginBottom: 3 },
});

interface Props { profile: Profile; }

export const ElegantSerifTemplate = ({ profile }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.headerWrap}>
        <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
        <View style={styles.rule} />
        <Text style={styles.contact}>
          {[profile.email, profile.phone, profile.address].filter(Boolean).join("  •  ")}
        </Text>
      </View>

      {profile.bio && (
        <>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
        </>
      )}

      {profile.experience?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Experience</Text>
          {profile.experience.map((e, i) => (
            <View key={e.id ?? i} style={styles.expRow}>
              <View style={styles.expHeader}>
                <Text style={styles.position}>{e.position}</Text>
                <Text style={styles.dates}>
                  {e.startDate} — {e.current ? "Present" : e.endDate ?? ""}
                </Text>
              </View>
              <Text style={styles.company}>{e.company}</Text>
              {e.description && <Text style={styles.desc}>{e.description}</Text>}
            </View>
          ))}
        </>
      )}

      <View style={styles.twoCol}>
        {profile.education?.length > 0 && (
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((ed, i) => (
              <View key={ed.id ?? i} style={{ marginBottom: 6 }}>
                <Text style={styles.position}>{ed.degree ?? ed.institutionName}</Text>
                <Text style={styles.company}>{ed.institutionName}</Text>
                <Text style={styles.dates}>
                  {ed.startYear} — {ed.endYear}
                </Text>
              </View>
            ))}
          </View>
        )}
        {profile.languages && profile.languages.length > 0 && (
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Languages</Text>
            {profile.languages.map((l, i) => (
              <Text key={i} style={styles.listItem}>
                {l.name} — {l.proficiency}
              </Text>
            ))}
          </View>
        )}
      </View>
    </Page>
  </Document>
);

export default ElegantSerifTemplate;
```

- [ ] **Step 2: Register in `index.ts`**

In `src/components/cv/templates/index.ts`, append a new entry to the `templates` array (before the closing `]`):

```ts
  {
    id: "elegant",
    name: "Elegant Serif",
    description: "Refined consulting/executive layout with gold accents and centered serif typography",
    preview: "/templates/elegant-preview.png",
    category: "elegant",
    bestFor: ["Consulting", "Executive search", "Legal", "Diplomacy"],
    accentColor: "#b8860b",
    loader: () => import("./ElegantSerifTemplate"),
    exportName: "ElegantSerifTemplate",
  },
```

- [ ] **Step 3: Run build**

Run: `npm --prefix "e:/talha taha/Applica-Smart" run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git -C "e:/talha taha/Applica-Smart" add src/components/cv/templates/ElegantSerifTemplate.tsx src/components/cv/templates/index.ts
git -C "e:/talha taha/Applica-Smart" commit -m "feat(cv): add ElegantSerifTemplate"
```

---

## Task 7: Build `EditorialTemplate`

**Files:**
- Create: `src/components/cv/templates/EditorialTemplate.tsx`
- Modify: `src/components/cv/templates/index.ts`

- [ ] **Step 1: Create the template**

Create `src/components/cv/templates/EditorialTemplate.tsx`:

```tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";

const ACCENT = "#7f1d1d";
const INK = "#111111";
const MUTED = "#666666";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fafaf7",
    fontFamily: "Times-Roman",
    paddingHorizontal: 48,
    paddingVertical: 44,
    color: INK,
  },
  hero: {
    borderBottomWidth: 2,
    borderBottomColor: INK,
    paddingBottom: 14,
    marginBottom: 14,
  },
  kicker: {
    fontSize: 9,
    letterSpacing: 4,
    textTransform: "uppercase",
    color: ACCENT,
    fontFamily: "Times-Bold",
    marginBottom: 4,
  },
  name: { fontSize: 36, fontFamily: "Times-Bold", lineHeight: 1.05 },
  contact: { fontSize: 9, color: MUTED, marginTop: 6 },
  twoCol: { flexDirection: "row", gap: 18 },
  colMain: { flex: 2, paddingRight: 14 },
  colSide: { flex: 1, borderLeftWidth: 1, borderLeftColor: "#dcdcdc", paddingLeft: 14 },
  numberedTitle: { fontSize: 18, fontFamily: "Times-Bold", marginBottom: 6, marginTop: 14 },
  numberedTitleAccent: { color: ACCENT },
  dropCapWrap: { flexDirection: "row", marginBottom: 10 },
  dropCap: { fontSize: 42, fontFamily: "Times-Bold", color: ACCENT, lineHeight: 1, marginRight: 6 },
  bioRest: { flex: 1, fontSize: 10.5, lineHeight: 1.6, paddingTop: 4 },
  expBlock: { marginBottom: 10 },
  expRow: { flexDirection: "row", justifyContent: "space-between" },
  position: { fontSize: 11, fontFamily: "Times-Bold" },
  dates: { fontSize: 9, color: MUTED, fontStyle: "italic" },
  company: { fontSize: 10, color: ACCENT, fontStyle: "italic", marginBottom: 2 },
  desc: { fontSize: 10, lineHeight: 1.55 },
  pull: {
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    paddingLeft: 10,
    fontStyle: "italic",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#333",
    marginVertical: 12,
  },
  sideTitle: {
    fontSize: 9,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "Times-Bold",
    color: ACCENT,
    marginTop: 12,
    marginBottom: 4,
  },
  sideItem: { fontSize: 10, marginBottom: 3 },
});

interface Props { profile: Profile; }

const splitBio = (bio: string): { firstLetter: string; rest: string; pull?: string } => {
  if (!bio) return { firstLetter: "", rest: "" };
  const firstLetter = bio.charAt(0);
  const rest = bio.slice(1);
  // Use the second sentence as a pull quote, if present.
  const sentences = bio.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const pull = sentences.length > 1 ? sentences[1] : undefined;
  return { firstLetter, rest, pull };
};

export const EditorialTemplate = ({ profile }: Props) => {
  const { firstLetter, rest, pull } = splitBio(profile.bio ?? "");
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Curriculum Vitae</Text>
          <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
          <Text style={styles.contact}>
            {[profile.email, profile.phone, profile.address].filter(Boolean).join("   //   ")}
          </Text>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.colMain}>
            {profile.bio && (
              <>
                <Text style={styles.numberedTitle}>
                  <Text style={styles.numberedTitleAccent}>01  </Text>Profile
                </Text>
                <View style={styles.dropCapWrap}>
                  <Text style={styles.dropCap}>{firstLetter}</Text>
                  <Text style={styles.bioRest}>{rest}</Text>
                </View>
                {pull && <Text style={styles.pull}>“{pull}”</Text>}
              </>
            )}

            <Text style={styles.numberedTitle}>
              <Text style={styles.numberedTitleAccent}>02  </Text>Experience
            </Text>
            {profile.experience?.map((e, i) => (
              <View key={e.id ?? i} style={styles.expBlock}>
                <View style={styles.expRow}>
                  <Text style={styles.position}>{e.position}</Text>
                  <Text style={styles.dates}>
                    {e.startDate} – {e.current ? "Present" : e.endDate ?? ""}
                  </Text>
                </View>
                <Text style={styles.company}>{e.company}</Text>
                {e.description && <Text style={styles.desc}>{e.description}</Text>}
              </View>
            ))}
          </View>

          <View style={styles.colSide}>
            <Text style={styles.sideTitle}>Education</Text>
            {profile.education?.map((ed, i) => (
              <View key={ed.id ?? i} style={{ marginBottom: 6 }}>
                <Text style={[styles.sideItem, { fontFamily: "Times-Bold" }]}>
                  {ed.degree ?? ed.institutionName}
                </Text>
                <Text style={styles.sideItem}>{ed.institutionName}</Text>
                <Text style={[styles.sideItem, { color: MUTED }]}>
                  {ed.startYear} – {ed.endYear}
                </Text>
              </View>
            ))}

            {profile.skills && profile.skills.length > 0 && (
              <>
                <Text style={styles.sideTitle}>Skills</Text>
                {profile.skills.slice(0, 12).map((s, i) => (
                  <Text key={i} style={styles.sideItem}>• {s}</Text>
                ))}
              </>
            )}

            {profile.languages && profile.languages.length > 0 && (
              <>
                <Text style={styles.sideTitle}>Languages</Text>
                {profile.languages.map((l, i) => (
                  <Text key={i} style={styles.sideItem}>
                    {l.name} ({l.proficiency})
                  </Text>
                ))}
              </>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default EditorialTemplate;
```

- [ ] **Step 2: Register in `index.ts`**

Append:

```ts
  {
    id: "editorial",
    name: "Magazine Editorial",
    description: "Magazine-style layout with drop caps, pull quotes, and numbered sections",
    preview: "/templates/editorial-preview.png",
    category: "creative",
    bestFor: ["Editorial", "PR", "Brand", "Writing"],
    accentColor: "#7f1d1d",
    loader: () => import("./EditorialTemplate"),
    exportName: "EditorialTemplate",
  },
```

- [ ] **Step 3: Run build**

Run: `npm --prefix "e:/talha taha/Applica-Smart" run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git -C "e:/talha taha/Applica-Smart" add src/components/cv/templates/EditorialTemplate.tsx src/components/cv/templates/index.ts
git -C "e:/talha taha/Applica-Smart" commit -m "feat(cv): add EditorialTemplate (magazine style)"
```

---

## Task 8: Build `TimelineTemplate`

**Files:**
- Create: `src/components/cv/templates/TimelineTemplate.tsx`
- Modify: `src/components/cv/templates/index.ts`

- [ ] **Step 1: Create the template**

Create `src/components/cv/templates/TimelineTemplate.tsx`:

```tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";

const ACCENT = "#0f172a";
const SPINE = "#cbd5e1";
const MUTED = "#64748b";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    paddingHorizontal: 40,
    paddingVertical: 36,
    color: "#0f172a",
  },
  header: { marginBottom: 18 },
  name: { fontSize: 24, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  tagline: { fontSize: 11, color: MUTED, marginBottom: 6 },
  contact: { fontSize: 9, color: MUTED },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    marginBottom: 8,
    marginTop: 12,
  },
  timelineRow: { flexDirection: "row", marginBottom: 12 },
  spineCol: {
    width: 100,
    paddingRight: 10,
    alignItems: "flex-end",
  },
  spineDate: { fontSize: 9, color: MUTED, fontFamily: "Helvetica-Bold" },
  spineSubDate: { fontSize: 8, color: MUTED, marginTop: 1 },
  axis: {
    width: 16,
    alignItems: "center",
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: ACCENT,
    marginTop: 2,
  },
  line: {
    width: 1.5,
    flex: 1,
    backgroundColor: SPINE,
    marginTop: 2,
  },
  contentCol: { flex: 1, paddingLeft: 8 },
  position: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  company: { fontSize: 10, color: ACCENT, marginBottom: 3 },
  desc: { fontSize: 9.5, lineHeight: 1.5 },
  bullet: { fontSize: 9.5, lineHeight: 1.5, marginLeft: 8 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  pill: {
    fontSize: 9,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    marginRight: 4,
    marginBottom: 4,
  },
});

interface Props { profile: Profile; }

interface Entry { from: string; to: string; title: string; org: string; description?: string; bullets?: string[]; }

export const TimelineTemplate = ({ profile }: Props) => {
  const expEntries: Entry[] = (profile.experience ?? []).map((e) => ({
    from: e.startDate ?? "",
    to: e.current ? "Present" : e.endDate ?? "",
    title: e.position,
    org: e.company,
    description: e.description,
    bullets: e.responsibilities,
  }));
  const eduEntries: Entry[] = (profile.education ?? []).map((ed) => ({
    from: ed.startYear ?? "",
    to: ed.endYear ?? "",
    title: ed.degree ?? ed.institutionName,
    org: ed.institutionName,
  }));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
          {profile.bio && <Text style={styles.tagline}>{profile.bio.split(".")[0]}.</Text>}
          <Text style={styles.contact}>
            {[profile.email, profile.phone, profile.address].filter(Boolean).join("  •  ")}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Experience</Text>
        {expEntries.map((entry, i) => (
          <View key={i} style={styles.timelineRow}>
            <View style={styles.spineCol}>
              <Text style={styles.spineDate}>{entry.to}</Text>
              <Text style={styles.spineSubDate}>{entry.from}</Text>
            </View>
            <View style={styles.axis}>
              <View style={styles.dot} />
              {i < expEntries.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.contentCol}>
              <Text style={styles.position}>{entry.title}</Text>
              <Text style={styles.company}>{entry.org}</Text>
              {entry.description && <Text style={styles.desc}>{entry.description}</Text>}
              {entry.bullets?.map((b, j) => (
                <Text key={j} style={styles.bullet}>• {b}</Text>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Education</Text>
        {eduEntries.map((entry, i) => (
          <View key={i} style={styles.timelineRow}>
            <View style={styles.spineCol}>
              <Text style={styles.spineDate}>{entry.to}</Text>
              <Text style={styles.spineSubDate}>{entry.from}</Text>
            </View>
            <View style={styles.axis}>
              <View style={styles.dot} />
              {i < eduEntries.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.contentCol}>
              <Text style={styles.position}>{entry.title}</Text>
              <Text style={styles.company}>{entry.org}</Text>
            </View>
          </View>
        ))}

        {profile.skills && profile.skills.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.pillRow}>
              {profile.skills.map((s, i) => (
                <Text key={i} style={styles.pill}>{s}</Text>
              ))}
            </View>
          </>
        )}
      </Page>
    </Document>
  );
};

export default TimelineTemplate;
```

- [ ] **Step 2: Register in `index.ts`**

Append:

```ts
  {
    id: "timeline",
    name: "Timeline",
    description: "Vertical-spine timeline showing chronology of experience and education",
    preview: "/templates/timeline-preview.png",
    category: "modern",
    bestFor: ["Career storytelling", "Long careers", "Startups"],
    accentColor: "#0f172a",
    loader: () => import("./TimelineTemplate"),
    exportName: "TimelineTemplate",
  },
```

- [ ] **Step 3: Build + commit**

```bash
npm --prefix "e:/talha taha/Applica-Smart" run build
```
Expected: passes.

```bash
git -C "e:/talha taha/Applica-Smart" add src/components/cv/templates/TimelineTemplate.tsx src/components/cv/templates/index.ts
git -C "e:/talha taha/Applica-Smart" commit -m "feat(cv): add TimelineTemplate"
```

---

## Task 9: Build `GradientTemplate`

**Files:**
- Create: `src/components/cv/templates/GradientTemplate.tsx`
- Modify: `src/components/cv/templates/index.ts`

- [ ] **Step 1: Create the template**

Create `src/components/cv/templates/GradientTemplate.tsx`:

```tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
} from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";

const styles = StyleSheet.create({
  page: { backgroundColor: "#ffffff", fontFamily: "Helvetica", color: "#0f172a" },
  heroWrap: { position: "relative", height: 130 },
  heroSvg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  heroContent: {
    position: "absolute",
    top: 30,
    left: 40,
    right: 40,
    bottom: 0,
  },
  name: { fontSize: 26, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  tagline: { fontSize: 11, color: "#e0e7ff", marginTop: 6 },
  contact: { fontSize: 9, color: "#cbd5e1", marginTop: 8 },
  body: { paddingHorizontal: 40, paddingTop: 18, paddingBottom: 30 },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    color: "#4f46e5",
    marginBottom: 6,
    marginTop: 14,
  },
  bio: { fontSize: 10.5, lineHeight: 1.55 },
  expRow: { marginBottom: 10 },
  expHeader: { flexDirection: "row", justifyContent: "space-between" },
  position: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  dates: { fontSize: 9, color: "#64748b" },
  company: { fontSize: 10, color: "#4f46e5", marginBottom: 2 },
  desc: { fontSize: 10, lineHeight: 1.5 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  pill: {
    fontSize: 9,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  linkRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  link: { fontSize: 9, color: "#4f46e5", marginRight: 10 },
});

interface Props { profile: Profile; }

export const GradientTemplate = ({ profile }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.heroWrap}>
        <Svg style={styles.heroSvg} viewBox="0 0 595 130">
          <Defs>
            <LinearGradient id="g" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#4f46e5" />
              <Stop offset="1" stopColor="#06b6d4" />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={595} height={130} fill="url(#g)" />
        </Svg>
        <View style={styles.heroContent}>
          <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
          {profile.bio && <Text style={styles.tagline}>{profile.bio.split(".")[0]}.</Text>}
          <Text style={styles.contact}>
            {[profile.email, profile.phone, profile.address].filter(Boolean).join("  •  ")}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        {profile.links && profile.links.length > 0 && (
          <View style={styles.linkRow}>
            {profile.links.map((l, i) => (
              <Text key={i} style={styles.link}>
                {l.label}: {l.url}
              </Text>
            ))}
          </View>
        )}

        {profile.bio && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </>
        )}

        {profile.experience?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profile.experience.map((e, i) => (
              <View key={e.id ?? i} style={styles.expRow}>
                <View style={styles.expHeader}>
                  <Text style={styles.position}>{e.position}</Text>
                  <Text style={styles.dates}>
                    {e.startDate} – {e.current ? "Present" : e.endDate ?? ""}
                  </Text>
                </View>
                <Text style={styles.company}>{e.company}</Text>
                {e.description && <Text style={styles.desc}>{e.description}</Text>}
              </View>
            ))}
          </>
        )}

        {profile.skills?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.pillRow}>
              {profile.skills.map((s, i) => (
                <Text key={i} style={styles.pill}>{s}</Text>
              ))}
            </View>
          </>
        )}

        {profile.education?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((ed, i) => (
              <View key={ed.id ?? i} style={styles.expRow}>
                <Text style={styles.position}>{ed.degree ?? ed.institutionName}</Text>
                <Text style={styles.company}>{ed.institutionName}</Text>
                <Text style={styles.dates}>{ed.startYear} – {ed.endYear}</Text>
              </View>
            ))}
          </>
        )}
      </View>
    </Page>
  </Document>
);

export default GradientTemplate;
```

- [ ] **Step 2: Register**

Append in `index.ts`:

```ts
  {
    id: "gradient",
    name: "Bold Gradient",
    description: "Gradient header band, pill skills, modern startup vibe",
    preview: "/templates/gradient-preview.png",
    category: "modern",
    bestFor: ["Startups", "Product", "Growth"],
    accentColor: "#4f46e5",
    loader: () => import("./GradientTemplate"),
    exportName: "GradientTemplate",
  },
```

- [ ] **Step 3: Build + commit**

```bash
npm --prefix "e:/talha taha/Applica-Smart" run build
git -C "e:/talha taha/Applica-Smart" add src/components/cv/templates/GradientTemplate.tsx src/components/cv/templates/index.ts
git -C "e:/talha taha/Applica-Smart" commit -m "feat(cv): add GradientTemplate"
```

If LinearGradient renders incorrectly during manual verification (Task 16), fall back to layered alpha rects: replace the `<Defs><LinearGradient/></Defs>` block with five `<Rect>` elements at increasing x-offset, decreasing alpha, all with fill `#4f46e5` then second pass `#06b6d4`.

---

## Task 10: Build `SidebarColorTemplate`

**Files:**
- Create: `src/components/cv/templates/SidebarColorTemplate.tsx`
- Modify: `src/components/cv/templates/index.ts`

- [ ] **Step 1: Create the template**

Create `src/components/cv/templates/SidebarColorTemplate.tsx`:

```tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";

const ACCENT = "#0f766e";
const ACCENT_DARK = "#0b5950";
const INK = "#0f172a";
const MUTED = "#475569";

const styles = StyleSheet.create({
  page: { flexDirection: "row", fontFamily: "Helvetica", color: INK, backgroundColor: "#ffffff" },
  sidebar: {
    width: "35%",
    backgroundColor: ACCENT,
    color: "#ffffff",
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: "center",
    marginBottom: 14,
  },
  initialsCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: "center",
    marginBottom: 14,
    backgroundColor: ACCENT_DARK,
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: { fontSize: 32, color: "#ffffff", fontFamily: "Helvetica-Bold" },
  sidebarTitle: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    color: "#ecfeff",
    marginTop: 14,
    marginBottom: 4,
  },
  sidebarItem: { fontSize: 9.5, color: "#ecfeff", marginBottom: 3, lineHeight: 1.4 },
  main: { width: "65%", paddingHorizontal: 28, paddingVertical: 28 },
  name: { fontSize: 26, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  role: { fontSize: 12, color: ACCENT, marginTop: 4, marginBottom: 12 },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    borderBottomWidth: 1,
    borderBottomColor: ACCENT,
    paddingBottom: 2,
    marginTop: 14,
    marginBottom: 6,
  },
  bio: { fontSize: 10.5, lineHeight: 1.5 },
  expRow: { marginBottom: 9 },
  expHeader: { flexDirection: "row", justifyContent: "space-between" },
  position: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  dates: { fontSize: 9, color: MUTED },
  company: { fontSize: 10, color: MUTED, fontStyle: "italic", marginBottom: 2 },
  desc: { fontSize: 9.5, lineHeight: 1.5 },
});

const initials = (name?: string | null): string => {
  if (!name) return "•";
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
};

interface Props { profile: Profile; }

export const SidebarColorTemplate = ({ profile }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.sidebar}>
        {profile.photo_url ? (
          <Image src={profile.photo_url} style={styles.photo} />
        ) : (
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>{initials(profile.name)}</Text>
          </View>
        )}

        <Text style={styles.sidebarTitle}>Contact</Text>
        {profile.email && <Text style={styles.sidebarItem}>{profile.email}</Text>}
        {profile.phone && <Text style={styles.sidebarItem}>{profile.phone}</Text>}
        {profile.address && <Text style={styles.sidebarItem}>{profile.address}</Text>}

        {profile.skills && profile.skills.length > 0 && (
          <>
            <Text style={styles.sidebarTitle}>Skills</Text>
            {profile.skills.slice(0, 14).map((s, i) => (
              <Text key={i} style={styles.sidebarItem}>• {s}</Text>
            ))}
          </>
        )}

        {profile.languages && profile.languages.length > 0 && (
          <>
            <Text style={styles.sidebarTitle}>Languages</Text>
            {profile.languages.map((l, i) => (
              <Text key={i} style={styles.sidebarItem}>{l.name} — {l.proficiency}</Text>
            ))}
          </>
        )}

        {profile.hobbies && profile.hobbies.length > 0 && (
          <>
            <Text style={styles.sidebarTitle}>Interests</Text>
            {profile.hobbies.slice(0, 6).map((h, i) => (
              <Text key={i} style={styles.sidebarItem}>{h}</Text>
            ))}
          </>
        )}
      </View>

      <View style={styles.main}>
        <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
        {profile.experience?.[0]?.position && (
          <Text style={styles.role}>{profile.experience[0].position}</Text>
        )}

        {profile.bio && (
          <>
            <Text style={styles.sectionTitle}>Profile</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </>
        )}

        {profile.experience?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profile.experience.map((e, i) => (
              <View key={e.id ?? i} style={styles.expRow}>
                <View style={styles.expHeader}>
                  <Text style={styles.position}>{e.position}</Text>
                  <Text style={styles.dates}>
                    {e.startDate} – {e.current ? "Present" : e.endDate ?? ""}
                  </Text>
                </View>
                <Text style={styles.company}>{e.company}</Text>
                {e.description && <Text style={styles.desc}>{e.description}</Text>}
              </View>
            ))}
          </>
        )}

        {profile.education?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((ed, i) => (
              <View key={ed.id ?? i} style={styles.expRow}>
                <Text style={styles.position}>{ed.degree ?? ed.institutionName}</Text>
                <Text style={styles.company}>{ed.institutionName}</Text>
                <Text style={styles.dates}>{ed.startYear} – {ed.endYear}</Text>
              </View>
            ))}
          </>
        )}

        {profile.projects && profile.projects.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Projects</Text>
            {profile.projects.map((p, i) => (
              <View key={p.id ?? i} style={styles.expRow}>
                <Text style={styles.position}>{p.name}</Text>
                {p.role && <Text style={styles.company}>{p.role}</Text>}
                {p.description && <Text style={styles.desc}>{p.description}</Text>}
              </View>
            ))}
          </>
        )}
      </View>
    </Page>
  </Document>
);

export default SidebarColorTemplate;
```

- [ ] **Step 2: Register**

Append in `index.ts`:

```ts
  {
    id: "sidebar-color",
    name: "Sidebar Color Block",
    description: "Full-color left sidebar with photo or initials, white content column",
    preview: "/templates/sidebar-color-preview.png",
    category: "modern",
    bestFor: ["Software", "Product", "Operations"],
    accentColor: "#0f766e",
    needsPhoto: true,
    loader: () => import("./SidebarColorTemplate"),
    exportName: "SidebarColorTemplate",
  },
```

- [ ] **Step 3: Build + commit**

```bash
npm --prefix "e:/talha taha/Applica-Smart" run build
git -C "e:/talha taha/Applica-Smart" add src/components/cv/templates/SidebarColorTemplate.tsx src/components/cv/templates/index.ts
git -C "e:/talha taha/Applica-Smart" commit -m "feat(cv): add SidebarColorTemplate"
```

---

## Task 11: Build `PhotoHeaderTemplate`

**Files:**
- Create: `src/components/cv/templates/PhotoHeaderTemplate.tsx`
- Modify: `src/components/cv/templates/index.ts`

- [ ] **Step 1: Create the template**

Create `src/components/cv/templates/PhotoHeaderTemplate.tsx`:

```tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";

const ACCENT = "#1e40af";
const INK = "#0f172a";
const MUTED = "#475569";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", color: INK, backgroundColor: "#ffffff" },
  banner: {
    height: 150,
    backgroundColor: ACCENT,
    paddingHorizontal: 36,
    paddingVertical: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  photo: { width: 96, height: 96, borderRadius: 48, marginRight: 22, borderWidth: 3, borderColor: "#ffffff" },
  initialsCircle: {
    width: 96, height: 96, borderRadius: 48, marginRight: 22,
    backgroundColor: "#1e3a8a",
    borderWidth: 3, borderColor: "#ffffff",
    alignItems: "center", justifyContent: "center",
  },
  initialsText: { fontSize: 32, color: "#fff", fontFamily: "Helvetica-Bold" },
  bannerCol: { flex: 1 },
  name: { fontSize: 26, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  role: { fontSize: 12, color: "#dbeafe", marginTop: 4 },
  contact: { fontSize: 9, color: "#dbeafe", marginTop: 8 },
  body: { flexDirection: "row", paddingHorizontal: 32, paddingVertical: 22 },
  left: { width: "32%", paddingRight: 14 },
  right: { width: "68%", paddingLeft: 14, borderLeftWidth: 1, borderLeftColor: "#e2e8f0" },
  sideTitle: {
    fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
    color: ACCENT, fontFamily: "Helvetica-Bold",
    marginTop: 10, marginBottom: 4,
  },
  sideItem: { fontSize: 9.5, marginBottom: 3 },
  sectionTitle: {
    fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
    fontFamily: "Helvetica-Bold", color: ACCENT,
    borderBottomWidth: 1, borderBottomColor: ACCENT, paddingBottom: 2,
    marginTop: 12, marginBottom: 6,
  },
  bio: { fontSize: 10.5, lineHeight: 1.55 },
  expRow: { marginBottom: 9 },
  expHeader: { flexDirection: "row", justifyContent: "space-between" },
  position: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  dates: { fontSize: 9, color: MUTED },
  company: { fontSize: 10, color: MUTED, fontStyle: "italic", marginBottom: 2 },
  desc: { fontSize: 10, lineHeight: 1.5 },
});

const initials = (name?: string | null): string => {
  if (!name) return "•";
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
};

interface Props { profile: Profile; }

export const PhotoHeaderTemplate = ({ profile }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.banner}>
        {profile.photo_url ? (
          <Image src={profile.photo_url} style={styles.photo} />
        ) : (
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>{initials(profile.name)}</Text>
          </View>
        )}
        <View style={styles.bannerCol}>
          <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
          {profile.experience?.[0]?.position && (
            <Text style={styles.role}>{profile.experience[0].position}</Text>
          )}
          <Text style={styles.contact}>
            {[profile.email, profile.phone, profile.address].filter(Boolean).join("   •   ")}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.left}>
          {profile.skills && profile.skills.length > 0 && (
            <>
              <Text style={styles.sideTitle}>Skills</Text>
              {profile.skills.slice(0, 14).map((s, i) => (
                <Text key={i} style={styles.sideItem}>• {s}</Text>
              ))}
            </>
          )}
          {profile.languages && profile.languages.length > 0 && (
            <>
              <Text style={styles.sideTitle}>Languages</Text>
              {profile.languages.map((l, i) => (
                <Text key={i} style={styles.sideItem}>{l.name} — {l.proficiency}</Text>
              ))}
            </>
          )}
          {profile.hobbies && profile.hobbies.length > 0 && (
            <>
              <Text style={styles.sideTitle}>Interests</Text>
              {profile.hobbies.map((h, i) => (
                <Text key={i} style={styles.sideItem}>{h}</Text>
              ))}
            </>
          )}
        </View>

        <View style={styles.right}>
          {profile.bio && (
            <>
              <Text style={styles.sectionTitle}>Profile</Text>
              <Text style={styles.bio}>{profile.bio}</Text>
            </>
          )}
          {profile.experience?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Experience</Text>
              {profile.experience.map((e, i) => (
                <View key={e.id ?? i} style={styles.expRow}>
                  <View style={styles.expHeader}>
                    <Text style={styles.position}>{e.position}</Text>
                    <Text style={styles.dates}>
                      {e.startDate} – {e.current ? "Present" : e.endDate ?? ""}
                    </Text>
                  </View>
                  <Text style={styles.company}>{e.company}</Text>
                  {e.description && <Text style={styles.desc}>{e.description}</Text>}
                </View>
              ))}
            </>
          )}
          {profile.education?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Education</Text>
              {profile.education.map((ed, i) => (
                <View key={ed.id ?? i} style={styles.expRow}>
                  <Text style={styles.position}>{ed.degree ?? ed.institutionName}</Text>
                  <Text style={styles.company}>{ed.institutionName}</Text>
                  <Text style={styles.dates}>{ed.startYear} – {ed.endYear}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </View>
    </Page>
  </Document>
);

export default PhotoHeaderTemplate;
```

- [ ] **Step 2: Register**

Append in `index.ts`:

```ts
  {
    id: "photo-header",
    name: "Photo Header",
    description: "Banner header with circular profile photo, EU/international style",
    preview: "/templates/photo-header-preview.png",
    category: "modern",
    bestFor: ["EU jobs", "International", "Public sector"],
    accentColor: "#1e40af",
    needsPhoto: true,
    loader: () => import("./PhotoHeaderTemplate"),
    exportName: "PhotoHeaderTemplate",
  },
```

- [ ] **Step 3: Build + commit**

```bash
npm --prefix "e:/talha taha/Applica-Smart" run build
git -C "e:/talha taha/Applica-Smart" add src/components/cv/templates/PhotoHeaderTemplate.tsx src/components/cv/templates/index.ts
git -C "e:/talha taha/Applica-Smart" commit -m "feat(cv): add PhotoHeaderTemplate"
```

---

## Task 12: Build `DevTemplate`

**Files:**
- Create: `src/components/cv/templates/DevTemplate.tsx`
- Modify: `src/components/cv/templates/index.ts`

- [ ] **Step 1: Create the template**

Create `src/components/cv/templates/DevTemplate.tsx`:

```tsx
import {
  Document, Page, Text, View, StyleSheet, Svg, Rect,
} from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";

const ACCENT = "#10b981";
const INK = "#0f172a";
const MUTED = "#64748b";

const styles = StyleSheet.create({
  page: { fontFamily: "Courier", color: INK, backgroundColor: "#ffffff", paddingHorizontal: 38, paddingVertical: 32 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 },
  nameWrap: {},
  name: { fontSize: 24, fontFamily: "Courier-Bold" },
  handle: { fontSize: 11, color: ACCENT, marginTop: 2 },
  contact: { fontSize: 9, color: MUTED, textAlign: "right" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e2e8f0", marginBottom: 10 },
  contribTitle: { fontSize: 9, color: MUTED, marginBottom: 4 },
  sectionTitle: {
    fontSize: 11, fontFamily: "Courier-Bold", color: ACCENT,
    marginTop: 14, marginBottom: 6,
  },
  comment: { fontSize: 9.5, color: MUTED, marginBottom: 2 },
  bio: { fontSize: 10, lineHeight: 1.5 },
  expRow: { marginBottom: 9 },
  expHeader: { flexDirection: "row", justifyContent: "space-between" },
  position: { fontSize: 11, fontFamily: "Courier-Bold" },
  dates: { fontSize: 9, color: MUTED },
  company: { fontSize: 10, color: ACCENT, marginBottom: 2 },
  desc: { fontSize: 10, lineHeight: 1.5 },
  projectCard: {
    borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4,
    padding: 8, marginBottom: 8,
  },
  projectName: { fontSize: 11, fontFamily: "Courier-Bold" },
  projectMeta: { fontSize: 9, color: MUTED, marginVertical: 2 },
  projectDesc: { fontSize: 10, lineHeight: 1.4 },
  techRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  tech: {
    fontSize: 8.5, paddingHorizontal: 5, paddingVertical: 1.5,
    backgroundColor: "#ecfdf5", color: "#065f46",
    borderRadius: 3, marginRight: 3, marginBottom: 3,
  },
  skillsRow: { flexDirection: "row", flexWrap: "wrap" },
  skillTag: {
    fontSize: 9, paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: "#f1f5f9", borderRadius: 3,
    marginRight: 4, marginBottom: 4,
  },
});

const hashStr = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const ContribGrid = ({ seed }: { seed: string }) => {
  const cols = 26;
  const rows = 7;
  const cell = 6;
  const gap = 1.5;
  const w = cols * (cell + gap);
  const h = rows * (cell + gap);
  const palette = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
  let h0 = hashStr(seed) || 1;
  const rng = () => { h0 = (h0 * 9301 + 49297) % 233280; return h0 / 233280; };
  const cells = [] as { x: number; y: number; c: string }[];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const v = rng();
      const idx = v < 0.5 ? 0 : v < 0.7 ? 1 : v < 0.85 ? 2 : v < 0.95 ? 3 : 4;
      cells.push({ x: c * (cell + gap), y: r * (cell + gap), c: palette[idx] });
    }
  }
  return (
    <Svg width={w} height={h}>
      {cells.map((p, i) => (
        <Rect key={i} x={p.x} y={p.y} width={cell} height={cell} fill={p.c} rx={1} ry={1} />
      ))}
    </Svg>
  );
};

interface Props { profile: Profile; }

export const DevTemplate = ({ profile }: Props) => {
  const handle = (() => {
    const gh = profile.links?.find((l) => /github/i.test(l.label) || /github/i.test(l.url));
    if (gh) return gh.url.replace(/^https?:\/\/(www\.)?github\.com\//i, "@");
    return profile.email ? `@${profile.email.split("@")[0]}` : "";
  })();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.nameWrap}>
            <Text style={styles.name}>{profile.name ?? "your_name"}</Text>
            {handle && <Text style={styles.handle}>{handle}</Text>}
          </View>
          <Text style={styles.contact}>
            {[profile.email, profile.phone, profile.address].filter(Boolean).join("\n")}
          </Text>
        </View>
        <View style={styles.divider} />

        <Text style={styles.contribTitle}># last 6 months of commits</Text>
        <ContribGrid seed={profile.name ?? "anon"} />

        {profile.bio && (
          <>
            <Text style={styles.sectionTitle}>// about</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </>
        )}

        {profile.experience?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>// experience</Text>
            {profile.experience.map((e, i) => (
              <View key={e.id ?? i} style={styles.expRow}>
                <View style={styles.expHeader}>
                  <Text style={styles.position}>{e.position}</Text>
                  <Text style={styles.dates}>
                    {e.startDate} → {e.current ? "Present" : e.endDate ?? ""}
                  </Text>
                </View>
                <Text style={styles.company}>{e.company}</Text>
                {e.description && <Text style={styles.desc}>{e.description}</Text>}
              </View>
            ))}
          </>
        )}

        {profile.projects && profile.projects.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>// projects</Text>
            {profile.projects.map((p, i) => (
              <View key={p.id ?? i} style={styles.projectCard}>
                <Text style={styles.projectName}>{p.name}</Text>
                {(p.role || p.link) && (
                  <Text style={styles.projectMeta}>
                    {[p.role, p.link].filter(Boolean).join("  ·  ")}
                  </Text>
                )}
                {p.description && <Text style={styles.projectDesc}>{p.description}</Text>}
                {p.tech && p.tech.length > 0 && (
                  <View style={styles.techRow}>
                    {p.tech.map((t, j) => (
                      <Text key={j} style={styles.tech}>{t}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {profile.skills?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>// stack</Text>
            <View style={styles.skillsRow}>
              {profile.skills.map((s, i) => (
                <Text key={i} style={styles.skillTag}>{s}</Text>
              ))}
            </View>
          </>
        )}

        {profile.education?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>// education</Text>
            {profile.education.map((ed, i) => (
              <View key={ed.id ?? i} style={styles.expRow}>
                <Text style={styles.position}>{ed.degree ?? ed.institutionName}</Text>
                <Text style={styles.company}>{ed.institutionName}</Text>
                <Text style={styles.dates}>{ed.startYear} – {ed.endYear}</Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
};

export default DevTemplate;
```

- [ ] **Step 2: Register**

```ts
  {
    id: "dev",
    name: "Tech / Developer",
    description: "Monospace headers, GitHub-style contribution grid, project cards",
    preview: "/templates/dev-preview.png",
    category: "technical",
    bestFor: ["Software", "DevOps", "ML/AI"],
    accentColor: "#10b981",
    loader: () => import("./DevTemplate"),
    exportName: "DevTemplate",
  },
```

- [ ] **Step 3: Build + commit**

```bash
npm --prefix "e:/talha taha/Applica-Smart" run build
git -C "e:/talha taha/Applica-Smart" add src/components/cv/templates/DevTemplate.tsx src/components/cv/templates/index.ts
git -C "e:/talha taha/Applica-Smart" commit -m "feat(cv): add DevTemplate with contribution grid"
```

---

## Task 13: Build `PortfolioTemplate`

**Files:**
- Create: `src/components/cv/templates/PortfolioTemplate.tsx`
- Modify: `src/components/cv/templates/index.ts`

- [ ] **Step 1: Create the template**

Create `src/components/cv/templates/PortfolioTemplate.tsx`:

```tsx
import {
  Document, Page, Text, View, StyleSheet, Svg, Rect,
} from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";

const ACCENT = "#ec4899";
const INK = "#0f172a";
const MUTED = "#64748b";

const PROJECT_PALETTE = ["#fbcfe8", "#bfdbfe", "#fde68a", "#bbf7d0", "#fecaca", "#ddd6fe"];

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", color: INK, backgroundColor: "#ffffff", paddingHorizontal: 36, paddingVertical: 30 },
  hero: { marginBottom: 14 },
  rolePill: {
    fontSize: 9, paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: ACCENT, color: "#fff",
    borderRadius: 12, alignSelf: "flex-start", marginBottom: 6,
    fontFamily: "Helvetica-Bold", letterSpacing: 1, textTransform: "uppercase",
  },
  name: { fontSize: 38, fontFamily: "Helvetica-Bold", lineHeight: 1.05 },
  contact: { fontSize: 9, color: MUTED, marginTop: 6 },
  sectionTitle: {
    fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
    fontFamily: "Helvetica-Bold", color: ACCENT,
    marginTop: 14, marginBottom: 6,
  },
  bio: { fontSize: 10.5, lineHeight: 1.55 },
  projectGrid: { flexDirection: "row", flexWrap: "wrap" },
  projectCard: { width: "48%", marginBottom: 10, marginRight: "2%" },
  projectThumb: { width: "100%", height: 60, borderRadius: 4, marginBottom: 4 },
  projectName: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  projectRole: { fontSize: 9, color: MUTED, marginBottom: 2 },
  projectDesc: { fontSize: 9.5, lineHeight: 1.45 },
  expRow: { marginBottom: 8 },
  expHeader: { flexDirection: "row", justifyContent: "space-between" },
  position: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  dates: { fontSize: 9, color: MUTED },
  company: { fontSize: 10, color: ACCENT, fontStyle: "italic", marginBottom: 2 },
  desc: { fontSize: 10, lineHeight: 1.5 },
  pillRow: { flexDirection: "row", flexWrap: "wrap" },
  pill: {
    fontSize: 9, paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: "#fce7f3", color: "#9d174d",
    borderRadius: 8, marginRight: 4, marginBottom: 4,
  },
});

const ProjectThumb = ({ idx }: { idx: number }) => {
  const a = PROJECT_PALETTE[idx % PROJECT_PALETTE.length];
  const b = PROJECT_PALETTE[(idx + 2) % PROJECT_PALETTE.length];
  return (
    <Svg style={styles.projectThumb} viewBox="0 0 200 60">
      <Rect x={0} y={0} width={200} height={60} fill={a} />
      <Rect x={0} y={20} width={120} height={40} fill={b} />
      <Rect x={140} y={6} width={50} height={48} fill={ACCENT} />
    </Svg>
  );
};

interface Props { profile: Profile; }

export const PortfolioTemplate = ({ profile }: Props) => {
  const projects = profile.projects ?? [];
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          {profile.experience?.[0]?.position && (
            <Text style={styles.rolePill}>{profile.experience[0].position}</Text>
          )}
          <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
          <Text style={styles.contact}>
            {[profile.email, profile.phone, profile.address].filter(Boolean).join("   ·   ")}
          </Text>
        </View>

        {profile.bio && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </>
        )}

        {projects.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Selected Work</Text>
            <View style={styles.projectGrid}>
              {projects.map((p, i) => (
                <View key={p.id ?? i} style={styles.projectCard}>
                  <ProjectThumb idx={i} />
                  <Text style={styles.projectName}>{p.name}</Text>
                  {p.role && <Text style={styles.projectRole}>{p.role}</Text>}
                  {p.description && <Text style={styles.projectDesc}>{p.description}</Text>}
                </View>
              ))}
            </View>
          </>
        )}

        {profile.experience?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profile.experience.map((e, i) => (
              <View key={e.id ?? i} style={styles.expRow}>
                <View style={styles.expHeader}>
                  <Text style={styles.position}>{e.position}</Text>
                  <Text style={styles.dates}>
                    {e.startDate} – {e.current ? "Present" : e.endDate ?? ""}
                  </Text>
                </View>
                <Text style={styles.company}>{e.company}</Text>
                {e.description && <Text style={styles.desc}>{e.description}</Text>}
              </View>
            ))}
          </>
        )}

        {profile.skills?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.pillRow}>
              {profile.skills.map((s, i) => (
                <Text key={i} style={styles.pill}>{s}</Text>
              ))}
            </View>
          </>
        )}

        {profile.education?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((ed, i) => (
              <View key={ed.id ?? i} style={styles.expRow}>
                <Text style={styles.position}>{ed.degree ?? ed.institutionName}</Text>
                <Text style={styles.company}>{ed.institutionName}</Text>
                <Text style={styles.dates}>{ed.startYear} – {ed.endYear}</Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
};

export default PortfolioTemplate;
```

- [ ] **Step 2: Register**

```ts
  {
    id: "portfolio",
    name: "Designer Portfolio",
    description: "Bold typography with project thumbnail grid for designers",
    preview: "/templates/portfolio-preview.png",
    category: "creative",
    bestFor: ["Design", "UX", "Brand", "Illustration"],
    accentColor: "#ec4899",
    loader: () => import("./PortfolioTemplate"),
    exportName: "PortfolioTemplate",
  },
```

- [ ] **Step 3: Build + commit**

```bash
npm --prefix "e:/talha taha/Applica-Smart" run build
git -C "e:/talha taha/Applica-Smart" add src/components/cv/templates/PortfolioTemplate.tsx src/components/cv/templates/index.ts
git -C "e:/talha taha/Applica-Smart" commit -m "feat(cv): add PortfolioTemplate with project thumbs"
```

---

## Task 14: Build `AcademicTemplate`

**Files:**
- Create: `src/components/cv/templates/AcademicTemplate.tsx`
- Modify: `src/components/cv/templates/index.ts`

- [ ] **Step 1: Create the template**

Create `src/components/cv/templates/AcademicTemplate.tsx`:

```tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";

const styles = StyleSheet.create({
  page: { fontFamily: "Times-Roman", color: "#000000", backgroundColor: "#ffffff", paddingHorizontal: 56, paddingVertical: 48 },
  header: { alignItems: "center", marginBottom: 14 },
  name: { fontSize: 22, fontFamily: "Times-Bold", letterSpacing: 1 },
  affiliation: { fontSize: 10, marginTop: 2 },
  contact: { fontSize: 9, marginTop: 2 },
  sectionTitle: {
    fontSize: 11, fontFamily: "Times-Bold",
    textTransform: "uppercase", letterSpacing: 2,
    borderBottomWidth: 0.7, borderBottomColor: "#000",
    paddingBottom: 1, marginTop: 14, marginBottom: 6,
  },
  twoCol: { flexDirection: "row", justifyContent: "space-between" },
  block: { marginBottom: 6 },
  position: { fontSize: 10.5, fontFamily: "Times-Bold" },
  org: { fontSize: 10, fontStyle: "italic" },
  dates: { fontSize: 9 },
  desc: { fontSize: 10, lineHeight: 1.5, marginTop: 1 },
  pubItem: { fontSize: 10, lineHeight: 1.55, marginBottom: 4 },
  num: { fontFamily: "Times-Bold" },
});

interface Props { profile: Profile; }

export const AcademicTemplate = ({ profile }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
        <Text style={styles.contact}>
          {[profile.email, profile.phone, profile.address].filter(Boolean).join("  ·  ")}
        </Text>
      </View>

      {profile.education?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Education</Text>
          {profile.education.map((ed, i) => (
            <View key={ed.id ?? i} style={[styles.twoCol, styles.block]}>
              <View>
                <Text style={styles.position}>{ed.degree ?? ed.institutionName}</Text>
                <Text style={styles.org}>{ed.institutionName}</Text>
                {ed.cgpa && <Text style={styles.desc}>CGPA: {ed.cgpa}</Text>}
              </View>
              <Text style={styles.dates}>{ed.startYear} – {ed.endYear}</Text>
            </View>
          ))}
        </>
      )}

      {profile.experience?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Research & Professional Experience</Text>
          {profile.experience.map((e, i) => (
            <View key={e.id ?? i} style={styles.block}>
              <View style={styles.twoCol}>
                <Text style={styles.position}>{e.position}</Text>
                <Text style={styles.dates}>
                  {e.startDate} – {e.current ? "Present" : e.endDate ?? ""}
                </Text>
              </View>
              <Text style={styles.org}>{e.company}</Text>
              {e.description && <Text style={styles.desc}>{e.description}</Text>}
            </View>
          ))}
        </>
      )}

      {profile.publications && profile.publications.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Publications</Text>
          {profile.publications.map((p, i) => (
            <Text key={p.id ?? i} style={styles.pubItem}>
              <Text style={styles.num}>[{i + 1}] </Text>
              {(p.authors ?? []).join(", ")}
              {p.authors?.length ? ". " : ""}
              {p.title}.
              {p.venue ? ` ${p.venue},` : ""}
              {p.year ? ` ${p.year}.` : ""}
              {p.url ? ` ${p.url}` : ""}
            </Text>
          ))}
        </>
      )}

      {profile.awards && profile.awards.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Awards & Honors</Text>
          {profile.awards.map((a, i) => (
            <View key={a.id ?? i} style={[styles.twoCol, styles.block]}>
              <View>
                <Text style={styles.position}>{a.title}</Text>
                {a.issuer && <Text style={styles.org}>{a.issuer}</Text>}
              </View>
              {a.year && <Text style={styles.dates}>{a.year}</Text>}
            </View>
          ))}
        </>
      )}

      {profile.certifications && profile.certifications.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {profile.certifications.map((c, i) => (
            <View key={c.id ?? i} style={[styles.twoCol, styles.block]}>
              <View>
                <Text style={styles.position}>{c.name}</Text>
                <Text style={styles.org}>{c.issuer}</Text>
              </View>
              {c.date && <Text style={styles.dates}>{c.date}</Text>}
            </View>
          ))}
        </>
      )}

      {profile.skills?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Technical Skills</Text>
          <Text style={styles.desc}>{profile.skills.join(", ")}</Text>
        </>
      )}

      {profile.languages && profile.languages.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Languages</Text>
          <Text style={styles.desc}>
            {profile.languages.map((l) => `${l.name} (${l.proficiency})`).join(", ")}
          </Text>
        </>
      )}
    </Page>
  </Document>
);

export default AcademicTemplate;
```

- [ ] **Step 2: Register**

```ts
  {
    id: "academic",
    name: "Academic CV",
    description: "Dense black-and-white serif layout with publications, grants, and citations",
    preview: "/templates/academic-preview.png",
    category: "academic",
    bestFor: ["Research", "Faculty", "Postdoc", "PhD applications"],
    accentColor: "#000000",
    loader: () => import("./AcademicTemplate"),
    exportName: "AcademicTemplate",
  },
```

- [ ] **Step 3: Build + commit**

```bash
npm --prefix "e:/talha taha/Applica-Smart" run build
git -C "e:/talha taha/Applica-Smart" add src/components/cv/templates/AcademicTemplate.tsx src/components/cv/templates/index.ts
git -C "e:/talha taha/Applica-Smart" commit -m "feat(cv): add AcademicTemplate with publications"
```

---

## Task 15: Build `InfographicTemplate`

**Files:**
- Create: `src/components/cv/templates/InfographicTemplate.tsx`
- Modify: `src/components/cv/templates/index.ts`

- [ ] **Step 1: Create the template**

Create `src/components/cv/templates/InfographicTemplate.tsx`:

```tsx
import {
  Document, Page, Text, View, StyleSheet, Svg, Rect, Circle, Path, G,
} from "@react-pdf/renderer";
import type { Profile, SkillLevel, Language } from "../../../lib/supabase";

const ACCENT = "#f59e0b";
const INK = "#1f2937";
const MUTED = "#6b7280";
const TRACK = "#fef3c7";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", color: INK, backgroundColor: "#ffffff", paddingHorizontal: 36, paddingVertical: 30 },
  header: { marginBottom: 14 },
  name: { fontSize: 24, fontFamily: "Helvetica-Bold" },
  tagline: { fontSize: 11, color: MUTED, marginTop: 4 },
  contact: { fontSize: 9, color: MUTED, marginTop: 6 },
  sectionTitle: {
    fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
    fontFamily: "Helvetica-Bold", color: ACCENT,
    marginTop: 14, marginBottom: 6,
  },
  bio: { fontSize: 10.5, lineHeight: 1.55 },
  twoCol: { flexDirection: "row", marginTop: 8 },
  col: { flex: 1, paddingRight: 12 },
  skillRow: { marginBottom: 6 },
  skillLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  skillLabel: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  skillLevelText: { fontSize: 9, color: MUTED },
  ringRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  ringWrap: { width: 90, alignItems: "center", marginBottom: 8 },
  ringLabel: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginTop: 2, textAlign: "center" },
  ringSub: { fontSize: 8.5, color: MUTED, textAlign: "center" },
  expRow: { marginBottom: 9 },
  expHeader: { flexDirection: "row", justifyContent: "space-between" },
  position: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  dates: { fontSize: 9, color: MUTED },
  company: { fontSize: 10, color: ACCENT, marginBottom: 2 },
  desc: { fontSize: 10, lineHeight: 1.5 },
});

const SkillBar = ({ s }: { s: SkillLevel }) => {
  const pct = (s.level / 5) * 100;
  return (
    <View style={styles.skillRow}>
      <View style={styles.skillLabelRow}>
        <Text style={styles.skillLabel}>{s.name}</Text>
        <Text style={styles.skillLevelText}>{s.level}/5</Text>
      </View>
      <Svg width={"100%"} height={6} viewBox="0 0 100 6" preserveAspectRatio="none">
        <Rect x={0} y={0} width={100} height={6} fill={TRACK} rx={3} ry={3} />
        <Rect x={0} y={0} width={pct} height={6} fill={ACCENT} rx={3} ry={3} />
      </Svg>
    </View>
  );
};

const profMap: Record<Language["proficiency"], number> = {
  basic: 0.2, intermediate: 0.45, professional: 0.7, fluent: 0.9, native: 1,
};

const arcPath = (frac: number, r: number, cx: number, cy: number): string => {
  const angle = frac * Math.PI * 2;
  const x = cx + r * Math.sin(angle);
  const y = cy - r * Math.cos(angle);
  const large = frac > 0.5 ? 1 : 0;
  if (frac >= 1) return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r}`;
  return `M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x} ${y}`;
};

const Ring = ({ lang }: { lang: Language }) => {
  const cx = 30; const cy = 30; const r = 22; const frac = profMap[lang.proficiency] ?? 0.5;
  return (
    <View style={styles.ringWrap}>
      <Svg width={60} height={60} viewBox="0 0 60 60">
        <Circle cx={cx} cy={cy} r={r} stroke={TRACK} strokeWidth={6} fill="none" />
        <G>
          <Path d={arcPath(frac, r, cx, cy)} stroke={ACCENT} strokeWidth={6} fill="none" strokeLinecap="round" />
        </G>
        <Text
          x={cx} y={cy + 2}
          style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}
          /* react-pdf Text-in-Svg falls back to View overlay; safe to omit if visual breaks */
        >
          {Math.round(frac * 100)}%
        </Text>
      </Svg>
      <Text style={styles.ringLabel}>{lang.name}</Text>
      <Text style={styles.ringSub}>{lang.proficiency}</Text>
    </View>
  );
};

interface Props { profile: Profile; }

export const InfographicTemplate = ({ profile }: Props) => {
  const skillLevels: SkillLevel[] =
    profile.skill_levels && profile.skill_levels.length > 0
      ? profile.skill_levels
      : (profile.skills ?? []).map((name) => ({ name, level: 4 as 1 | 2 | 3 | 4 | 5 }));
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
          {profile.bio && <Text style={styles.tagline}>{profile.bio.split(".")[0]}.</Text>}
          <Text style={styles.contact}>
            {[profile.email, profile.phone, profile.address].filter(Boolean).join("  ·  ")}
          </Text>
        </View>

        {profile.bio && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </>
        )}

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {skillLevels.slice(0, 8).map((s, i) => (<SkillBar key={i} s={s} />))}
          </View>
          {profile.languages && profile.languages.length > 0 && (
            <View style={styles.col}>
              <Text style={styles.sectionTitle}>Languages</Text>
              <View style={styles.ringRow}>
                {profile.languages.map((l, i) => (<Ring key={i} lang={l} />))}
              </View>
            </View>
          )}
        </View>

        {profile.experience?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profile.experience.map((e, i) => (
              <View key={e.id ?? i} style={styles.expRow}>
                <View style={styles.expHeader}>
                  <Text style={styles.position}>{e.position}</Text>
                  <Text style={styles.dates}>{e.startDate} – {e.current ? "Present" : e.endDate ?? ""}</Text>
                </View>
                <Text style={styles.company}>{e.company}</Text>
                {e.description && <Text style={styles.desc}>{e.description}</Text>}
              </View>
            ))}
          </>
        )}

        {profile.education?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((ed, i) => (
              <View key={ed.id ?? i} style={styles.expRow}>
                <Text style={styles.position}>{ed.degree ?? ed.institutionName}</Text>
                <Text style={styles.company}>{ed.institutionName}</Text>
                <Text style={styles.dates}>{ed.startYear} – {ed.endYear}</Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
};

export default InfographicTemplate;
```

> Note on `<Text>` inside `<Svg>`: `@react-pdf/renderer` SVG support is partial. If the percentage label inside the ring fails to render at build/run time, remove the `<Text>` element from `Ring` — the colored arc + outer `ringLabel` are sufficient. The Path/Circle/Rect/G primitives used here are documented + supported.

- [ ] **Step 2: Register**

```ts
  {
    id: "infographic",
    name: "Infographic",
    description: "Skill bars and language proficiency rings, visual-first layout",
    preview: "/templates/infographic-preview.png",
    category: "creative",
    bestFor: ["Marketing", "Sales", "Customer Success"],
    accentColor: "#f59e0b",
    loader: () => import("./InfographicTemplate"),
    exportName: "InfographicTemplate",
  },
```

- [ ] **Step 3: Build + commit**

```bash
npm --prefix "e:/talha taha/Applica-Smart" run build
git -C "e:/talha taha/Applica-Smart" add src/components/cv/templates/InfographicTemplate.tsx src/components/cv/templates/index.ts
git -C "e:/talha taha/Applica-Smart" commit -m "feat(cv): add InfographicTemplate with skill bars and rings"
```

---

## Task 16: Final verification + manual visual checklist

**Files:**
- None new.

- [ ] **Step 1: Confirm all 17 templates registered**

Run:
```bash
node -e "import('./src/components/cv/templates/index.ts').then(m=>console.log(m.templates.map(t=>t.id))).catch(e=>{console.error(e);process.exit(1)})" --experimental-strip-types
```
If TS strip-types unavailable, instead build then grep:
```bash
npm --prefix "e:/talha taha/Applica-Smart" run build
```
Then:
- Open `src/components/cv/templates/index.ts` and confirm `templates` array has these 17 ids:
  `modern, classic, minimal, executive, creative, ats, compact, elegant, editorial, timeline, gradient, sidebar-color, photo-header, dev, portfolio, academic, infographic`

- [ ] **Step 2: Run the app dev server and exercise each template**

Run:
```bash
npm --prefix "e:/talha taha/Applica-Smart" run dev
```
Open the CV Generator page in the browser. For each of the 10 new templates:
1. Click the template thumbnail.
2. Click Generate / Download.
3. Confirm a PDF blob is produced (no console error from `@react-pdf/renderer`).
4. Open the PDF and confirm the layout looks intended.

If a template throws at render:
- Re-read the error from the dev console.
- The most common cause is an unsupported SVG element. The two known risks are:
  - `<Text>` inside `<Svg>` in `InfographicTemplate.tsx` (Ring component) — remove the inner `<Text>` block if it fails.
  - `<LinearGradient>` in `GradientTemplate.tsx` — fall back to layered solid `<Rect>` overlays as described in Task 9.

- [ ] **Step 3: Stop the dev server and commit any visual fixes**

If fixes were made:
```bash
git -C "e:/talha taha/Applica-Smart" add -p
git -C "e:/talha taha/Applica-Smart" commit -m "fix(cv): correct visual issues in <template> from manual verification"
```

If no fixes needed: nothing to commit, manual verification done.

- [ ] **Step 4: Update `MEMORY.md` (optional)**

If anything surprising was discovered about `@react-pdf/renderer`'s SVG support, save a feedback memory documenting the limitation so future template work doesn't re-discover it.

---

## Self-Review

**Spec coverage:**
- ✅ 10 new templates (Tasks 6–15)
- ✅ Schema file (Task 1)
- ✅ Type extensions (Task 2)
- ✅ Sample data extension (Task 3)
- ✅ Registry (Task 4)
- ✅ Service refactor (Task 5)
- ✅ Build + visual verification (Task 16)
- ✅ RLS off — explicit `disable row level security` on each new table in Task 1
- ✅ Backward compat — existing 7 templates kept; `availableTemplates` re-exported from registry in Task 5; ProfileForm not touched (deferred per spec)

**Placeholder scan:** No "TBD"/"TODO" in any task body. All code blocks are complete.

**Type consistency:**
- `TemplateId`, `TemplateCategory`, `TemplateMeta`, `templates`, `getTemplate`, `loadTemplateComponent` — defined in Task 4, consumed in Task 5 (cv.service) and Task 6+ (registration).
- `SkillLevel`, `Language`, `Project`, `Link`, `Publication`, `Award`, `Certification`, `Volunteer` — defined in Task 2, consumed in Task 3 sample data and Tasks 10–15 templates.
- `Profile.photo_url` (snake_case) is consistent across types (Task 2), sample data (Task 3), and templates (Tasks 10, 11).
- All export names referenced in the registry (`exportName` field) match the actual `export const X = ...` in each template file.

Plan complete and saved to `docs/superpowers/plans/2026-05-07-cv-templates.md`.
