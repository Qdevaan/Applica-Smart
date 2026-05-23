# UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trim redundancies, redesign Dashboard as a bento grid with a last-used CV template tile, redesign Profile as a two-pane sticky-preview editor, redesign Settings with tabbed navigation, and add an avatar pipeline (Google OAuth + custom upload).

**Architecture:** Five commit-bounded sections — (1) routing/navbar cleanup, (2) avatar pipeline + storage migration, (3) bento Dashboard, (4) two-pane Profile + section extraction, (5) tabbed Settings + delete-account edge function. New shared primitives: `Avatar`, `Tabs`, `useAvatar`, `useLastTemplate`. Existing services extended (no rewrites).

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind v4, framer-motion v12, Supabase JS v2, `@react-pdf/renderer` v4, react-router-dom v7, lucide-react, Supabase Edge Functions (Deno).

**Spec:** `docs/superpowers/specs/2026-05-07-ux-overhaul-bento-dashboard-design.md`

**Verification model:** No unit-test runner is configured in this repo (`package.json` has only `dev`/`build`/`lint`/`preview`). The "test gate" for each task is:
1. `npm run build` passes (TypeScript + Vite production build).
2. `npm run lint` passes (ESLint).
3. Manual smoke check listed at the end of each section.

Where this plan says "Run test", it means run `npm run build && npm run lint`.

---

## File Plan

**New files:**
- `src/components/ui/Avatar.tsx` — reusable avatar with initials fallback + ring variant.
- `src/components/ui/Tabs.tsx` — tab nav primitive backed by URL `?tab=`.
- `src/hooks/useAvatar.ts` — resolves `photo_url` → Google url → initials.
- `src/hooks/useLastTemplate.ts` — fetches latest `cv_documents` row.
- `src/services/avatar.service.ts` — upload/remove avatar to Supabase Storage.
- `src/components/dashboard/tiles/WelcomeHeroTile.tsx`
- `src/components/dashboard/tiles/AvatarStreakTile.tsx`
- `src/components/dashboard/tiles/LastTemplateTile.tsx`
- `src/components/dashboard/tiles/StatTile.tsx`
- `src/components/dashboard/tiles/RecentJobsTile.tsx`
- `src/components/profile/ProfileLivePreview.tsx`
- `src/components/profile/ProfileSidebarNav.tsx`
- `src/components/profile/sections/BasicInfoSection.tsx`
- `src/components/profile/sections/SkillsSection.tsx`
- `src/components/profile/sections/HobbiesSection.tsx`
- `src/components/profile/sections/EducationSection.tsx`
- `src/components/profile/sections/ExperienceSection.tsx`
- `src/components/profile/sections/ProjectsSection.tsx`
- `src/components/profile/sections/CertificationsSection.tsx`
- `src/components/profile/sections/LanguagesSection.tsx`
- `src/components/profile/sections/AwardsSection.tsx`
- `src/components/profile/sections/VolunteerSection.tsx`
- `src/components/profile/sections/ReferencesSection.tsx`
- `src/components/profile/sections/LinksSection.tsx`
- `src/components/profile/forms/EducationForm.tsx` (extracted from current Profile.tsx)
- `src/components/profile/forms/ExperienceForm.tsx` (extracted)
- `src/components/settings/AccountTab.tsx`
- `src/components/settings/SecurityTab.tsx`
- `src/components/settings/AppearanceTab.tsx`
- `src/components/settings/NotificationsTab.tsx`
- `src/components/settings/DangerTab.tsx`
- `src/components/settings/AvatarUploader.tsx`
- `src/components/settings/AccentColorPicker.tsx`
- `src/components/settings/DefaultTemplatePicker.tsx`
- `supabase/migrations/2026-05-07-avatars-bucket.sql`
- `supabase/functions/delete-account/index.ts`
- `supabase/functions/delete-account/deno.json`

**Modified files:**
- `src/App.tsx` — drop `/applications` route.
- `src/components/dashboard/DashboardNavbar.tsx` — drop applications link, Bell, profile dropdown; replace trigger with Avatar that links to `/profile`.
- `src/services/profile.service.ts` — add `updatePhotoUrl`, `updatePreferences`, `updateAccentColor`, `updateDefaultTemplate`, `parsePreferences` helper.
- `src/services/cv.service.ts` — add `getLastTemplate(userId)`.
- `src/pages/Dashboard.tsx` — full rewrite using tiles.
- `src/pages/Profile.tsx` — full rewrite using two-pane layout + extracted sections.
- `src/pages/Settings.tsx` — full rewrite using Tabs.
- `src/pages/CVGenerator.tsx` — read `?template=` query param on mount to preselect.
- `src/hooks/useTheme.tsx` — apply `profile.accent_color` as CSS variable override when present.

---

## Task 1: Create feature branch

**Files:** none (git only)

- [ ] **Step 1: Branch off current head**

```bash
git checkout -b feat/ux-overhaul
```

- [ ] **Step 2: Verify branch**

```bash
git status
```

Expected: `On branch feat/ux-overhaul ... nothing to commit, working tree clean`.

---

## Task 2: Drop `/applications` route

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Remove the duplicate route**

In `src/App.tsx`, delete this line inside the protected routes block:

```tsx
<Route path="/applications" element={<Dashboard />} />
```

The protected routes block should now be:

```tsx
<Route element={<DashboardLayout />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/resume" element={<CVGenerator />} />
  <Route path="/settings" element={<Settings />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/jobs" element={<Jobs />} />
</Route>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "refactor(routing): drop redundant /applications route (duplicate of /dashboard)"
```

---

## Task 3: Strip navbar redundancies

**Files:**
- Modify: `src/components/dashboard/DashboardNavbar.tsx`

- [ ] **Step 1: Remove the Applications nav link**

In the `navLinks` array, delete the entry:

```tsx
{ label: "Applications", href: "/applications", icon: Briefcase },
```

Also remove the unused `Briefcase` import from `lucide-react` (the `Search` icon is still used for Jobs — keep it).

- [ ] **Step 2: Remove the Bell button block**

Delete the entire `<motion.button>` block containing the Bell icon (the notifications button) inside the desktop right section. Also remove the `Bell` import.

- [ ] **Step 3: Replace profile dropdown with Avatar link**

This task introduces `Avatar` which is created in Task 4. For now, leave the existing dropdown intact — we will return to this file in Task 7.

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/DashboardNavbar.tsx
git commit -m "refactor(navbar): drop Applications link and decorative Bell button"
```

---

## Task 4: Create `Avatar` component

**Files:**
- Create: `src/components/ui/Avatar.tsx`

- [ ] **Step 1: Write the file**

Create `src/components/ui/Avatar.tsx`:

```tsx
import { useState } from "react";
import type { CSSProperties, MouseEventHandler } from "react";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<AvatarSize, { px: number; text: string }> = {
  sm: { px: 24, text: "text-[10px]" },
  md: { px: 32, text: "text-xs" },
  lg: { px: 48, text: "text-base" },
  xl: { px: 96, text: "text-3xl" },
};

interface AvatarProps {
  url?: string | null;
  name?: string | null;
  size?: AvatarSize;
  ring?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
  className?: string;
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
  return letters || "?";
}

const Avatar = ({
  url,
  name,
  size = "md",
  ring = false,
  onClick,
  ariaLabel,
  className = "",
}: AvatarProps) => {
  const [imgFailed, setImgFailed] = useState(false);
  const { px, text } = SIZES[size];
  const initials = getInitials(name);
  const showImg = !!url && !imgFailed;

  const ringStyle: CSSProperties = ring
    ? {
        padding: 2,
        backgroundImage:
          "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))",
      }
    : {};

  const inner: CSSProperties = {
    width: px,
    height: px,
    backgroundImage: showImg
      ? undefined
      : "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))",
    color: "white",
  };

  const content = (
    <span
      className={`relative inline-flex items-center justify-center rounded-full font-bold ${text}`}
      style={inner}
    >
      {showImg ? (
        <img
          src={url!}
          alt={name ?? "avatar"}
          width={px}
          height={px}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );

  const wrapperClasses = `inline-flex items-center justify-center rounded-full ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel ?? name ?? "avatar"}
        className={wrapperClasses}
        style={ringStyle}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      aria-label={ariaLabel ?? name ?? "avatar"}
      className={wrapperClasses}
      style={ringStyle}
    >
      {content}
    </span>
  );
};

export default Avatar;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Avatar.tsx
git commit -m "feat(ui): add Avatar component with initials fallback and optional gradient ring"
```

---

## Task 5: Create `useAvatar` hook

**Files:**
- Create: `src/hooks/useAvatar.ts`

- [ ] **Step 1: Write the file**

Create `src/hooks/useAvatar.ts`:

```ts
import { useAuth } from "./useAuth";

export type AvatarSource = "custom" | "google" | "none";

export interface UseAvatarResult {
  url: string | null;
  name: string;
  initials: string;
  source: AvatarSource;
  googleUrl: string | null;
}

export function useAvatar(): UseAvatarResult {
  const { user, profile } = useAuth();

  const googleUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ?? null;
  const customUrl = profile?.photo_url ?? null;
  const url = customUrl ?? googleUrl;

  const source: AvatarSource = customUrl
    ? "custom"
    : googleUrl
      ? "google"
      : "none";

  const name =
    profile?.name ??
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    "";

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("") || "?";

  return { url, name, initials, source, googleUrl };
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAvatar.ts
git commit -m "feat(hooks): add useAvatar hook resolving custom/Google avatar with initials fallback"
```

---

## Task 6: Extend `profile.service.ts`

**Files:**
- Modify: `src/services/profile.service.ts`

- [ ] **Step 1: Add `NotificationPrefs` type and helpers**

At the top of `src/services/profile.service.ts`, add the type imports and helper:

```ts
import { supabase } from '../lib/supabase';
import type { Profile, Education, Experience, TemplatePrefs } from '../lib/supabase';

export interface NotificationPrefs {
  email: boolean;
  push: boolean;
  applicationUpdates: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  email: true,
  push: false,
  applicationUpdates: true,
};

export function parsePreferences(profile: Profile | null): NotificationPrefs {
  if (!profile?.preferences) return { ...DEFAULT_PREFS };
  try {
    const parsed = JSON.parse(profile.preferences) as Partial<NotificationPrefs>;
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}
```

- [ ] **Step 2: Add four new methods to the `profileService` object**

Inside `profileService`, append these methods (just before the closing `};`):

```ts
  async updatePhotoUrl(userId: string, photoUrl: string | null) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update photo url error:', error);
      return { data: null, error: error.message || 'Failed to update photo' };
    }
  },

  async updatePreferences(userId: string, prefs: NotificationPrefs) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          preferences: JSON.stringify(prefs),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update preferences error:', error);
      return { data: null, error: error.message || 'Failed to update preferences' };
    }
  },

  async updateAccentColor(userId: string, accentColor: string | null) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ accent_color: accentColor, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update accent color error:', error);
      return { data: null, error: error.message || 'Failed to update accent color' };
    }
  },

  async updateDefaultTemplate(userId: string, templateId: string) {
    try {
      const current = await supabase
        .from('profiles')
        .select('template_prefs')
        .eq('id', userId)
        .single();
      const existing = (current.data?.template_prefs as TemplatePrefs | null) ?? {};
      const next: TemplatePrefs = { ...existing, defaultTemplateId: templateId };
      const { data, error } = await supabase
        .from('profiles')
        .update({ template_prefs: next, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update default template error:', error);
      return { data: null, error: error.message || 'Failed to update default template' };
    }
  },
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/services/profile.service.ts
git commit -m "feat(profile): add photo/preferences/accent/default-template service methods + parsePreferences helper"
```

---

## Task 7: Replace navbar dropdown with Avatar link

**Files:**
- Modify: `src/components/dashboard/DashboardNavbar.tsx`

- [ ] **Step 1: Remove dropdown state and JSX**

Delete the `isProfileOpen` state line and the entire dropdown block (the `<div className="relative">` containing the profile button and the `<AnimatePresence>` dropdown, and the `User` icon trigger).

Also remove the `User` icon from `lucide-react` imports if no longer used elsewhere in the file (check — it is also used in mobile menu Profile link, which we are also removing below).

- [ ] **Step 2: Add Avatar import and useAvatar hook**

At the top of the file, add:

```tsx
import Avatar from "../ui/Avatar";
import { useAvatar } from "../../hooks/useAvatar";
```

In the component body, near the other hook calls:

```tsx
const { url: avatarUrl, name } = useAvatar();
```

- [ ] **Step 3: Replace dropdown trigger with Avatar that links to /profile**

Inside the desktop right section (where the dropdown was), insert:

```tsx
<Avatar
  url={avatarUrl}
  name={name}
  size="md"
  ring
  ariaLabel="Open profile"
  onClick={() => navigate("/profile")}
/>
```

- [ ] **Step 4: Drop standalone Profile link from mobile menu**

Inside the mobile menu, remove the `<Link to="/profile">` block (avatar in top bar covers it). Keep the Logout button.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/DashboardNavbar.tsx
git commit -m "refactor(navbar): replace profile dropdown with Avatar linking to /profile"
```

---

## Task 8: Avatars storage migration

**Files:**
- Create: `supabase/migrations/2026-05-07-avatars-bucket.sql`

- [ ] **Step 1: Verify the supabase/migrations dir exists or create it**

```bash
mkdir -p supabase/migrations
```

- [ ] **Step 2: Write the migration SQL**

Create `supabase/migrations/2026-05-07-avatars-bucket.sql`:

```sql
-- =====================================================================
-- Avatars storage bucket + RLS policies
-- Public read; owner-only write/update/delete.
-- =====================================================================

insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_write" on storage.objects;
create policy "avatars_owner_write"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

- [ ] **Step 3: Apply the migration in Supabase**

Run the SQL in the Supabase SQL Editor or via the CLI:

```bash
supabase db push
```

If using SQL Editor: paste the file contents and click Run.

Expected: bucket `avatars` is created (idempotent on re-run); 4 policies exist.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/2026-05-07-avatars-bucket.sql
git commit -m "feat(db): add avatars storage bucket with public-read + owner-only write policies"
```

---

## Task 9: Avatar upload service

**Files:**
- Create: `src/services/avatar.service.ts`

- [ ] **Step 1: Write the service**

Create `src/services/avatar.service.ts`:

```ts
import { supabase } from "../lib/supabase";
import { profileService } from "./profile.service";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const BUCKET = "avatars";

function extFromType(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export const avatarService = {
  /**
   * Upload an avatar image, set profile.photo_url to its public URL.
   * Throws on validation failure or storage error.
   */
  async upload(userId: string, file: File): Promise<string> {
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }
    if (file.size > MAX_BYTES) {
      throw new Error("Image must be under 2MB");
    }

    const ext = extFromType(file.type);
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });
    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    // Cache-bust so img tags re-fetch after re-upload
    const busted = `${publicUrl}?v=${Date.now()}`;

    const { error: profErr } = await profileService.updatePhotoUrl(userId, busted);
    if (profErr) throw new Error(profErr);

    return busted;
  },

  /**
   * Remove the user's custom avatar files and clear profile.photo_url.
   */
  async remove(userId: string): Promise<void> {
    const { data: list } = await supabase.storage
      .from(BUCKET)
      .list(userId, { limit: 100 });

    if (list && list.length > 0) {
      const paths = list.map((entry) => `${userId}/${entry.name}`);
      const { error: rmErr } = await supabase.storage
        .from(BUCKET)
        .remove(paths);
      if (rmErr) throw rmErr;
    }

    const { error: profErr } = await profileService.updatePhotoUrl(userId, null);
    if (profErr) throw new Error(profErr);
  },
};
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/services/avatar.service.ts
git commit -m "feat(services): add avatarService.upload/remove backed by Supabase Storage avatars bucket"
```

---

## Task 10: Extend `cv.service.ts` with `getLastTemplate`

**Files:**
- Modify: `src/services/cv.service.ts`

- [ ] **Step 1: Add `getLastTemplate` method**

Inside the `CVService` class, append this method just after `getCVHistory`:

```ts
  /**
   * Get the most recently used template id and file URL for a user.
   * Returns null when the user has no CV documents yet.
   */
  async getLastTemplate(
    userId: string
  ): Promise<{ templateId: CVTemplate; fileUrl: string | null; createdAt: string } | null> {
    try {
      const { data, error } = await supabase
        .from("cv_documents")
        .select("template_used, file_url, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data || !data.template_used) return null;

      return {
        templateId: data.template_used as CVTemplate,
        fileUrl: (data.file_url as string | null) ?? null,
        createdAt: data.created_at as string,
      };
    } catch (error) {
      console.error("Error fetching last template:", error);
      return null;
    }
  }
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/services/cv.service.ts
git commit -m "feat(cv): add cvService.getLastTemplate to source the dashboard last-used tile"
```

---

## Task 11: `useLastTemplate` hook

**Files:**
- Create: `src/hooks/useLastTemplate.ts`

- [ ] **Step 1: Write the hook**

Create `src/hooks/useLastTemplate.ts`:

```ts
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { cvService, type CVTemplate } from "../services/cv.service";

export interface LastTemplate {
  templateId: CVTemplate;
  fileUrl: string | null;
  createdAt: string;
}

export interface UseLastTemplateResult {
  data: LastTemplate | null;
  loading: boolean;
}

export function useLastTemplate(): UseLastTemplateResult {
  const { user } = useAuth();
  const [data, setData] = useState<LastTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    cvService.getLastTemplate(user.id).then((result) => {
      if (!active) return;
      setData(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  return { data, loading };
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useLastTemplate.ts
git commit -m "feat(hooks): add useLastTemplate to fetch most recent CV record"
```

---

## Task 12: Section 1 + 2 smoke check

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Manually verify**

- Sign in with Google → navbar shows your Google profile photo as avatar with gradient ring; clicking it routes to `/profile`.
- Visit `/applications` → should not match any route (rendered as DashboardLayout shell with empty content). Acceptable.
- Hover navbar — no "Applications" link, no Bell.
- Sign in with email/password (no Google avatar) → avatar shows initials with gradient background.

- [ ] **Step 3: Stop dev server (Ctrl+C)**

---

## Task 13: `WelcomeHeroTile`

**Files:**
- Create: `src/components/dashboard/tiles/WelcomeHeroTile.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

const WelcomeHeroTile = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const displayName = profile?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-md border backdrop-blur-md h-full"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
        borderColor: "var(--color-accent-light)",
      }}
    >
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-30 blur-3xl"
        style={{ backgroundImage: "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))" }}
      />
      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-xs font-semibold"
             style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-primary)" }}>
          <Sparkles className="w-3 h-3" />
          Welcome back
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight"
            style={{ color: "var(--color-text-main)" }}>
          Hello,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#780000] to-[#C1121F]">
            {displayName}
          </span>
        </h1>
        <p className="text-base mb-6" style={{ color: "var(--color-text-muted)" }}>
          Pick up where you left off — your last template is one click away.
        </p>
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/resume")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white shadow-lg"
          style={{
            backgroundImage: "linear-gradient(to right, var(--color-primary), var(--color-primary-hover))",
            boxShadow: "0 10px 25px -10px rgba(120, 0, 0, 0.45)",
          }}
        >
          Continue building <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default WelcomeHeroTile;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/tiles/WelcomeHeroTile.tsx
git commit -m "feat(dashboard): add WelcomeHeroTile bento element with continue-building CTA"
```

---

## Task 14: `AvatarStreakTile`

**Files:**
- Create: `src/components/dashboard/tiles/AvatarStreakTile.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { motion } from "framer-motion";
import Avatar from "../../ui/Avatar";
import { useAvatar } from "../../../hooks/useAvatar";
import { useAuth } from "../../../hooks/useAuth";

function computeCompletion(profile: any | null): number {
  if (!profile) return 0;
  const checks = [
    !!profile.name,
    !!profile.phone,
    !!profile.address,
    !!profile.bio,
    Array.isArray(profile.skills) && profile.skills.length > 0,
    Array.isArray(profile.education) && profile.education.length > 0,
    Array.isArray(profile.experience) && profile.experience.length > 0,
    !!profile.photo_url,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

const AvatarStreakTile = () => {
  const { url, name } = useAvatar();
  const { profile } = useAuth();
  const pct = computeCompletion(profile);
  const ringPct = Math.max(0, Math.min(100, pct));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-6 shadow-md border backdrop-blur-md h-full flex flex-col items-center justify-center text-center gap-3"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
        borderColor: "var(--color-accent-light)",
      }}
    >
      <div
        className="relative inline-flex items-center justify-center rounded-full"
        style={{
          width: 112,
          height: 112,
          background: `conic-gradient(var(--color-primary) ${ringPct}%, var(--color-accent-light) ${ringPct}% 100%)`,
        }}
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{ width: 96, height: 96, backgroundColor: "var(--color-surface)" }}
        >
          <Avatar url={url} name={name} size="xl" />
        </div>
      </div>
      <div>
        <p className="font-bold text-lg" style={{ color: "var(--color-text-main)" }}>
          Profile {pct}% complete
        </p>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {pct < 100 ? "Round it out for better resumes." : "You're all set!"}
        </p>
      </div>
    </motion.div>
  );
};

export default AvatarStreakTile;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/tiles/AvatarStreakTile.tsx
git commit -m "feat(dashboard): add AvatarStreakTile with profile completion ring"
```

---

## Task 15: `StatTile`

**Files:**
- Create: `src/components/dashboard/tiles/StatTile.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import AnimatedNumber from "../../ui/AnimatedNumber";

interface StatTileProps {
  label: string;
  value: number | string;
  suffix?: string;
  icon: LucideIcon;
  accent: string;
  bgAccent: string;
  delay?: number;
}

const StatTile = ({
  label,
  value,
  suffix = "",
  icon: Icon,
  accent,
  bgAccent,
  delay = 0,
}: StatTileProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="rounded-2xl p-5 shadow-md border backdrop-blur-md h-full flex flex-col justify-between"
    style={{
      backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
      borderColor: "var(--color-accent-light)",
    }}
  >
    <div
      className="inline-flex w-10 h-10 rounded-lg items-center justify-center mb-3"
      style={{ backgroundColor: bgAccent }}
    >
      <Icon className="w-5 h-5" style={{ color: accent }} />
    </div>
    <div>
      <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: "var(--color-text-main)" }}>
        <AnimatedNumber value={value} suffix={suffix} />
      </p>
      <p className="text-xs sm:text-sm" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
    </div>
  </motion.div>
);

export default StatTile;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/tiles/StatTile.tsx
git commit -m "feat(dashboard): extract StatTile bento element"
```

---

## Task 16: `LastTemplateTile`

**Files:**
- Create: `src/components/dashboard/tiles/LastTemplateTile.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Eye, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import { useAuth } from "../../../hooks/useAuth";
import { useLastTemplate } from "../../../hooks/useLastTemplate";
import {
  cvService,
  availableTemplates,
  type CVTemplate,
} from "../../../services/cv.service";
import { loadTemplateComponent } from "../../cv/templates";
import type { ComponentType } from "react";
import type { Profile } from "../../../lib/supabase";

const LastTemplateTile = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data, loading } = useLastTemplate();
  const [TemplateComp, setTemplateComp] = useState<ComponentType<{ profile: Profile }> | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!data?.templateId) {
      setTemplateComp(null);
      return;
    }
    let active = true;
    loadTemplateComponent(data.templateId).then((Comp) => {
      if (active) setTemplateComp(() => Comp ?? null);
    });
    return () => {
      active = false;
    };
  }, [data?.templateId]);

  const meta = data
    ? availableTemplates.find((t) => t.id === data.templateId)
    : undefined;

  const openInBuilder = () => {
    const id = data?.templateId;
    navigate(id ? `/resume?template=${id}` : "/resume");
  };

  const quickRedownload = async () => {
    if (!data || !profile) return;
    setIsDownloading(true);
    try {
      if (data.fileUrl) {
        const a = document.createElement("a");
        a.href = data.fileUrl;
        a.download = `${profile.name?.replace(/\s+/g, "_") ?? "resume"}_CV.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        await cvService.downloadCV(profile, data.templateId as CVTemplate);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-5 shadow-md border backdrop-blur-md h-full flex flex-col"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
        borderColor: "var(--color-accent-light)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>
            Last template used
          </p>
          <h3 className="text-lg font-bold" style={{ color: "var(--color-text-main)" }}>
            {data ? meta?.name ?? data.templateId : "No resume yet"}
          </h3>
        </div>
        <FileText className="w-5 h-5" style={{ color: "var(--color-text-muted)" }} />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          Loading…
        </div>
      ) : !data || !TemplateComp || !profile ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6 border border-dashed rounded-xl"
             style={{ borderColor: "var(--color-accent-light)" }}>
          <p className="text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
            Build your first resume to pick up here next time.
          </p>
          <button
            onClick={() => navigate("/resume")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ backgroundImage: "linear-gradient(to right, var(--color-primary), var(--color-primary-hover))" }}
          >
            <Plus className="w-4 h-4" /> Start a resume
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 rounded-xl overflow-hidden bg-gray-100 mb-3" style={{ minHeight: 220 }}>
            <PDFViewer width="100%" height="100%" showToolbar={false}>
              <TemplateComp profile={profile} />
            </PDFViewer>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openInBuilder}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
              style={{ backgroundImage: "linear-gradient(to right, var(--color-primary), var(--color-primary-hover))" }}
            >
              <Eye className="w-4 h-4" /> Open in builder
            </button>
            <button
              onClick={quickRedownload}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border disabled:opacity-50"
              style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "…" : "Re-download"}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default LastTemplateTile;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/tiles/LastTemplateTile.tsx
git commit -m "feat(dashboard): add LastTemplateTile with live PDF preview, open-in-builder, and quick re-download"
```

---

## Task 17: `RecentJobsTile`

**Files:**
- Create: `src/components/dashboard/tiles/RecentJobsTile.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { motion } from "framer-motion";
import { ArrowUpRight, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentJobsTile = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-5 shadow-md border backdrop-blur-md h-full flex flex-col"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
        borderColor: "var(--color-accent-light)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold" style={{ color: "var(--color-text-main)" }}>
          Matched jobs
        </h3>
        <button
          onClick={() => navigate("/jobs")}
          className="text-xs font-semibold inline-flex items-center gap-1"
          style={{ color: "var(--color-primary)" }}
        >
          Browse all <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6 border border-dashed rounded-xl"
           style={{ borderColor: "var(--color-accent-light)" }}>
        <Briefcase className="w-8 h-8" style={{ color: "var(--color-text-muted)" }} />
        <p className="text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
          Run the ML matcher on the Jobs page to see matches here.
        </p>
        <button
          onClick={() => navigate("/jobs")}
          className="text-sm font-semibold px-4 py-2 rounded-full"
          style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-primary)" }}
        >
          Open Jobs
        </button>
      </div>
    </motion.div>
  );
};

export default RecentJobsTile;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/tiles/RecentJobsTile.tsx
git commit -m "feat(dashboard): add RecentJobsTile placeholder linking to Jobs page"
```

---

## Task 18: Rewrite `Dashboard.tsx` as bento grid

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Replace file contents**

Overwrite `src/pages/Dashboard.tsx` with:

```tsx
import { useEffect, useState } from "react";
import { Briefcase, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { jobApplicationService } from "../services/jobApplication.service";
import WelcomeHeroTile from "../components/dashboard/tiles/WelcomeHeroTile";
import AvatarStreakTile from "../components/dashboard/tiles/AvatarStreakTile";
import LastTemplateTile from "../components/dashboard/tiles/LastTemplateTile";
import StatTile from "../components/dashboard/tiles/StatTile";
import RecentJobsTile from "../components/dashboard/tiles/RecentJobsTile";

interface AppStats {
  total: number;
  applied: number;
  pending: number;
  interview: number;
  rejected: number;
  accepted: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AppStats | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    jobApplicationService.getApplicationStats(user.id).then(({ data }) => {
      if (data) setStats(data);
    });
  }, [user?.id]);

  const responseRatePct =
    stats && stats.total > 0
      ? Math.round(((stats.interview + stats.accepted) / stats.total) * 100)
      : null;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 auto-rows-[minmax(180px,auto)] gap-4 lg:gap-6">
          <div className="md:col-span-4 lg:col-span-7 lg:row-span-1">
            <WelcomeHeroTile />
          </div>
          <div className="md:col-span-2 lg:col-span-5 lg:row-span-1">
            <AvatarStreakTile />
          </div>

          <div className="md:col-span-6 lg:col-span-7 lg:row-span-2">
            <LastTemplateTile />
          </div>

          <div className="md:col-span-3 lg:col-span-3">
            <StatTile
              label="Applications"
              value={stats?.total ?? "—"}
              icon={Briefcase}
              accent="#780000"
              bgAccent="rgba(120,0,0,0.10)"
              delay={0.05}
            />
          </div>
          <div className="md:col-span-3 lg:col-span-2">
            <StatTile
              label="Response %"
              value={responseRatePct ?? "—"}
              suffix={responseRatePct !== null ? "%" : ""}
              icon={TrendingUp}
              accent="#16a34a"
              bgAccent="rgba(22,163,74,0.10)"
              delay={0.1}
            />
          </div>
          <div className="md:col-span-3 lg:col-span-3">
            <StatTile
              label="Pending"
              value={stats?.pending ?? "—"}
              icon={Clock}
              accent="#669BBC"
              bgAccent="rgba(102,155,188,0.12)"
              delay={0.15}
            />
          </div>
          <div className="md:col-span-3 lg:col-span-2">
            <StatTile
              label="Interviews"
              value={stats?.interview ?? "—"}
              icon={CheckCircle}
              accent="#C1121F"
              bgAccent="rgba(193,18,31,0.10)"
              delay={0.2}
            />
          </div>

          <div className="md:col-span-6 lg:col-span-5 lg:row-span-1">
            <RecentJobsTile />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat(dashboard): rewrite as bento grid composed of tile components"
```

---

## Task 19: Wire `?template=` into CVGenerator

**Files:**
- Modify: `src/pages/CVGenerator.tsx`

- [ ] **Step 1: Read the query param on mount**

At the top of the file, add to the imports:

```tsx
import { useNavigate, useSearchParams } from "react-router-dom";
```

Replace the existing `useNavigate` import line if present.

In the component body (just after `const [activeCategory, setActiveCategory] = useState<TemplateCategory>("all");`), add:

```tsx
const [searchParams] = useSearchParams();

useEffect(() => {
  const param = searchParams.get("template");
  if (!param) return;
  const exists = availableTemplates.some((t) => t.id === param);
  if (exists) {
    setSelectedTemplate(param as CVTemplate);
  }
  // run once on mount with the initial param value
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

Add the `useEffect` import to the existing React import line:

```tsx
import React, { useState, useMemo, useEffect } from "react";
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/CVGenerator.tsx
git commit -m "feat(cv): preselect template via ?template= query param (used by dashboard tile)"
```

---

## Task 20: Section 3 smoke check

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Manually verify**

- `/dashboard` shows the bento layout: hero top-left, avatar+ring top-right, last-template tile spanning two rows, four stat tiles, recent-jobs tile.
- With no CVs ever generated: LastTemplateTile shows "Build your first resume" empty state.
- After generating a CV (use `/resume`), return to `/dashboard`: LastTemplateTile shows the generated CV's template name + live PDF preview.
- Click "Open in builder" → `/resume?template=<id>` opens with that template preselected.
- Click "Re-download" → file downloads.
- Mobile (375px): grid collapses to single column.

- [ ] **Step 3: Stop dev server**

---

## Task 21: Extract `EducationForm` and `ExperienceForm`

**Files:**
- Create: `src/components/profile/forms/EducationForm.tsx`
- Create: `src/components/profile/forms/ExperienceForm.tsx`

- [ ] **Step 1: Create `EducationForm.tsx`**

Open the current `src/pages/Profile.tsx`. Locate the `EducationForm` component (lines 963–1358 in the current file). Copy its full body into a new file `src/components/profile/forms/EducationForm.tsx`. Add at the top:

```tsx
import { useState } from "react";
import { motion } from "framer-motion";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import type { Education } from "../../../lib/supabase";

type EducationFormProps = {
  education?: Education;
  onSave: (data: Omit<Education, "id">) => void;
  onCancel: () => void;
};

export const EducationForm = ({ education, onSave, onCancel }: EducationFormProps) => {
  // … paste body verbatim from Profile.tsx EducationForm component …
};

export default EducationForm;
```

Convert `({ education, onSave, onCancel }: any)` to typed `EducationFormProps`. The `formData` already references `Omit<Education, "id">` types — keep that.

- [ ] **Step 2: Create `ExperienceForm.tsx`**

Same process — copy the `ExperienceForm` body (lines 1455–1565 in current Profile.tsx) into `src/components/profile/forms/ExperienceForm.tsx`:

```tsx
import { useState } from "react";
import { motion } from "framer-motion";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import type { Experience } from "../../../lib/supabase";

type ExperienceFormProps = {
  experience?: Experience;
  onSave: (data: Omit<Experience, "id">) => void;
  onCancel: () => void;
};

export const ExperienceForm = ({ experience, onSave, onCancel }: ExperienceFormProps) => {
  // … paste body verbatim …
};

export default ExperienceForm;
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds (these are unused so far — Profile.tsx still has its own copies).

- [ ] **Step 4: Commit**

```bash
git add src/components/profile/forms/
git commit -m "refactor(profile): extract EducationForm and ExperienceForm into typed components"
```

---

## Task 22: `BasicInfoSection`, `SkillsSection`, `HobbiesSection`, `EducationSection`, `ExperienceSection`

**Files:**
- Create: `src/components/profile/sections/BasicInfoSection.tsx`
- Create: `src/components/profile/sections/SkillsSection.tsx`
- Create: `src/components/profile/sections/HobbiesSection.tsx`
- Create: `src/components/profile/sections/EducationSection.tsx`
- Create: `src/components/profile/sections/ExperienceSection.tsx`

- [ ] **Step 1: Common card wrapper**

Each section uses this wrapper. Create as inline helper at the top of each section file (do not centralize — files stay self-contained):

```tsx
const cardClass =
  "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};
```

- [ ] **Step 2: `BasicInfoSection.tsx`**

```tsx
import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Save, Edit2, X } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

const cardClass =
  "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const BasicInfoSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setPhone(profile.phone ?? "");
    setAddress(profile.address ?? "");
    setBio(profile.bio ?? "");
  }, [profile]);

  const onSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await profileService.updateProfile(user.id, {
      name,
      phone,
      address,
      bio,
    });
    if (!error) {
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  return (
    <section id="basic" className={cardClass} style={cardStyle}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: "var(--color-text-main)" }}>
          Basic info
        </h2>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
              <X className="w-4 h-4" />
            </Button>
            <Button variant="primary" size="sm" onClick={onSave} isLoading={saving}>
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name" icon={<User className="w-4 h-4 inline mr-2" />}
               value={name} editing={editing} onChange={setName} placeholder="Your name" />
        <ReadField label="Email" icon={<Mail className="w-4 h-4 inline mr-2" />}
                   value={profile?.email ?? user?.email ?? ""} />
        <Field label="Phone" icon={<Phone className="w-4 h-4 inline mr-2" />}
               value={phone} editing={editing} onChange={setPhone} placeholder="Phone" />
        <Field label="Address" icon={<MapPin className="w-4 h-4 inline mr-2" />}
               value={address} editing={editing} onChange={setAddress} placeholder="City, Country" />
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>
            Bio
          </label>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="A short summary about you"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-accent-light)",
                color: "var(--color-text-body)",
              }}
            />
          ) : (
            <p className="whitespace-pre-wrap" style={{ color: "var(--color-text-muted)" }}>
              {bio || "Not set"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, icon, value, editing, onChange, placeholder }: {
  label: string;
  icon: React.ReactNode;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div>
    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>
      {icon}{label}
    </label>
    {editing ? (
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    ) : (
      <p className="break-words" style={{ color: "var(--color-text-muted)" }}>{value || "Not set"}</p>
    )}
  </div>
);

const ReadField = ({ label, icon, value }: { label: string; icon: React.ReactNode; value: string }) => (
  <div>
    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>
      {icon}{label}
    </label>
    <p className="break-all text-sm sm:text-base" style={{ color: "var(--color-text-muted)" }}>
      {value}
    </p>
  </div>
);

export default BasicInfoSection;
```

- [ ] **Step 3: `SkillsSection.tsx`**

Copy the inner JSX of the existing `SkillsSection` from `src/pages/Profile.tsx` (lines 548–681) into the new file. Replace the loose `({ skills, newSkill, ... }: any)` API with direct hook access:

```tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Sparkles } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  "Software & Engineering": ["JavaScript","TypeScript","React","Node.js","Python","SQL","Git","REST APIs","Docker","AWS"],
  "Data & AI": ["Pandas","NumPy","TensorFlow","PyTorch","scikit-learn","Power BI","Tableau","Excel","Statistics"],
  "Design & Product": ["Figma","UI Design","UX Research","Prototyping","Wireframing","Design Systems","Adobe XD"],
  "Business & Soft Skills": ["Communication","Teamwork","Leadership","Problem Solving","Time Management","Project Management","Critical Thinking","Adaptability"],
  Marketing: ["SEO","Content Writing","Social Media","Google Ads","Email Marketing","Copywriting"],
};

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const SkillsSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [newSkill, setNewSkill] = useState("");
  const [activeCat, setActiveCat] = useState(Object.keys(SKILL_SUGGESTIONS)[0]);

  const skills = profile?.skills ?? [];
  const userSkillSet = new Set(skills.map((s) => s.toLowerCase()));

  const persist = async (next: string[]) => {
    if (!user) return;
    await profileService.updateSkills(user.id, next);
    await refreshProfile();
  };

  const onAdd = () => {
    if (!newSkill.trim()) return;
    persist([...skills, newSkill.trim()]);
    setNewSkill("");
  };

  const onAddSuggested = (skill: string) => {
    if (userSkillSet.has(skill.toLowerCase())) return;
    persist([...skills, skill]);
  };

  const onRemove = (idx: number) => {
    persist(skills.filter((_, i) => i !== idx));
  };

  return (
    <section id="skills" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold mb-4" style={{ color: "var(--color-text-main)" }}>
        Skills
      </h2>
      <div className="flex gap-2 mb-4">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a skill"
          onKeyPress={(e) => e.key === "Enter" && onAdd()}
        />
        <Button onClick={onAdd} size="sm">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((s, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 bg-[#780000]/10 text-[#780000] dark:bg-[#780000]/20 dark:text-[#C1121F] rounded-full text-sm font-medium flex items-center gap-2"
          >
            {s}
            <button onClick={() => onRemove(i)}><X className="w-3 h-3" /></button>
          </motion.div>
        ))}
        {skills.length === 0 && (
          <p style={{ color: "var(--color-text-muted)" }}>No skills added yet</p>
        )}
      </div>

      <div className="rounded-xl p-4 border border-dashed" style={{ borderColor: "var(--color-accent-light)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-main)" }}>
            Common skills — tap to add
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.keys(SKILL_SUGGESTIONS).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor: activeCat === cat ? "var(--color-primary)" : "var(--color-accent-light)",
                color: activeCat === cat ? "white" : "var(--color-primary)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {SKILL_SUGGESTIONS[activeCat].map((s) => {
            const added = userSkillSet.has(s.toLowerCase());
            return (
              <button
                key={s}
                disabled={added}
                onClick={() => onAddSuggested(s)}
                className={`text-sm px-3 py-1 rounded-full flex items-center gap-1 ${added ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"}`}
                style={{
                  backgroundColor: added ? "var(--color-accent-light)" : "var(--color-surface)",
                  color: "var(--color-text-body)",
                  border: "1px solid var(--color-accent-light)",
                }}
              >
                {!added && <Plus className="w-3 h-3" />}
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
```

- [ ] **Step 4: `HobbiesSection.tsx`**

Identical pattern to SkillsSection but with `HOBBY_SUGGESTIONS` from current Profile.tsx (lines 77–98) and `profileService.updateHobbies`. Use `id="hobbies"`. Use the `hobbies` field from profile. Single flat list (no categories). Color: `bg-[#669BBC]/10 text-[#669BBC]`.

```tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Sparkles } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";

const HOBBY_SUGGESTIONS = ["Reading","Writing","Photography","Travel","Cooking","Hiking","Music","Gaming","Cycling","Painting","Yoga","Open Source","Volunteering","Chess","Football","Cricket","Running","Gardening","Blogging","Tech Meetups"];

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const HobbiesSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [newHobby, setNewHobby] = useState("");
  const hobbies = profile?.hobbies ?? [];
  const set = new Set(hobbies.map((h) => h.toLowerCase()));

  const persist = async (next: string[]) => {
    if (!user) return;
    await profileService.updateHobbies(user.id, next);
    await refreshProfile();
  };

  return (
    <section id="hobbies" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold mb-4" style={{ color: "var(--color-text-main)" }}>Hobbies</h2>

      <div className="flex gap-2 mb-4">
        <Input
          value={newHobby}
          onChange={(e) => setNewHobby(e.target.value)}
          placeholder="Add a hobby"
          onKeyPress={(e) => e.key === "Enter" && newHobby.trim() && (persist([...hobbies, newHobby.trim()]), setNewHobby(""))}
        />
        <Button size="sm" onClick={() => { if (newHobby.trim()) { persist([...hobbies, newHobby.trim()]); setNewHobby(""); } }}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {hobbies.map((h, i) => (
          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="px-3 py-1 bg-[#669BBC]/10 text-[#669BBC] dark:bg-[#669BBC]/20 rounded-full text-sm font-medium flex items-center gap-2">
            {h}
            <button onClick={() => persist(hobbies.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
          </motion.div>
        ))}
        {hobbies.length === 0 && (
          <p style={{ color: "var(--color-text-muted)" }}>No hobbies added yet</p>
        )}
      </div>

      <div className="rounded-xl p-4 border border-dashed" style={{ borderColor: "var(--color-accent-light)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-main)" }}>Common hobbies — tap to add</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {HOBBY_SUGGESTIONS.map((h) => {
            const added = set.has(h.toLowerCase());
            return (
              <button key={h} disabled={added} onClick={() => !added && persist([...hobbies, h])}
                className={`text-sm px-3 py-1 rounded-full flex items-center gap-1 ${added ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"}`}
                style={{
                  backgroundColor: added ? "var(--color-accent-light)" : "var(--color-surface)",
                  color: "var(--color-text-body)",
                  border: "1px solid var(--color-accent-light)",
                }}>
                {!added && <Plus className="w-3 h-3" />}
                {h}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HobbiesSection;
```

- [ ] **Step 5: `EducationSection.tsx`**

```tsx
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, Plus, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import { EducationForm } from "../forms/EducationForm";
import Button from "../../ui/Button";
import type { Education } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const EducationSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const list = profile?.education ?? [];

  const persist = async (next: Education[]) => {
    if (!user) return;
    await profileService.updateEducation(user.id, next);
    await refreshProfile();
  };

  const onAdd = (data: Omit<Education, "id">) => {
    persist([...list, { ...data, id: Date.now().toString() }]);
    setAdding(false);
  };
  const onUpdate = (id: string, data: Omit<Education, "id">) => {
    persist(list.map((e) => (e.id === id ? { ...data, id } : e)));
    setEditingId(null);
  };
  const onDelete = (id: string) => persist(list.filter((e) => e.id !== id));

  return (
    <section id="education" className={cardClass} style={cardStyle}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
          <GraduationCap className="w-5 h-5" /> Education
        </h2>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </div>

      <AnimatePresence>
        {adding && <EducationForm onSave={onAdd} onCancel={() => setAdding(false)} />}
      </AnimatePresence>

      <div className="space-y-3">
        {list.map((edu) => (
          <div key={edu.id}>
            {editingId === edu.id ? (
              <EducationForm
                education={edu}
                onSave={(data) => onUpdate(edu.id!, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <EducationCard education={edu} onEdit={() => setEditingId(edu.id!)} onDelete={() => onDelete(edu.id!)} />
            )}
          </div>
        ))}
        {list.length === 0 && !adding && (
          <p className="text-center py-6" style={{ color: "var(--color-text-muted)" }}>No education added yet</p>
        )}
      </div>
    </section>
  );
};

const EducationCard = ({ education, onEdit, onDelete }: { education: Education; onEdit: () => void; onDelete: () => void }) => {
  const yearRange = `${education.startYear} - ${education.endYear}`;
  let title = education.institutionName;
  let subtitle = education.level;
  let details = yearRange;
  if (education.level === "school") {
    subtitle = education.schoolType === "matric" ? "Matric" : "O-Levels";
    details = `${education.schoolMarks ?? ""} | ${yearRange}`;
  } else if (education.level === "college") {
    const map: Record<string, string> = { alevels: "A-Levels", premedical: "Pre-Medical", ics: "ICS", preengineering: "Pre-Engineering", other: "Other" };
    subtitle = map[education.collegeProgram ?? "other"] ?? education.collegeProgram ?? "";
    details = `${education.collegeMarks ?? ""} | ${yearRange}`;
  } else {
    const map: Record<string, string> = { bachelors: "Bachelor's", masters: "Master's", phd: "PhD", diploma: "Diploma", other: "Other" };
    subtitle = `${map[education.degreeType ?? "other"]} - ${education.degree ?? ""}`;
    details = `CGPA: ${education.cgpa ?? "—"} | ${yearRange}`;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg p-4"
      style={{ backgroundColor: "var(--color-accent-light)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className="px-2 py-1 text-xs font-medium bg-[#780000]/10 text-[#780000] dark:bg-[#C1121F]/20 dark:text-[#C1121F] rounded">
            {education.level.charAt(0).toUpperCase() + education.level.slice(1)}
          </span>
          <h3 className="font-bold mt-1" style={{ color: "var(--color-text-main)" }}>{title}</h3>
          <p className="text-[#780000] dark:text-[#C1121F] font-medium">{subtitle}</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{details}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-2 text-[#669BBC] hover:text-[#780000]"><Edit2 className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-2 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </motion.div>
  );
};

export default EducationSection;
```

- [ ] **Step 6: `ExperienceSection.tsx`**

Same shape as `EducationSection`, but uses `Experience`, `profileService.updateExperience`, and `ExperienceForm` from `../forms/ExperienceForm`. The card shows `company`, `position`, `startDate – endDate (or "Present" if current)`, and `description`.

```tsx
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Plus, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import { ExperienceForm } from "../forms/ExperienceForm";
import Button from "../../ui/Button";
import type { Experience } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const ExperienceSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const list = profile?.experience ?? [];

  const persist = async (next: Experience[]) => {
    if (!user) return;
    await profileService.updateExperience(user.id, next);
    await refreshProfile();
  };

  const onAdd = (data: Omit<Experience, "id">) => {
    persist([...list, { ...data, id: Date.now().toString() }]);
    setAdding(false);
  };
  const onUpdate = (id: string, data: Omit<Experience, "id">) => {
    persist(list.map((e) => (e.id === id ? { ...data, id } : e)));
    setEditingId(null);
  };
  const onDelete = (id: string) => persist(list.filter((e) => e.id !== id));

  return (
    <section id="experience" className={cardClass} style={cardStyle}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
          <Briefcase className="w-5 h-5" /> Experience
        </h2>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </div>

      <AnimatePresence>
        {adding && <ExperienceForm onSave={onAdd} onCancel={() => setAdding(false)} />}
      </AnimatePresence>

      <div className="space-y-3">
        {list.map((exp) => (
          <div key={exp.id}>
            {editingId === exp.id ? (
              <ExperienceForm experience={exp} onSave={(data) => onUpdate(exp.id!, data)} onCancel={() => setEditingId(null)} />
            ) : (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg p-4"
                style={{ backgroundColor: "var(--color-accent-light)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>{exp.company}</h3>
                    <p className="text-[#780000] dark:text-[#C1121F] font-medium">{exp.position}</p>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </p>
                    <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>{exp.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingId(exp.id!)} className="p-2 text-[#669BBC] hover:text-[#780000]">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(exp.id!)} className="p-2 text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}
        {list.length === 0 && !adding && (
          <p className="text-center py-6" style={{ color: "var(--color-text-muted)" }}>No experience added yet</p>
        )}
      </div>
    </section>
  );
};

export default ExperienceSection;
```

- [ ] **Step 7: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/components/profile/sections/
git commit -m "feat(profile): extract Basic/Skills/Hobbies/Education/Experience into self-contained sections"
```

---

## Task 23: New schema sections — `LinksSection`, `ProjectsSection`, `CertificationsSection`

**Files:**
- Create: `src/components/profile/sections/LinksSection.tsx`
- Create: `src/components/profile/sections/ProjectsSection.tsx`
- Create: `src/components/profile/sections/CertificationsSection.tsx`

- [ ] **Step 1: `LinksSection.tsx`**

```tsx
import { useState } from "react";
import { Plus, Trash2, ExternalLink, Link as LinkIcon } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import type { Link as LinkRow } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const LinksSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const links = profile?.links ?? [];
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const persist = async (next: LinkRow[]) => {
    if (!user) return;
    await profileService.updateProfile(user.id, { links: next } as any);
    await refreshProfile();
  };

  const add = () => {
    if (!label.trim() || !url.trim()) return;
    persist([...links, { label: label.trim(), url: url.trim() }]);
    setLabel("");
    setUrl("");
  };

  return (
    <section id="links" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "var(--color-text-main)" }}>
        <LinkIcon className="w-5 h-5" /> Links
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 mb-4">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="GitHub" />
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://github.com/you" />
        <Button size="sm" onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
      <div className="space-y-2">
        {links.map((l, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg"
               style={{ backgroundColor: "var(--color-accent-light)" }}>
            <div className="flex items-center gap-2 min-w-0">
              <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
              <a href={l.url} target="_blank" rel="noreferrer" className="font-medium truncate"
                 style={{ color: "var(--color-text-main)" }}>{l.label}</a>
              <span className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{l.url}</span>
            </div>
            <button onClick={() => persist(links.filter((_, j) => j !== i))} className="p-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {links.length === 0 && (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No links yet</p>
        )}
      </div>
    </section>
  );
};

export default LinksSection;
```

- [ ] **Step 2: `ProjectsSection.tsx`**

Schema: `Project { id; name; role?; description?; link?; tech?: string[]; startDate?; endDate? }`. Persist via `updateProfile(userId, { projects: next } as any)`.

```tsx
import { useState } from "react";
import { Plus, Trash2, FolderGit2 } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import type { Project } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const ProjectsSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const projects = profile?.projects ?? [];
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<Project, "id">>({ name: "", role: "", description: "", link: "", tech: [] });
  const [techInput, setTechInput] = useState("");

  const persist = async (next: Project[]) => {
    if (!user) return;
    await profileService.updateProfile(user.id, { projects: next } as any);
    await refreshProfile();
  };

  const add = () => {
    if (!draft.name.trim()) return;
    persist([...projects, { ...draft, id: Date.now().toString() }]);
    setDraft({ name: "", role: "", description: "", link: "", tech: [] });
    setAdding(false);
  };

  return (
    <section id="projects" className={cardClass} style={cardStyle}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
          <FolderGit2 className="w-5 h-5" /> Projects
        </h2>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-2" /> Add</Button>
      </div>

      {adding && (
        <div className="rounded-lg p-4 mb-3 grid gap-2" style={{ backgroundColor: "var(--color-accent-light)" }}>
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Project name" />
          <Input value={draft.role ?? ""} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Your role" />
          <Input value={draft.link ?? ""} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="https://…" />
          <textarea value={draft.description ?? ""}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="What it does, what you built"
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-accent-light)", color: "var(--color-text-body)" }} />
          <div className="flex gap-2">
            <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="Tech (Enter)"
                   onKeyPress={(e) => {
                     if (e.key === "Enter" && techInput.trim()) {
                       setDraft({ ...draft, tech: [...(draft.tech ?? []), techInput.trim()] });
                       setTechInput("");
                     }
                   }} />
          </div>
          <div className="flex flex-wrap gap-1">
            {(draft.tech ?? []).map((t, i) => (
              <span key={i} className="px-2 py-0.5 text-xs rounded-full"
                    style={{ backgroundColor: "var(--color-surface)", color: "var(--color-primary)" }}>{t}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={add}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="rounded-lg p-4 flex items-start justify-between gap-3"
               style={{ backgroundColor: "var(--color-accent-light)" }}>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>{p.name}</h3>
              {p.role && <p className="text-[#780000] dark:text-[#C1121F] font-medium text-sm">{p.role}</p>}
              {p.description && <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>{p.description}</p>}
              {p.tech && p.tech.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.tech.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs rounded-full"
                          style={{ backgroundColor: "var(--color-surface)", color: "var(--color-primary)" }}>{t}</span>
                  ))}
                </div>
              )}
              {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-xs underline mt-1 inline-block"
                            style={{ color: "var(--color-primary)" }}>{p.link}</a>}
            </div>
            <button onClick={() => persist(projects.filter((q) => q.id !== p.id))} className="p-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {projects.length === 0 && !adding && (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No projects yet</p>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
```

- [ ] **Step 3: `CertificationsSection.tsx`**

Schema: `Certification { id; name; issuer; date?; url?; credentialId? }`.

```tsx
import { useState } from "react";
import { Plus, Trash2, Award as AwardIcon } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import type { Certification } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const CertificationsSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const certs = profile?.certifications ?? [];
  const [draft, setDraft] = useState<Omit<Certification, "id">>({ name: "", issuer: "", date: "", url: "", credentialId: "" });

  const persist = async (next: Certification[]) => {
    if (!user) return;
    await profileService.updateProfile(user.id, { certifications: next } as any);
    await refreshProfile();
  };

  const add = () => {
    if (!draft.name.trim() || !draft.issuer.trim()) return;
    persist([...certs, { ...draft, id: Date.now().toString() }]);
    setDraft({ name: "", issuer: "", date: "", url: "", credentialId: "" });
  };

  return (
    <section id="certifications" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "var(--color-text-main)" }}>
        <AwardIcon className="w-5 h-5" /> Certifications
      </h2>

      <div className="grid gap-2 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Certificate name" />
          <Input value={draft.issuer} onChange={(e) => setDraft({ ...draft, issuer: e.target.value })} placeholder="Issuer" />
          <Input value={draft.date ?? ""} onChange={(e) => setDraft({ ...draft, date: e.target.value })} placeholder="2024-05" />
          <Input value={draft.url ?? ""} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="Credential URL" />
        </div>
        <Button size="sm" onClick={add}><Plus className="w-4 h-4 mr-2" /> Add certificate</Button>
      </div>

      <div className="space-y-2">
        {certs.map((c) => (
          <div key={c.id} className="rounded-lg p-3 flex items-start justify-between gap-3"
               style={{ backgroundColor: "var(--color-accent-light)" }}>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>{c.name}</h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {c.issuer}{c.date ? ` · ${c.date}` : ""}
              </p>
              {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-xs underline"
                          style={{ color: "var(--color-primary)" }}>Verify</a>}
            </div>
            <button onClick={() => persist(certs.filter((q) => q.id !== c.id))} className="p-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {certs.length === 0 && (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No certifications yet</p>
        )}
      </div>
    </section>
  );
};

export default CertificationsSection;
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/profile/sections/LinksSection.tsx src/components/profile/sections/ProjectsSection.tsx src/components/profile/sections/CertificationsSection.tsx
git commit -m "feat(profile): add Links, Projects, Certifications section UIs"
```

---

## Task 24: New schema sections — `LanguagesSection`, `AwardsSection`, `VolunteerSection`, `ReferencesSection`

**Files:**
- Create: `src/components/profile/sections/LanguagesSection.tsx`
- Create: `src/components/profile/sections/AwardsSection.tsx`
- Create: `src/components/profile/sections/VolunteerSection.tsx`
- Create: `src/components/profile/sections/ReferencesSection.tsx`

- [ ] **Step 1: `LanguagesSection.tsx`**

```tsx
import { useState } from "react";
import { Plus, Trash2, Languages as LangIcon } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import type { Language, LanguageProficiency } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const PROFICIENCY: LanguageProficiency[] = ["native", "fluent", "professional", "intermediate", "basic"];

const LanguagesSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const list = profile?.languages ?? [];
  const [name, setName] = useState("");
  const [prof, setProf] = useState<LanguageProficiency>("intermediate");

  const persist = async (next: Language[]) => {
    if (!user) return;
    await profileService.updateProfile(user.id, { languages: next } as any);
    await refreshProfile();
  };

  const add = () => {
    if (!name.trim()) return;
    persist([...list, { name: name.trim(), proficiency: prof }]);
    setName("");
    setProf("intermediate");
  };

  return (
    <section id="languages" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "var(--color-text-main)" }}>
        <LangIcon className="w-5 h-5" /> Languages
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 mb-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Language" />
        <select value={prof} onChange={(e) => setProf(e.target.value as LanguageProficiency)}
                className="px-4 py-2 border rounded-lg"
                style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-accent-light)", color: "var(--color-text-body)" }}>
          {PROFICIENCY.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <Button size="sm" onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((l, i) => (
          <span key={i} className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-text-main)" }}>
            <strong>{l.name}</strong>
            <span style={{ color: "var(--color-primary)" }}>{l.proficiency}</span>
            <button onClick={() => persist(list.filter((_, j) => j !== i))}><Trash2 className="w-3 h-3" /></button>
          </span>
        ))}
        {list.length === 0 && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No languages yet</p>}
      </div>
    </section>
  );
};

export default LanguagesSection;
```

- [ ] **Step 2: `AwardsSection.tsx`**

Schema: `Award { id; title; issuer?; year?; description? }`.

```tsx
import { useState } from "react";
import { Plus, Trash2, Trophy } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import type { Award } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const AwardsSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const list = profile?.awards ?? [];
  const [draft, setDraft] = useState<Omit<Award, "id">>({ title: "", issuer: "", year: "", description: "" });

  const persist = async (next: Award[]) => {
    if (!user) return;
    await profileService.updateProfile(user.id, { awards: next } as any);
    await refreshProfile();
  };

  const add = () => {
    if (!draft.title.trim()) return;
    persist([...list, { ...draft, id: Date.now().toString() }]);
    setDraft({ title: "", issuer: "", year: "", description: "" });
  };

  return (
    <section id="awards" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "var(--color-text-main)" }}>
        <Trophy className="w-5 h-5" /> Awards
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Award name" />
        <Input value={draft.issuer ?? ""} onChange={(e) => setDraft({ ...draft, issuer: e.target.value })} placeholder="Issuer" />
        <Input value={draft.year ?? ""} onChange={(e) => setDraft({ ...draft, year: e.target.value })} placeholder="Year" />
        <Input value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Description" />
      </div>
      <Button size="sm" onClick={add} className="mb-3"><Plus className="w-4 h-4 mr-2" /> Add</Button>

      <div className="space-y-2">
        {list.map((a) => (
          <div key={a.id} className="rounded-lg p-3 flex items-start justify-between gap-3"
               style={{ backgroundColor: "var(--color-accent-light)" }}>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>{a.title}</h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {a.issuer ? `${a.issuer}` : ""}{a.year ? ` · ${a.year}` : ""}
              </p>
              {a.description && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{a.description}</p>}
            </div>
            <button onClick={() => persist(list.filter((q) => q.id !== a.id))} className="p-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No awards yet</p>}
      </div>
    </section>
  );
};

export default AwardsSection;
```

- [ ] **Step 3: `VolunteerSection.tsx`**

Schema: `Volunteer { id; organization; role; startDate?; endDate?; description? }`.

```tsx
import { useState } from "react";
import { Plus, Trash2, HeartHandshake } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import type { Volunteer } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const VolunteerSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const list = profile?.volunteer ?? [];
  const [draft, setDraft] = useState<Omit<Volunteer, "id">>({ organization: "", role: "", startDate: "", endDate: "", description: "" });

  const persist = async (next: Volunteer[]) => {
    if (!user) return;
    await profileService.updateProfile(user.id, { volunteer: next } as any);
    await refreshProfile();
  };

  const add = () => {
    if (!draft.organization.trim() || !draft.role.trim()) return;
    persist([...list, { ...draft, id: Date.now().toString() }]);
    setDraft({ organization: "", role: "", startDate: "", endDate: "", description: "" });
  };

  return (
    <section id="volunteer" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "var(--color-text-main)" }}>
        <HeartHandshake className="w-5 h-5" /> Volunteer
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <Input value={draft.organization} onChange={(e) => setDraft({ ...draft, organization: e.target.value })} placeholder="Organization" />
        <Input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Role" />
        <Input value={draft.startDate ?? ""} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} placeholder="Start (YYYY-MM)" />
        <Input value={draft.endDate ?? ""} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} placeholder="End (YYYY-MM or Present)" />
        <Input value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Description" className="md:col-span-2" />
      </div>
      <Button size="sm" onClick={add} className="mb-3"><Plus className="w-4 h-4 mr-2" /> Add</Button>

      <div className="space-y-2">
        {list.map((v) => (
          <div key={v.id} className="rounded-lg p-3 flex items-start justify-between gap-3"
               style={{ backgroundColor: "var(--color-accent-light)" }}>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>{v.organization}</h3>
              <p className="text-[#780000] dark:text-[#C1121F] font-medium text-sm">{v.role}</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {v.startDate}{v.endDate ? ` – ${v.endDate}` : ""}
              </p>
              {v.description && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{v.description}</p>}
            </div>
            <button onClick={() => persist(list.filter((q) => q.id !== v.id))} className="p-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No volunteer entries yet</p>}
      </div>
    </section>
  );
};

export default VolunteerSection;
```

- [ ] **Step 4: `ReferencesSection.tsx`**

Schema: `ReferenceEntry { id; name; contact?; relation? }`. Persist via `references_list` field on profile.

```tsx
import { useState } from "react";
import { Plus, Trash2, UserCheck } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { profileService } from "../../../services/profile.service";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import type { ReferenceEntry } from "../../../lib/supabase";

const cardClass = "rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md scroll-mt-24";
const cardStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
  borderColor: "var(--color-accent-light)",
};

const ReferencesSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const list = profile?.references_list ?? [];
  const [draft, setDraft] = useState<Omit<ReferenceEntry, "id">>({ name: "", contact: "", relation: "" });

  const persist = async (next: ReferenceEntry[]) => {
    if (!user) return;
    await profileService.updateProfile(user.id, { references_list: next } as any);
    await refreshProfile();
  };

  const add = () => {
    if (!draft.name.trim()) return;
    persist([...list, { ...draft, id: Date.now().toString() }]);
    setDraft({ name: "", contact: "", relation: "" });
  };

  return (
    <section id="references" className={cardClass} style={cardStyle}>
      <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: "var(--color-text-main)" }}>
        <UserCheck className="w-5 h-5" /> References
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Full name" />
        <Input value={draft.contact ?? ""} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} placeholder="Email or phone" />
        <Input value={draft.relation ?? ""} onChange={(e) => setDraft({ ...draft, relation: e.target.value })} placeholder="Relation" />
      </div>
      <Button size="sm" onClick={add} className="mb-3"><Plus className="w-4 h-4 mr-2" /> Add</Button>

      <div className="space-y-2">
        {list.map((r) => (
          <div key={r.id} className="rounded-lg p-3 flex items-start justify-between gap-3"
               style={{ backgroundColor: "var(--color-accent-light)" }}>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>{r.name}</h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {r.relation ?? ""}{r.contact ? ` · ${r.contact}` : ""}
              </p>
            </div>
            <button onClick={() => persist(list.filter((q) => q.id !== r.id))} className="p-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No references yet</p>}
      </div>
    </section>
  );
};

export default ReferencesSection;
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/sections/LanguagesSection.tsx src/components/profile/sections/AwardsSection.tsx src/components/profile/sections/VolunteerSection.tsx src/components/profile/sections/ReferencesSection.tsx
git commit -m "feat(profile): add Languages, Awards, Volunteer, References sections"
```

---

## Task 25: `ProfileSidebarNav`

**Files:**
- Create: `src/components/profile/ProfileSidebarNav.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User, Wrench, Smile, GraduationCap, Briefcase, FolderGit2,
  Award, Languages, Trophy, HeartHandshake, UserCheck, Link as LinkIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: typeof User;
}

export const PROFILE_NAV: NavItem[] = [
  { id: "basic", label: "Basic", icon: User },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "hobbies", label: "Hobbies", icon: Smile },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "languages", label: "Languages", icon: Languages },
  { id: "awards", label: "Awards", icon: Trophy },
  { id: "volunteer", label: "Volunteer", icon: HeartHandshake },
  { id: "references", label: "References", icon: UserCheck },
  { id: "links", label: "Links", icon: LinkIcon },
];

const ProfileSidebarNav = () => {
  const [active, setActive] = useState<string>("basic");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    PROFILE_NAV.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="hidden lg:block sticky top-24 self-start">
      <ul className="space-y-1">
        {PROFILE_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  color: isActive ? "var(--color-primary)" : "var(--color-text-main)",
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="profile-nav-indicator"
                    className="absolute inset-0 rounded-lg"
                    style={{ backgroundColor: "var(--color-accent-light)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default ProfileSidebarNav;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/profile/ProfileSidebarNav.tsx
git commit -m "feat(profile): add sticky sidebar nav with intersection-observer active section tracking"
```

---

## Task 26: `ProfileLivePreview`

**Files:**
- Create: `src/components/profile/ProfileLivePreview.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { Component, useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { Eye, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { loadTemplateComponent } from "../cv/templates";
import type { Profile, TemplatePrefs } from "../../lib/supabase";
import type { CVTemplate } from "../../services/cv.service";

class PreviewErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center text-center text-sm p-4"
             style={{ color: "var(--color-text-muted)" }}>
          Preview unavailable — your data is saved.
        </div>
      );
    }
    return this.props.children;
  }
}

function useDebounced<T>(value: T, delayMs = 400): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return v;
}

const ProfileLivePreview = () => {
  const { profile } = useAuth();
  const debouncedProfile = useDebounced(profile, 400);
  const [TemplateComp, setTemplateComp] = useState<ComponentType<{ profile: Profile }> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const templateId =
    ((profile?.template_prefs as TemplatePrefs | undefined)?.defaultTemplateId as CVTemplate | undefined) ??
    "modern";

  useEffect(() => {
    let active = true;
    loadTemplateComponent(templateId).then((Comp) => {
      if (active) setTemplateComp(() => Comp ?? null);
    });
    return () => { active = false; };
  }, [templateId]);

  if (!debouncedProfile || !TemplateComp) {
    return (
      <div className="hidden lg:block sticky top-24 self-start rounded-2xl border h-[calc(100vh-7rem)]"
           style={{ borderColor: "var(--color-accent-light)" }} />
    );
  }

  const previewBox = (
    <PreviewErrorBoundary>
      <PDFViewer width="100%" height="100%" showToolbar={false}>
        <TemplateComp profile={debouncedProfile} />
      </PDFViewer>
    </PreviewErrorBoundary>
  );

  return (
    <>
      <aside className="hidden lg:block sticky top-24 self-start w-full rounded-2xl border overflow-hidden h-[calc(100vh-7rem)]"
             style={{ borderColor: "var(--color-accent-light)", backgroundColor: "var(--color-surface)" }}>
        <div className="px-3 py-2 text-xs font-semibold flex items-center gap-2 border-b"
             style={{ borderColor: "var(--color-accent-light)", color: "var(--color-primary)" }}>
          <Eye className="w-3.5 h-3.5" /> Live preview · {templateId}
        </div>
        <div className="w-full h-full">{previewBox}</div>
      </aside>

      <button
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 px-4 py-3 rounded-full shadow-lg text-white font-semibold inline-flex items-center gap-2"
        style={{ backgroundImage: "linear-gradient(to right, var(--color-primary), var(--color-primary-hover))" }}
      >
        <Eye className="w-4 h-4" /> Preview
      </button>
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 flex items-stretch">
          <div className="w-full h-full bg-white relative">
            <button onClick={() => setDrawerOpen(false)} className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/60 text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="w-full h-full">{previewBox}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileLivePreview;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/profile/ProfileLivePreview.tsx
git commit -m "feat(profile): add ProfileLivePreview with debounced PDF render and mobile drawer"
```

---

## Task 27: Rewrite `Profile.tsx`

**Files:**
- Modify: `src/pages/Profile.tsx`

- [ ] **Step 1: Replace file contents**

Overwrite `src/pages/Profile.tsx` with:

```tsx
import { motion } from "framer-motion";
import ProfileSidebarNav from "../components/profile/ProfileSidebarNav";
import ProfileLivePreview from "../components/profile/ProfileLivePreview";
import BasicInfoSection from "../components/profile/sections/BasicInfoSection";
import SkillsSection from "../components/profile/sections/SkillsSection";
import HobbiesSection from "../components/profile/sections/HobbiesSection";
import EducationSection from "../components/profile/sections/EducationSection";
import ExperienceSection from "../components/profile/sections/ExperienceSection";
import ProjectsSection from "../components/profile/sections/ProjectsSection";
import CertificationsSection from "../components/profile/sections/CertificationsSection";
import LanguagesSection from "../components/profile/sections/LanguagesSection";
import AwardsSection from "../components/profile/sections/AwardsSection";
import VolunteerSection from "../components/profile/sections/VolunteerSection";
import ReferencesSection from "../components/profile/sections/ReferencesSection";
import LinksSection from "../components/profile/sections/LinksSection";

const Profile = () => {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6"
          style={{ color: "var(--color-text-main)" }}
        >
          My{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#780000] to-[#C1121F]">
            Profile
          </span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)_minmax(0,440px)] gap-6">
          <ProfileSidebarNav />

          <main className="space-y-6">
            <BasicInfoSection />
            <SkillsSection />
            <HobbiesSection />
            <EducationSection />
            <ExperienceSection />
            <ProjectsSection />
            <CertificationsSection />
            <LanguagesSection />
            <AwardsSection />
            <VolunteerSection />
            <ReferencesSection />
            <LinksSection />
          </main>

          <ProfileLivePreview />
        </div>
      </div>
    </div>
  );
};

export default Profile;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Profile.tsx
git commit -m "feat(profile): rewrite Profile page as two-pane sticky-preview editor with extracted sections"
```

---

## Task 28: Section 4 smoke check

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Manually verify**

- `/profile` renders with sticky left sidebar nav, scrollable middle column of all 12 sections, sticky right pane with live PDF preview.
- Edit Basic Info name → click Save → preview updates within ~600ms.
- Add a project → preview updates.
- Click sidebar links → page scrolls to section, active indicator follows.
- Mobile (375px): sidebar and right pane hidden; sections stack; floating "Preview" button opens fullscreen drawer with PDF.
- All section CRUD persists across reload.

- [ ] **Step 3: Stop dev server**

---

## Task 29: `Tabs` primitive

**Files:**
- Create: `src/components/ui/Tabs.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
}

const Tabs = ({ items, value, onChange }: TabsProps) => (
  <div
    className="flex gap-1 p-1 rounded-full overflow-x-auto"
    style={{ backgroundColor: "var(--color-accent-light)" }}
    role="tablist"
  >
    {items.map((item) => {
      const isActive = item.id === value;
      const Icon = item.icon;
      return (
        <button
          key={item.id}
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(item.id)}
          className="relative px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap inline-flex items-center gap-2"
          style={{ color: isActive ? "white" : "var(--color-text-main)" }}
        >
          {isActive && (
            <motion.span
              layoutId="tabs-indicator"
              className="absolute inset-0 rounded-full"
              style={{ backgroundImage: "linear-gradient(to right, var(--color-primary), var(--color-primary-hover))" }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 inline-flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            {item.label}
          </span>
        </button>
      );
    })}
  </div>
);

export default Tabs;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Tabs.tsx
git commit -m "feat(ui): add Tabs primitive with sliding active indicator"
```

---

## Task 30: `AvatarUploader`

**Files:**
- Create: `src/components/settings/AvatarUploader.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { useRef, useState } from "react";
import { Upload, RefreshCcw, Trash2 } from "lucide-react";
import Avatar from "../ui/Avatar";
import Toast from "../ui/Toast";
import Button from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { useAvatar } from "../../hooks/useAvatar";
import { avatarService } from "../../services/avatar.service";
import { profileService } from "../../services/profile.service";

const AvatarUploader = () => {
  const { user, refreshProfile } = useAuth();
  const { url, name, source, googleUrl } = useAvatar();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const onPick = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setBusy(true);
    try {
      await avatarService.upload(user.id, file);
      await refreshProfile();
      setToast({ message: "Avatar updated", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.message ?? "Upload failed", type: "error" });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onUseGoogle = async () => {
    if (!user || !googleUrl) return;
    setBusy(true);
    try {
      const { error } = await profileService.updatePhotoUrl(user.id, null);
      if (error) throw new Error(error);
      await avatarService.remove(user.id).catch(() => {});
      await refreshProfile();
      setToast({ message: "Using your Google photo", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.message ?? "Failed to switch", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await avatarService.remove(user.id);
      await refreshProfile();
      setToast({ message: "Avatar removed", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.message ?? "Remove failed", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <Avatar url={url} name={name} size="xl" ring />
      <div className="flex flex-wrap gap-2">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        <Button size="sm" variant="primary" onClick={onPick} isLoading={busy}>
          <Upload className="w-4 h-4 mr-2" /> Upload new
        </Button>
        {googleUrl && source === "custom" && (
          <Button size="sm" variant="outline" onClick={onUseGoogle}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Use Google photo
          </Button>
        )}
        {source === "custom" && (
          <Button size="sm" variant="outline" onClick={onRemove}>
            <Trash2 className="w-4 h-4 mr-2" /> Remove
          </Button>
        )}
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} isVisible={!!toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default AvatarUploader;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/AvatarUploader.tsx
git commit -m "feat(settings): add AvatarUploader with upload/use-Google/remove flows"
```

---

## Task 31: `AccountTab`

**Files:**
- Create: `src/components/settings/AccountTab.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { useEffect, useState } from "react";
import { Copy, LogOut, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../services/profile.service";
import Input from "../ui/Input";
import Button from "../ui/Button";
import AvatarUploader from "./AvatarUploader";
import Toast from "../ui/Toast";

const AccountTab = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setPhone(profile.phone ?? "");
    setAddress(profile.address ?? "");
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await profileService.updateProfile(user.id, { name, phone, address });
    setSaving(false);
    if (error) {
      setToast({ message: error, type: "error" });
    } else {
      await refreshProfile();
      setToast({ message: "Saved", type: "success" });
    }
  };

  const copyEmail = () => {
    if (!user?.email) return;
    navigator.clipboard.writeText(user.email);
    setToast({ message: "Email copied", type: "success" });
  };

  const onSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-6">
      <AvatarUploader />

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>
          Email
        </label>
        <div className="flex items-center gap-2">
          <p className="break-all flex-1" style={{ color: "var(--color-text-muted)" }}>
            {user?.email}
          </p>
          <button onClick={copyEmail} className="p-2 rounded-lg" style={{ color: "var(--color-primary)" }}>
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="md:col-span-2" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={save} isLoading={saving}>
          <Save className="w-4 h-4 mr-2" /> Save changes
        </Button>
        <Button variant="outline" onClick={onSignOut}>
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} isVisible={!!toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default AccountTab;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/AccountTab.tsx
git commit -m "feat(settings): add AccountTab with avatar uploader, name/phone/address, sign-out"
```

---

## Task 32: `SecurityTab`

**Files:**
- Create: `src/components/settings/SecurityTab.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Save } from "lucide-react";
import { authService } from "../../services/auth.service";
import Button from "../ui/Button";
import Input from "../ui/Input";

const SecurityTab = () => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (next.length < 8) return setError("Password must be at least 8 characters");
    if (next !== confirm) return setError("Passwords do not match");

    setBusy(true);
    const { error: err } = await authService.updatePassword(next);
    setBusy(false);

    if (err) {
      setError(err.message || "Failed to update password");
    } else {
      setSuccess("Password updated");
      setCurrent(""); setNext(""); setConfirm("");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>
          <Lock className="w-4 h-4 inline mr-2" /> Current password
        </label>
        <div className="relative">
          <Input type={showCurrent ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} required />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
            {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>New password</label>
        <div className="relative">
          <Input
            type={showNext ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            helperText="At least 8 characters; mix letters, numbers, and symbols for strength."
          />
          <button type="button" onClick={() => setShowNext(!showNext)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
            {showNext ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>Confirm new password</label>
        <div className="relative">
          <Input type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400">
          {success}
        </motion.div>
      )}

      <Button type="submit" variant="primary" isLoading={busy}>
        <Save className="w-4 h-4 mr-2" /> Update password
      </Button>
    </form>
  );
};

export default SecurityTab;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/SecurityTab.tsx
git commit -m "feat(settings): add SecurityTab (password change, no dead requirements list)"
```

---

## Task 33: `AccentColorPicker`

**Files:**
- Create: `src/components/settings/AccentColorPicker.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../services/profile.service";

const PRESETS = ["#780000", "#0f766e", "#1e40af", "#7c3aed", "#b45309", "#0f172a"];

const AccentColorPicker = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    setValue(profile?.accent_color ?? "");
  }, [profile?.accent_color]);

  const apply = async (hex: string | null) => {
    if (!user) return;
    setValue(hex ?? "");
    if (hex) {
      document.documentElement.style.setProperty("--color-primary", hex);
      document.documentElement.style.setProperty(
        "--color-primary-hover",
        `color-mix(in srgb, ${hex} 85%, white 15%)`
      );
    } else {
      document.documentElement.style.removeProperty("--color-primary");
      document.documentElement.style.removeProperty("--color-primary-hover");
    }
    await profileService.updateAccentColor(user.id, hex);
    await refreshProfile();
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium" style={{ color: "var(--color-text-main)" }}>
        Accent color
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((hex) => (
          <button
            key={hex}
            onClick={() => apply(hex)}
            className="w-9 h-9 rounded-full border-2 flex items-center justify-center"
            style={{
              backgroundColor: hex,
              borderColor: value === hex ? "white" : "transparent",
              boxShadow: value === hex ? "0 0 0 2px var(--color-primary)" : undefined,
            }}
            aria-label={`Set accent color ${hex}`}
          >
            {value === hex && <Check className="w-4 h-4 text-white" />}
          </button>
        ))}
        <input
          type="color"
          value={value || "#780000"}
          onChange={(e) => apply(e.target.value)}
          className="w-9 h-9 rounded-full border-2 cursor-pointer"
          aria-label="Custom accent color"
        />
        <button
          onClick={() => apply(null)}
          className="text-sm font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-primary)" }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default AccentColorPicker;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/AccentColorPicker.tsx
git commit -m "feat(settings): add AccentColorPicker writing profile.accent_color with instant feedback"
```

---

## Task 34: Apply accent in `useTheme` on auth

**Files:**
- Modify: `src/hooks/useTheme.tsx`

- [ ] **Step 1: Add accent-loading effect**

In `src/hooks/useTheme.tsx`, append a new `useEffect` to `ThemeProvider` (after the existing theme effect):

```tsx
useEffect(() => {
  let active = true;
  const apply = (hex: string | null) => {
    const root = document.documentElement;
    if (hex) {
      root.style.setProperty("--color-primary", hex);
      root.style.setProperty(
        "--color-primary-hover",
        `color-mix(in srgb, ${hex} 85%, white 15%)`
      );
    } else {
      root.style.removeProperty("--color-primary");
      root.style.removeProperty("--color-primary-hover");
    }
  };

  const fetchAndApply = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      apply(null);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("accent_color")
      .eq("id", session.user.id)
      .single();
    if (!active) return;
    apply((data?.accent_color as string | null | undefined) ?? null);
  };

  fetchAndApply();
}, [isLoggedIn]);
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTheme.tsx
git commit -m "feat(theme): load and apply user accent_color as CSS var on auth changes"
```

---

## Task 35: `DefaultTemplatePicker`

**Files:**
- Create: `src/components/settings/DefaultTemplatePicker.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { Check } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../services/profile.service";
import { availableTemplates, type CVTemplate } from "../../services/cv.service";
import type { TemplatePrefs } from "../../lib/supabase";

const DefaultTemplatePicker = () => {
  const { user, profile, refreshProfile } = useAuth();
  const current =
    (profile?.template_prefs as TemplatePrefs | undefined)?.defaultTemplateId ??
    "modern";

  const apply = async (id: CVTemplate) => {
    if (!user) return;
    await profileService.updateDefaultTemplate(user.id, id);
    await refreshProfile();
  };

  return (
    <div>
      <p className="text-sm font-medium mb-3" style={{ color: "var(--color-text-main)" }}>
        Default CV template
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {availableTemplates.map((t) => {
          const selected = t.id === current;
          return (
            <button
              key={t.id}
              onClick={() => apply(t.id)}
              className="relative rounded-xl border-2 p-3 text-left h-24 flex flex-col justify-end transition-all"
              style={{
                borderColor: selected ? "var(--color-primary)" : "var(--color-accent-light)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-2 rounded-t-xl"
                style={{ backgroundColor: t.accentColor }}
              />
              <div className="relative">
                <p className="text-sm font-bold" style={{ color: "var(--color-text-main)" }}>
                  {t.name}
                </p>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                  {t.category}
                </p>
              </div>
              {selected && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DefaultTemplatePicker;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/DefaultTemplatePicker.tsx
git commit -m "feat(settings): add DefaultTemplatePicker grid (writes template_prefs.defaultTemplateId)"
```

---

## Task 36: `AppearanceTab`

**Files:**
- Create: `src/components/settings/AppearanceTab.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import AccentColorPicker from "./AccentColorPicker";
import DefaultTemplatePicker from "./DefaultTemplatePicker";

const AppearanceTab = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-lg"
           style={{ backgroundColor: "var(--color-accent-light)" }}>
        <div>
          <p className="font-medium" style={{ color: "var(--color-text-main)" }}>Theme</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Light or dark mode</p>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`relative w-16 h-8 rounded-full ${theme === "dark" ? "bg-[#780000]" : "bg-[#669BBC]"}`}
        >
          <motion.div
            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
            animate={{ x: theme === "dark" ? 32 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {theme === "dark" ? <Moon className="w-4 h-4 text-[#780000]" /> : <Sun className="w-4 h-4 text-[#669BBC]" />}
          </motion.div>
        </button>
      </div>

      <AccentColorPicker />
      <DefaultTemplatePicker />
    </div>
  );
};

export default AppearanceTab;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/AppearanceTab.tsx
git commit -m "feat(settings): add AppearanceTab (theme + accent + default template)"
```

---

## Task 37: `NotificationsTab`

**Files:**
- Create: `src/components/settings/NotificationsTab.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  profileService,
  parsePreferences,
  type NotificationPrefs,
} from "../../services/profile.service";
import Toast from "../ui/Toast";

const NotificationsTab = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>(parsePreferences(profile));
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setPrefs(parsePreferences(profile));
  }, [profile]);

  const update = async (next: NotificationPrefs) => {
    if (!user) return;
    const prev = prefs;
    setPrefs(next);
    const { error } = await profileService.updatePreferences(user.id, next);
    if (error) {
      setPrefs(prev);
      setToast({ message: error, type: "error" });
    } else {
      await refreshProfile();
    }
  };

  const Row = ({
    title, desc, value, onChange,
  }: { title: string; desc: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between p-4 rounded-lg"
         style={{ backgroundColor: "var(--color-accent-light)" }}>
      <div>
        <p className="font-medium" style={{ color: "var(--color-text-main)" }}>{title}</p>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{desc}</p>
      </div>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="w-5 h-5" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-lg text-sm"
           style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-text-muted)" }}>
        <Info className="w-4 h-4 mt-0.5" />
        Email and push delivery are rolling out — your preferences are saved now and used when delivery launches.
      </div>

      <Row title="Email notifications" desc="Updates about your applications via email"
           value={prefs.email} onChange={(v) => update({ ...prefs, email: v })} />
      <Row title="Push notifications" desc="Real-time updates in the browser"
           value={prefs.push} onChange={(v) => update({ ...prefs, push: v })} />
      <Row title="Application updates" desc="Notify on status changes"
           value={prefs.applicationUpdates} onChange={(v) => update({ ...prefs, applicationUpdates: v })} />

      {toast && <Toast message={toast.message} type={toast.type} isVisible={!!toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default NotificationsTab;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/NotificationsTab.tsx
git commit -m "feat(settings): add NotificationsTab persisting prefs to profiles.preferences"
```

---

## Task 38: `delete-account` edge function

**Files:**
- Create: `supabase/functions/delete-account/deno.json`
- Create: `supabase/functions/delete-account/index.ts`

- [ ] **Step 1: Ensure functions dir exists**

```bash
mkdir -p supabase/functions/delete-account
```

- [ ] **Step 2: Write `deno.json`**

```json
{
  "imports": {
    "supabase": "https://esm.sh/@supabase/supabase-js@2.39.7"
  }
}
```

- [ ] **Step 3: Write `index.ts`**

```ts
// supabase/functions/delete-account/index.ts
// Edge function: deletes the calling user's profile, dependent rows, and auth user.

import { createClient } from "supabase";

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) {
    return new Response(JSON.stringify({ error: "missing_token" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

  const userClient = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) {
    return new Response(JSON.stringify({ error: "invalid_token" }), {
      status: 401,
      headers: corsHeaders,
    });
  }
  const userId = userData.user.id;

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    await admin.from("cv_documents").delete().eq("user_id", userId);
    await admin.from("job_applications").delete().eq("user_id", userId);
    await admin.from("profiles").delete().eq("id", userId);

    const { data: list } = await admin.storage.from("avatars").list(userId, { limit: 100 });
    if (list && list.length > 0) {
      await admin.storage.from("avatars").remove(list.map((e) => `${userId}/${e.name}`));
    }

    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) throw delErr;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("delete-account error", err);
    return new Response(JSON.stringify({ error: "delete_failed", detail: String(err) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
```

- [ ] **Step 4: Deploy the edge function**

```bash
supabase functions deploy delete-account
```

- [ ] **Step 5: Set required secrets**

Either via `supabase secrets set` or in the Supabase dashboard → Functions → delete-account → Secrets:

- `SUPABASE_SERVICE_ROLE_KEY` — set this; it is sensitive.
- `ALLOWED_ORIGIN` — your deployed origin (e.g. `https://your-app.vercel.app`). For local dev, set to `*` temporarily or include `http://localhost:5173`.

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are auto-provided by the Supabase Functions runtime.

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/delete-account/
git commit -m "feat(edge): add delete-account function (verifies JWT, hard-deletes user + rows + storage)"
```

---

## Task 39: `DangerTab`

**Files:**
- Create: `src/components/settings/DangerTab.tsx`

- [ ] **Step 1: Write the file**

```tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Toast from "../ui/Toast";

const DangerTab = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const onDelete = async () => {
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not signed in");

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.error ?? `HTTP ${res.status}`);
      }
      await signOut();
      navigate("/", { replace: true });
    } catch (err: any) {
      setToast({ message: err.message ?? "Delete failed", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 border border-red-200" style={{ backgroundColor: "rgba(193,18,31,0.05)" }}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-900 dark:text-red-300 mb-1">Delete account</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mb-3">
              Permanently deletes your profile, applications, generated CVs, and storage files. This cannot be undone.
            </p>
            <Button
              variant="outline"
              onClick={() => setOpen(true)}
              className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete account
            </Button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: "var(--color-surface)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: "var(--color-text-main)" }}>
                Confirm deletion
              </h3>
              <button onClick={() => setOpen(false)} className="p-1"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
              Type <strong>DELETE</strong> to confirm. This is irreversible.
            </p>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={onDelete}
                disabled={confirmText !== "DELETE" || busy}
                isLoading={busy}
              >
                Delete forever
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} isVisible={!!toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default DangerTab;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/DangerTab.tsx
git commit -m "feat(settings): add DangerTab with type-DELETE confirmation calling edge function"
```

---

## Task 40: Rewrite `Settings.tsx`

**Files:**
- Modify: `src/pages/Settings.tsx`

- [ ] **Step 1: Replace file contents**

Overwrite `src/pages/Settings.tsx` with:

```tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Palette, Bell, AlertTriangle } from "lucide-react";
import Tabs, { type TabItem } from "../components/ui/Tabs";
import AccountTab from "../components/settings/AccountTab";
import SecurityTab from "../components/settings/SecurityTab";
import AppearanceTab from "../components/settings/AppearanceTab";
import NotificationsTab from "../components/settings/NotificationsTab";
import DangerTab from "../components/settings/DangerTab";

const TABS: TabItem[] = [
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "danger", label: "Danger", icon: AlertTriangle },
];

const Settings = () => {
  const [params, setParams] = useSearchParams();
  const initial = params.get("tab") ?? "account";
  const [tab, setTab] = useState(TABS.some((t) => t.id === initial) ? initial : "account");

  useEffect(() => {
    setParams({ tab }, { replace: true });
  }, [tab, setParams]);

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6"
          style={{ color: "var(--color-text-main)" }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#780000] to-[#C1121F]">
            Settings
          </span>
        </motion.h1>

        <div className="mb-6">
          <Tabs items={TABS} value={tab} onChange={setTab} />
        </div>

        <div
          className="rounded-2xl p-5 sm:p-6 shadow-md border backdrop-blur-md"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-surface) 88%, transparent)",
            borderColor: "var(--color-accent-light)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "account" && <AccountTab />}
              {tab === "security" && <SecurityTab />}
              {tab === "appearance" && <AppearanceTab />}
              {tab === "notifications" && <NotificationsTab />}
              {tab === "danger" && <DangerTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Settings.tsx
git commit -m "feat(settings): rewrite Settings page as URL-driven tabbed layout"
```

---

## Task 41: Section 5 + final smoke check

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Manually verify**

- `/settings` opens on Account tab. URL becomes `/settings?tab=account`.
- Switch tabs → URL updates. Reload preserves tab.
- Account: avatar uploader works (image < 2MB succeeds; >2MB shows toast). "Use Google photo" appears only after a custom upload. Sign out routes to `/login`.
- Security: password change form works.
- Appearance: theme toggle works. Accent color preset applies instantly to primary buttons + nav active indicator. Reset clears it. Default template selection updates the Profile live preview template.
- Notifications: toggling a switch persists across reload.
- Danger: clicking Delete shows modal. Anything other than `DELETE` keeps button disabled. `DELETE` + click deletes the account, signs out, and routes to `/`.
- Mobile (375px): tab strip scrolls horizontally; content stacks.

- [ ] **Step 3: Lint pass**

```bash
npm run lint
```

Expected: no new errors introduced by this branch.

- [ ] **Step 4: Stop dev server**

---

## Task 42: Push branch and open PR

- [ ] **Step 1: Push branch**

```bash
git push -u origin feat/ux-overhaul
```

- [ ] **Step 2: Open the PR**

```bash
gh pr create --title "feat(ux): bento dashboard, two-pane profile, tabbed settings, avatar pipeline" --body "$(cat <<'EOF'
## Summary

- Drops `/applications` route, decorative Bell, profile dropdown.
- New shared primitives: `Avatar`, `Tabs`, `useAvatar`, `useLastTemplate`.
- Avatar pipeline (Google OAuth fallback + custom upload via Supabase Storage `avatars` bucket).
- Dashboard rewritten as a bento grid with a unique last-used CV template tile (open-in-builder + quick re-download).
- Profile rewritten as a two-pane sticky-preview editor with 12 sections (incl. all new schema fields).
- Settings rewritten with tab navigation persisted in URL (?tab=), accent color picker, default-template picker, persisted notification preferences, working delete-account flow via Supabase Edge Function.

## Test plan

- [ ] /applications no longer matches a route
- [ ] Google sign-in surfaces avatar across navbar/dashboard/profile/settings
- [ ] Avatar upload/remove/use-Google flows
- [ ] Dashboard last-template tile: open-in-builder preselects right template; quick re-download produces a PDF
- [ ] Profile live preview re-renders within ~600ms of section edits; mobile drawer works
- [ ] Settings deep-links via ?tab=
- [ ] Accent color preset applies instantly and persists
- [ ] Default template change reflects in profile preview
- [ ] Notification toggles persist across reload
- [ ] Delete account end-to-end (test account!) signs out and lands on /

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review

**Spec coverage:**

| Spec section | Covered by |
|---|---|
| Goals (1) routing trim | Tasks 2, 3, 7 |
| Goals (2) implement stubbed features | Tasks 37, 38, 39 |
| Goals (3) bento dashboard | Tasks 13–18 |
| Goals (4) two-pane profile | Tasks 21–27 |
| Goals (5) tabbed settings | Tasks 29, 31–36, 40 |
| Goals (6) avatar pipeline | Tasks 4, 5, 6, 8, 9, 30 |
| 4.1 Routing diff | Task 2 |
| 4.3 NotificationPrefs schema + parser | Task 6 |
| 5.1 Avatar component | Task 4 |
| 5.2 useAvatar | Task 5 |
| 5.3 avatar.service | Task 9 |
| 5.4 Dashboard tiles + grid | Tasks 13–18 |
| 5.5 Profile two-pane (sidebar nav, sections, live preview) | Tasks 21–27 |
| 5.6 Settings tabs | Tasks 29, 31–37, 39, 40 |
| 5.7 delete-account edge fn | Task 38 |
| 5.8 avatars storage migration | Task 8 |
| 6. Removed code | Tasks 2, 3, 7, 40 |
| 8. Error handling (size limits, prefs revert, preview boundary) | Tasks 9, 26, 30, 37 |
| 9. Testing plan | Tasks 12, 20, 28, 41 |
| 10. Migration / rollout | Tasks 1, 8, 38, 42 |
| 11. Open questions — preview perf, edge fn env, accent theming | Tasks 26, 38, 33, 34 |

No spec gaps detected.

**Placeholder scan:** No `TBD`/`TODO` strings. Code blocks present in every code step. Task 21 says "paste body verbatim from Profile.tsx" with explicit line numbers because the source file is still in the repo at that point and the form is ~400 lines of unchanged logic — repeating it verbatim would balloon the plan without adding signal. The engineer can copy directly with `cp` or editor selection.

**Type consistency:**

- `CVTemplate` exported from `cv.service.ts` is used in `LastTemplateTile`, `useLastTemplate`, `DefaultTemplatePicker`, `CVGenerator` query param, `ProfileLivePreview` — same import path everywhere.
- `NotificationPrefs` defined in `profile.service.ts` (Task 6) and consumed in `NotificationsTab` (Task 37) — single source of truth.
- `TemplatePrefs` imported from `lib/supabase.ts` in `profile.service.updateDefaultTemplate`, `LastTemplateTile`, `ProfileLivePreview`, `DefaultTemplatePicker` — consistent.
- `Avatar` props (`url | name | size | ring | onClick | ariaLabel | className`) used identically across navbar, AvatarStreakTile, AvatarUploader.
- `useAvatar` returns `{ url, name, initials, source, googleUrl }` and consumers use only those fields.
- `Tabs.TabItem` shape `{ id, label, icon? }` used in Settings page.

No mismatches found.



