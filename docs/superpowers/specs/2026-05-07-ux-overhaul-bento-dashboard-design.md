# UX Overhaul: Bento Dashboard, Live-Preview Profile, Tabbed Settings, Avatar Pipeline

**Date:** 2026-05-07
**Branch:** `feat/ux-overhaul` (off `feat/cv-templates`)
**Status:** Draft — pending user review

---

## 1. Goals

Trim the post-login experience and make it feel cohesive and modern.

1. **Remove redundant screens, routes, buttons** — `/applications`, profile dropdown, Bell button, dead Settings widgets.
2. **Implement** features that were stubbed in UI but never wired (notification prefs, account deletion).
3. **Redesign Dashboard** as a bento grid with a unique "last-used CV template" tile.
4. **Redesign Profile** as a two-pane sticky-preview editor.
5. **Redesign Settings** with tab navigation.
6. **Avatar pipeline** — auto-fetch Google OAuth picture, allow custom upload, surface in navbar/dashboard/profile.

## 2. Non-Goals

- Push notification delivery system. (Toggles persist; backend delivery is a future spec.)
- New CV templates. (Schema and 17 templates already shipped.)
- Landing page or auth flow changes.
- Email notification sending. (Toggles only; SMTP integration future.)

## 3. Current State Audit

| Surface | Issue |
|---|---|
| `App.tsx` | `/applications` route renders `Dashboard` — pure duplicate of `/dashboard`. |
| `DashboardNavbar.tsx` | "Applications" nav link → same dupe. Profile dropdown reproduces nav links + logout. Bell button is decorative (no notification system behind it). |
| `Dashboard.tsx` | Generic stats grid. No avatar, no continue-where-you-left-off cue, no last template surfaced. |
| `Profile.tsx` | 1612 lines. All sections inline. New Profile schema fields (projects, certifications, languages, awards, volunteer, references, links, skill_levels) have no UI. |
| `Settings.tsx` | Shows `user.id` (debug). Notification toggles never persist. Delete Account button has no `onClick`. Password requirements list is informational filler. |
| Avatar | `profile.photo_url` field exists in schema but no UI reads or writes it. Google OAuth `user_metadata.avatar_url` not surfaced. |

## 4. Architecture

### 4.1 Routing

```
/                  Landing            (public)
/login,/signup     Auth               (public)
/dashboard         Dashboard          (protected)
/jobs              Jobs               (protected)
/resume            CVGenerator        (protected)
/profile           Profile            (protected)
/settings          Settings           (protected)
```

Removed: `/applications`. Nav drops "Applications" item.

### 4.2 New / Modified Files

```
src/
  components/
    ui/
      Avatar.tsx                          NEW
      Tabs.tsx                            NEW   (used by Settings)
    profile/
      ProfileLivePreview.tsx              NEW   (sticky right pane)
      sections/
        BasicInfoSection.tsx              NEW
        SkillsSection.tsx                 NEW   (extracted)
        HobbiesSection.tsx                NEW   (extracted)
        EducationSection.tsx              NEW   (extracted, reuses EducationForm)
        ExperienceSection.tsx             NEW   (extracted, reuses ExperienceForm)
        ProjectsSection.tsx               NEW
        CertificationsSection.tsx         NEW
        LanguagesSection.tsx              NEW
        AwardsSection.tsx                 NEW
        VolunteerSection.tsx              NEW
        ReferencesSection.tsx             NEW
        LinksSection.tsx                  NEW
    dashboard/
      DashboardNavbar.tsx                 EDIT  (drop dropdown + bell + applications)
      tiles/
        WelcomeHeroTile.tsx               NEW
        AvatarStreakTile.tsx              NEW
        LastTemplateTile.tsx              NEW
        StatTile.tsx                      NEW
        RecentJobsTile.tsx                NEW
    settings/
      AccountTab.tsx                      NEW
      SecurityTab.tsx                     NEW
      AppearanceTab.tsx                   NEW
      NotificationsTab.tsx                NEW
      DangerTab.tsx                       NEW
      AvatarUploader.tsx                  NEW
      AccentColorPicker.tsx               NEW
      DefaultTemplatePicker.tsx           NEW
  hooks/
    useAvatar.ts                          NEW
    useLastTemplate.ts                    NEW
  pages/
    Dashboard.tsx                         REWRITE
    Profile.tsx                           REWRITE
    Settings.tsx                          REWRITE
  services/
    avatar.service.ts                     NEW
    profile.service.ts                    EDIT  (add updatePreferences, updateAccentColor, updateDefaultTemplate, updatePhotoUrl)
    cv.service.ts                         EDIT  (add getLastTemplate(userId))
  App.tsx                                 EDIT  (drop /applications)

supabase/
  migrations/
    2026-05-07-avatars-bucket.sql         NEW
  functions/
    delete-account/
      index.ts                            NEW
      deno.json                           NEW
```

### 4.3 Data Model

No new columns; schema already has the fields.

```ts
// already in profiles
photo_url: string | null
accent_color: string | null
preferences: string | null   // JSON-serialized NotificationPrefs
template_prefs: { defaultTemplateId?: string; accentColor?: string }
```

`profiles.preferences` JSON shape:

```ts
type NotificationPrefs = {
  email: boolean;        // default true
  push: boolean;         // default false
  applicationUpdates: boolean; // default true
};
```

Helper in `profile.service.ts`:

```ts
parsePreferences(profile: Profile): NotificationPrefs
```

Returns defaults when `preferences` is null or unparseable.

## 5. Component Designs

### 5.1 Avatar (`components/ui/Avatar.tsx`)

```ts
type AvatarProps = {
  url?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';   // 24, 32, 48, 96 px
  ring?: boolean;                      // adds gradient ring
  onClick?: () => void;
};
```

Renders:
1. `<img>` if `url` truthy.
2. Else gradient circle (uses `var(--color-primary)` to `var(--color-primary-hover)`) with initials from `name` (first letters of first two whitespace-split tokens, uppercase).
3. Optional outer ring with same gradient when `ring`.

Errors: on `<img>` `onerror`, fall back to initials.

### 5.2 useAvatar hook

```ts
export function useAvatar(): {
  url: string | null;       // resolved url to render
  name: string;
  initials: string;
  source: 'custom' | 'google' | 'none';
  googleUrl: string | null; // raw OAuth url (for "Use Google photo" action)
} {
  const { user, profile } = useAuth();
  const googleUrl = (user?.user_metadata?.avatar_url as string | undefined) ?? null;
  const customUrl = profile?.photo_url ?? null;
  const url = customUrl ?? googleUrl;
  const source: 'custom' | 'google' | 'none' =
    customUrl ? 'custom' : googleUrl ? 'google' : 'none';
  const name = profile?.name ?? (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? '';
  const initials = name.trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() ?? '').join('') || '?';
  return { url, name, initials, source, googleUrl };
}
```

`AvatarUploader` button visibility:
- "Upload new" — always.
- "Use Google photo" — visible when `googleUrl !== null && source === 'custom'` (user overrode Google with custom; offer to revert).
- "Remove" — visible when `source === 'custom'` (clears `photo_url`; falls back to Google if available, else initials).

### 5.3 avatar.service.ts

```ts
upload(userId: string, file: File): Promise<string>
  // Validates: file.type startsWith 'image/', file.size <= 2 * 1024 * 1024.
  // Uploads to `avatars/{userId}/avatar.{ext}` with upsert: true.
  // Calls profileService.updatePhotoUrl(userId, publicUrl).
  // Returns the public URL.

remove(userId: string): Promise<void>
  // Deletes `avatars/{userId}/*`, sets profile.photo_url = null.
```

### 5.4 Dashboard Bento Grid

Tailwind grid: `grid-cols-12 grid-rows-[auto] gap-4 lg:gap-6`.

| Tile | Cols (lg) | Rows (lg) | Mobile |
|---|---|---|---|
| WelcomeHeroTile | 1-7 | 1 | full |
| AvatarStreakTile | 8-12 | 1 | full |
| LastTemplateTile | 1-7 | 2 | full |
| StatTile (Apps Sent) | 8-10 | 2 | half |
| StatTile (Response) | 11-12 | 2 | half |
| StatTile (Pending) | 1-3 | 3 | half |
| StatTile (Interviews) | 4-7 | 3 | half |
| RecentJobsTile | 8-12 | 2-3 | full |

Mobile (`< md`): single column. Tablet (`md`): 6-col simplified.

#### LastTemplateTile

- Reads `useLastTemplate()` → `{ templateId, lastFileUrl }` from `cv_documents` ordered by `created_at DESC LIMIT 1`.
- Renders `<PDFViewer showToolbar={false}>` with the matching template component at ~280px height.
- Two buttons: "Open in builder" (→ `/resume?template=<id>`) and "Quick re-download" (fetches `lastFileUrl` and triggers download — falls back to live render if URL gone).
- Empty state: gradient call-to-action "Build your first resume" → `/resume`.

#### CVGenerator support

`CVGenerator.tsx` reads `?template=<id>` query param on mount and presets `selectedTemplate`. Existing logic stays.

### 5.5 Profile two-pane

```
[ Sidebar nav (sticky) | Editor pane (scroll) | Live preview pane (sticky, lg+) ]
       w-48                  flex-1                w-[420px]
```

- **Sidebar nav** — anchor links to each section with completion check.
- **Editor pane** — scroll snap to sections; one component per section (see file list).
- **Live preview pane** — `<PDFViewer>` rendering the user's pinned default template (`profile.template_prefs?.defaultTemplateId ?? 'modern'`) against current in-memory profile state. Re-renders on debounced (400ms) state change. Hidden below `lg` breakpoint with a "Show preview" floating button that opens a fullscreen drawer.

Each section component receives `(profile, onChange)` and writes via the relevant `profile.service` method on save (autosave with debounce, no explicit "Edit" mode for short fields). Education and Experience already have row-add semantics; keep that.

### 5.6 Settings tabs

Top-level layout:

```
[ Tabs: Account | Security | Appearance | Notifications | Danger ]
[ Active panel content                                            ]
```

Tabs persist in URL (`?tab=appearance`) so deep-links work.

#### Tabs.tsx

Generic tab primitive: `<Tabs value=... onChange=... items={[{id,label,icon?}]}>`.

#### AccountTab

- Email (read-only, copy button)
- AvatarUploader — current avatar + buttons "Upload new" (file input) / "Use Google photo" (visible when `isGoogle === true && profile.photo_url !== null`) / "Remove"
- Name, phone, address — inline edit, autosave on blur
- Sign out button

#### SecurityTab

- Password change form (kept).
- Drop the bullet list of password requirements; instead inline helper text under the New Password field.

#### AppearanceTab

- Theme toggle (kept)
- AccentColorPicker — 6 swatches + custom hex; writes `profiles.accent_color`. Hooked into theme via CSS var override.
- DefaultTemplatePicker — grid of template thumbnails; writes `profile.template_prefs.defaultTemplateId`. Drives Profile live preview + Last Template empty state.

#### NotificationsTab

- 3 toggles persisted to `profiles.preferences` (autosave on toggle).
- Note text: "Email and push delivery rolling out soon — your preferences are saved."

#### DangerTab

- Delete Account button → confirm modal that requires typing "DELETE" → POST to Supabase Edge Function `delete-account` → on 200, sign out + redirect `/`.

### 5.7 delete-account Edge Function

`supabase/functions/delete-account/index.ts`:

1. Verify caller JWT via `supabase.auth.getUser(authHeader)`.
2. Use service-role client to:
   - Delete from `profiles where id = userId`
   - Delete from dependent tables (`cv_documents`, `job_applications`) — schema has cascade where added; explicit deletes for safety.
   - Call `supabase.auth.admin.deleteUser(userId)`.
3. Return `{ ok: true }` on success.

CORS: allow `VITE_APP_URL` origin (read from env in function).

### 5.8 Avatars storage migration

`2026-05-07-avatars-bucket.sql`:

```sql
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_owner_write"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_update"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
```

## 6. Removed Code

- `App.tsx`: `/applications` Route line.
- `DashboardNavbar.tsx`: applications nav entry, Bell motion.button block, profile dropdown block (`isProfileOpen` state + JSX). Replace dropdown trigger with a plain `<Avatar onClick={() => navigate('/profile')}>`.
- `Settings.tsx`: User ID display, password requirements list block, the original 3 unbacked notification toggles (replaced with persisted versions), original empty-handler Delete Account button (replaced with wired version).
- Mobile menu in DashboardNavbar: drop standalone Profile link (avatar in top bar covers it) but keep Logout.

## 7. State Flow Examples

**Upload avatar:**
```
AccountTab.tsx
  -> AvatarUploader file input
  -> avatar.service.upload(user.id, file)
       -> validate -> supabase.storage.from('avatars').upload(...)
       -> profileService.updatePhotoUrl(user.id, publicUrl)
  -> refreshProfile()  (from useAuth)
  -> all <Avatar> instances re-render via context
```

**Delete account:**
```
DangerTab modal "DELETE" confirmation
  -> fetch(`${SUPABASE_URL}/functions/v1/delete-account`, { Authorization: Bearer ${session.access_token} })
  -> 200 -> signOut() -> navigate('/', replace)
  -> 4xx/5xx -> toast error
```

**Live preview re-render in Profile:**
```
Section onChange -> setProfileDraft(...)
  -> useDebouncedValue(profileDraft, 400)
  -> ProfileLivePreview re-renders <PDFViewer>{Template(profileDraft)}</PDFViewer>
```

## 8. Error Handling

- Avatar upload > 2MB → toast "Image must be under 2MB".
- Avatar non-image type → toast "File must be an image".
- Storage upload failure → toast "Upload failed, try again." Profile state unchanged.
- Delete Account failure → toast with server message; user stays signed in.
- Notification preference save failure → revert toggle, toast.
- Live preview render failure → catch in error boundary inside ProfileLivePreview, show "Preview unavailable — your data is saved" placeholder.

## 9. Testing Plan

Type-check (`tsc --noEmit`) and lint pass after each major file.

Manual smoke checks:
1. `/applications` URL → React Router default no-match (no wildcard added; route simply gone).
2. Sign in with Google → dashboard avatar shows Google photo.
3. Upload custom avatar → all surfaces update; "Use Google photo" reverts.
4. Build a CV → return to dashboard → LastTemplateTile shows it.
5. Click "Quick re-download" → file downloads.
6. Click "Open in builder" → CVGenerator opens with that template selected.
7. Profile section edit → live preview reflects within 400-600ms.
8. Settings tab deep-link `?tab=appearance` → opens that tab.
9. Toggle notifications → reload → state persists.
10. Delete account confirm flow → user signed out and `/login` reachable.
11. Mobile (375px): bento collapses, profile preview hidden, settings tabs scroll horizontally.

## 10. Migration / Rollout

- New branch off current `feat/cv-templates`: `feat/ux-overhaul`.
- Single PR; can be reviewed section-by-section via commit boundaries:
  1. Routing + navbar cleanup
  2. Avatar pipeline (component + hook + service + migration)
  3. Dashboard bento
  4. Profile two-pane + section extraction
  5. Settings tabs + edge function
- Database migration (`avatars` bucket) applied via Supabase CLI before merge.
- Edge function deployed (`supabase functions deploy delete-account`).
- No data migration needed for existing rows.

## 11. Open Questions / Risks

- **PDFViewer perf** — rendering live on every keystroke can lag. Mitigation: 400ms debounce + memoized template component. If still laggy, fall back to "Refresh preview" button.
- **Edge function env** — needs `SUPABASE_SERVICE_ROLE_KEY` set in Supabase dashboard before deploy. Document in plan.
- **Accent color theming** — current theme uses fixed CSS vars; need a small `ThemeProvider` extension to apply user accent. Acceptable scope creep, contained to `useTheme.tsx`.
