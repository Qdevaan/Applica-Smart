# Applica-Smart Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the disconnected frontend + ML research demo into a working integrated job-application assistant: clean repo, stable frontend, ML pipeline exposed via FastAPI, and job recommendations surfaced in the React UI.

**Architecture:** React 19 frontend (Supabase auth/DB) calls a FastAPI bridge (`FYP/api/server.py`) which wraps the existing `pipeline.py` ML pipeline. Profile text is extracted client-side from Supabase profile data and posted to FastAPI; ranked jobs + cover letters come back and render in a new `/jobs` page. The Node.js scraper (`FYP/job_scraper/`) continues to run offline and writes `jobs.json` which the API reads.

**Tech Stack:** React 19, TypeScript, Vite, Supabase, framer-motion, FastAPI, Pydantic, sentence-transformers, Ollama/mistral

---

## Scope Note

Phases 2 and 3 are independent and can be worked in parallel. Phase 4 depends on Phase 3. Phase 5 depends on Phases 2 and 4.

---

## File Map

### Created
- `FYP/api/__init__.py` — package marker
- `FYP/api/models.py` — Pydantic request/response models
- `FYP/api/server.py` — FastAPI app exposing ML pipeline over HTTP
- `src/services/pipeline.service.ts` — Frontend fetch wrapper for FastAPI
- `src/components/jobs/JobCard.tsx` — Card UI: one ranked job + expandable cover letter
- `src/pages/Jobs.tsx` — New page: run ML pipeline, view ranked results

### Modified
- `.gitignore` — remove `documentation/`, add `FYP/venv/`, `FYP/data/processed/`, output artifacts
- `src/layouts/DashboardLayout.tsx:8` — fix hardcoded `bg-[#FDF0D5]`
- `src/pages/CVGenerator.tsx` — replace `alert()` with `Toast`
- `src/hooks/useAuth.tsx` — remove console.logs, fix duplicate profile fetch
- `src/components/ProtectedRoute.tsx` — remove console.logs + 5s timeout hack, fix hardcoded colors
- `src/components/dashboard/DashboardNavbar.tsx` — remove `setTimeout` logout hack, add Jobs nav link
- `src/pages/Dashboard.tsx` — wire stats to `jobApplicationService.getApplicationStats`
- `src/lib/supabase.ts` — replace module-load throw with soft env check
- `src/App.tsx` — add `/jobs` route
- `FYP/scripts/pipeline.py` — remove dead code, fix indentation, add `process_application_text`
- `FYP/scripts/skill_extractor.py` — drop spaCy, substring match only

### Deleted
- `src/utils/axiosInstance.ts` — dead JWT-bearer code
- `src/utils/apiRoutes.ts` — describes non-existent endpoints
- `FYP/scripts/similarity.py` — unused TF-IDF leftover
- `FYP/scripts/model_training.py` — empty stub
- `FYP/scripts/ner.py` — empty stub
- `FYP/scripts/test.py` — broken (references undefined `jobs`)
- `FYP/scripts/test_similarity.py` — broken (imports non-existent functions)
- Root-level duplicate docs (`BACKEND_API_GUIDE.md`, `CV_GENERATION_README.md`, `CV_IMPLEMENTATION_SUMMARY.md`)

---

## Phase 1: Repo Hygiene

### Task 1: Fix .gitignore and untrack committed artifacts

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Rewrite .gitignore**

Replace current `.gitignore` entirely:

```gitignore
# Environment
.env
.env.*

# Logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# JS deps & build
node_modules
dist
dist-ssr
*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Python
FYP/venv/
FYP/__pycache__/
FYP/**/__pycache__/
*.pyc
*.pyo

# FYP output artifacts (generated — do not commit)
FYP/data/processed/
FYP/final_results.json
FYP/jobs.json
```

Note: `documentation/` is removed from .gitignore so the plan gets tracked.

- [ ] **Step 2: Untrack committed node_modules, venv, and artifacts**

```bash
git rm -r --cached node_modules FYP/node_modules FYP/venv 2>$null; `
git rm --cached FYP/final_results.json FYP/jobs.json 2>$null; `
git rm -r --cached "FYP/data/processed/" 2>$null
```

Expected: lists of `rm 'path'` lines. Errors on already-absent paths are fine.

- [ ] **Step 3: Stage and commit**

```bash
git add .gitignore
git commit -m "chore: fix gitignore — untrack node_modules, venv, FYP output artifacts"
```

---

### Task 2: Delete dead source files

**Files:**
- Delete: `src/utils/axiosInstance.ts`
- Delete: `src/utils/apiRoutes.ts`
- Delete: `FYP/scripts/similarity.py`
- Delete: `FYP/scripts/model_training.py`
- Delete: `FYP/scripts/ner.py`
- Delete: `FYP/scripts/test.py`
- Delete: `FYP/scripts/test_similarity.py`
- Delete: `BACKEND_API_GUIDE.md`, `CV_GENERATION_README.md`, `CV_IMPLEMENTATION_SUMMARY.md` (root-level)

- [ ] **Step 1: Verify nothing imports axiosInstance or apiRoutes**

```bash
grep -r "axiosInstance\|apiRoutes" src/ --include="*.ts" --include="*.tsx"
```

Expected: no output. If any file found, open it and remove the import before proceeding.

- [ ] **Step 2: Delete dead frontend files**

```bash
git rm src/utils/axiosInstance.ts src/utils/apiRoutes.ts
```

- [ ] **Step 3: Delete dead backend scripts**

```bash
git rm FYP/scripts/similarity.py FYP/scripts/model_training.py FYP/scripts/ner.py FYP/scripts/test.py FYP/scripts/test_similarity.py
```

- [ ] **Step 4: Delete root-level duplicate docs**

```bash
git rm BACKEND_API_GUIDE.md CV_GENERATION_README.md CV_IMPLEMENTATION_SUMMARY.md 2>$null
```

- [ ] **Step 5: Commit**

```bash
git commit -m "chore: delete dead code — axiosInstance, apiRoutes, unused FYP scripts, duplicate docs"
```

---

## Phase 2: Frontend Fixes

### Task 3: Fix hardcoded colors (DashboardLayout + ProtectedRoute)

**Files:**
- Modify: `src/layouts/DashboardLayout.tsx:8`
- Modify: `src/components/ProtectedRoute.tsx:58-65`

- [ ] **Step 1: Fix DashboardLayout.tsx**

Change line 8 from:
```tsx
      <div className="min-h-screen bg-[#FDF0D5]">
```
to:
```tsx
      <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
```

- [ ] **Step 2: Fix ProtectedRoute loading spinner**

Replace the loading return (lines 55-67) with:
```tsx
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
          />
          <p className="font-medium" style={{ color: "var(--color-text-main)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
```

- [ ] **Step 3: Test dark mode**

Run `npm run dev`, log in, go to `/dashboard`, toggle dark mode in Settings. Confirm background switches correctly in the dashboard area (not just the navbar).

- [ ] **Step 4: Commit**

```bash
git add src/layouts/DashboardLayout.tsx src/components/ProtectedRoute.tsx
git commit -m "fix: use CSS theme vars instead of hardcoded hex colors"
```

---

### Task 4: Replace alert() in CVGenerator with Toast

**Files:**
- Modify: `src/pages/CVGenerator.tsx`

- [ ] **Step 1: Add Toast import and state**

Add to imports at top of file:
```tsx
import Toast from "../components/ui/Toast";
```

Add after the existing `const [isUploading, setIsUploading] = useState(false);` line:
```tsx
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
```

- [ ] **Step 2: Replace handleDownload**

```tsx
  const handleDownload = async () => {
    if (!profile || !selectedTemplate) return;
    setIsDownloading(true);
    try {
      await cvService.downloadCV(profile, selectedTemplate);
      setToast({ message: "CV downloaded successfully!", type: "success" });
    } catch (error) {
      console.error("Download error:", error);
      setToast({ message: "Failed to download CV. Please try again.", type: "error" });
    } finally {
      setIsDownloading(false);
    }
  };
```

- [ ] **Step 3: Replace handleSaveToCloud**

```tsx
  const handleSaveToCloud = async () => {
    if (!user || !profile || !selectedTemplate) return;
    setIsUploading(true);
    try {
      const fileUrl = await cvService.uploadCV(user.id, profile, selectedTemplate);
      await cvService.saveCVRecord(user.id, selectedTemplate, fileUrl);
      setToast({ message: "CV saved to your account successfully!", type: "success" });
    } catch (error) {
      console.error("Upload error:", error);
      setToast({ message: "Failed to save CV. Please try again.", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };
```

- [ ] **Step 4: Add Toast to JSX**

Before the closing `</div>` of the outermost container (before `</div>` on the second-to-last line), add:
```tsx
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={!!toast}
            onClose={() => setToast(null)}
          />
        )}
```

- [ ] **Step 5: Test**

In browser: select a template → click "Download CV" → confirm toast appears in top-right corner instead of browser `alert()` dialog.

- [ ] **Step 6: Commit**

```bash
git add src/pages/CVGenerator.tsx
git commit -m "fix: replace alert() with Toast in CVGenerator"
```

---

### Task 5: Clean auth — remove logs, fix duplicate fetch, remove setTimeout

**Files:**
- Modify: `src/hooks/useAuth.tsx`
- Modify: `src/components/ProtectedRoute.tsx`
- Modify: `src/components/dashboard/DashboardNavbar.tsx`

- [ ] **Step 1: Rewrite useAuth.tsx**

The root cause of the duplicate fetch: `initializeAuth` calls `profileService.getProfile` and `onAuthStateChange` also calls it on the `INITIAL_SESSION` event (which fires immediately after). Fix: skip profile fetch on `INITIAL_SESSION` in the listener.

Replace entire `src/hooks/useAuth.tsx`:

```tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/supabase";
import { profileService } from "../services/profile.service";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = (userId: string, mounted: { current: boolean }) => {
    profileService.getProfile(userId).then(({ data, error }) => {
      if (error) console.error("Profile fetch error:", error);
      if (mounted.current && data) setProfile(data);
    });
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    const { data, error } = await profileService.getProfile(user.id);
    if (error) console.error("Profile refresh error:", error);
    if (data) setProfile(data);
  };

  useEffect(() => {
    const mounted = { current: true };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted.current) return;
      if (error) { setLoading(false); return; }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id, mounted);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted.current) return;
      // INITIAL_SESSION is handled by getSession above — skip to avoid double fetch
      if (event === "INITIAL_SESSION") return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, mounted);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
```

- [ ] **Step 2: Rewrite ProtectedRoute.tsx**

Remove all console.logs and the 5-second timeout escape hatch (the real bug it papered over — the duplicate fetch — is now fixed). Replace entire `src/components/ProtectedRoute.tsx`:

```tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
          />
          <p className="font-medium" style={{ color: "var(--color-text-main)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

- [ ] **Step 3: Fix handleLogout in DashboardNavbar.tsx**

Replace `handleLogout` (lines 32-42) with:
```tsx
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login", { replace: true });
    }
  };
```

- [ ] **Step 4: Test auth flow end-to-end**

- Visit `/dashboard` while logged out → redirects to `/login` immediately (no 5s wait)
- Log in → lands on `/dashboard`, profile name shows in header
- Refresh page → stays on `/dashboard` (session restored, no flash)
- Log out → lands on `/login` immediately (no 100ms delay)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAuth.tsx src/components/ProtectedRoute.tsx src/components/dashboard/DashboardNavbar.tsx
git commit -m "fix: clean auth — remove console.logs, fix duplicate profile fetch, remove setTimeout hack"
```

---

### Task 6: Fix supabase.ts env check

**Files:**
- Modify: `src/lib/supabase.ts:1-8`
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace module-load throw in supabase.ts**

Replace lines 1-10 of `src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabaseMisconfigured = !supabaseUrl || !supabaseAnonKey;

export const supabase = supabaseMisconfigured
  ? ({} as ReturnType<typeof createClient>)
  : createClient(supabaseUrl, supabaseAnonKey);
```

Keep lines 11 onwards (the `Profile`, `Education`, `Experience`, `JobApplication`, `CVDocument` interfaces) unchanged.

- [ ] **Step 2: Add env guard in App.tsx**

In `src/App.tsx`, add import and early return before the `App` component's return:
```tsx
import { supabaseMisconfigured } from "./lib/supabase";

const App = () => {
  if (supabaseMisconfigured) {
    return (
      <div style={{ padding: 40, fontFamily: "monospace" }}>
        <h2>Configuration Error</h2>
        <p>
          Missing <code>VITE_SUPABASE_URL</code> or{" "}
          <code>VITE_SUPABASE_ANON_KEY</code> in your <code>.env</code> file.
        </p>
      </div>
    );
  }

  return (
    // ... existing JSX unchanged
  );
};
```

- [ ] **Step 3: Test**

Temporarily rename `.env` → `.env.bak`, run `npm run dev`, open `http://localhost:5173`. Should see the configuration error message instead of a white screen. Rename back to `.env`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase.ts src/App.tsx
git commit -m "fix: replace supabase module-load throw with friendly env error UI"
```

---

### Task 7: Add ErrorBoundary and wire Dashboard stats

**Files:**
- Create: `src/components/ui/ErrorBoundary.tsx`
- Modify: `src/layouts/DashboardLayout.tsx`
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Create ErrorBoundary.tsx**

Create `src/components/ui/ErrorBoundary.tsx`:

```tsx
import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: 32, textAlign: "center" }}>
            <h2>Something went wrong.</h2>
            <pre style={{ fontSize: 12, color: "gray" }}>
              {this.state.error?.message}
            </pre>
            <button onClick={() => this.setState({ hasError: false, error: null })}>
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

- [ ] **Step 2: Wrap dashboard content with ErrorBoundary**

In `src/layouts/DashboardLayout.tsx`, add import and wrap the inner div:

```tsx
import { Outlet } from "react-router-dom";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import ProtectedRoute from "../components/ProtectedRoute";
import ErrorBoundary from "../components/ui/ErrorBoundary";

const DashboardLayout = () => {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
          <DashboardNavbar />
          <main className="pt-16">
            <Outlet />
          </main>
        </div>
      </ErrorBoundary>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
```

- [ ] **Step 3: Wire Dashboard stats to real data**

Replace entire `src/pages/Dashboard.tsx`:

```tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { jobApplicationService } from "../services/jobApplication.service";

interface AppStats {
  total: number;
  applied: number;
  pending: number;
  interview: number;
  rejected: number;
  accepted: number;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<AppStats | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    jobApplicationService.getApplicationStats(user.id).then(({ data }) => {
      if (data) setStats(data);
    });
  }, [user?.id]);

  const responseRate =
    stats && stats.total > 0
      ? `${Math.round(((stats.interview + stats.accepted) / stats.total) * 100)}%`
      : "—";

  const statCards = [
    {
      label: "Applications Sent",
      value: stats?.total ?? "—",
      icon: Briefcase,
      color: "text-[#780000]",
      bgColor: "bg-[#780000]/10",
    },
    {
      label: "Response Rate",
      value: responseRate,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Pending",
      value: stats?.pending ?? "—",
      icon: Clock,
      color: "text-[#669BBC]",
      bgColor: "bg-[#669BBC]/10",
    },
    {
      label: "Interviews",
      value: stats?.interview ?? "—",
      icon: CheckCircle,
      color: "text-[#C1121F]",
      bgColor: "bg-[#C1121F]/10",
    },
  ];

  return (
    <div
      className="min-h-screen p-4 sm:p-6 md:p-8"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
            style={{ color: "var(--color-text-main)" }}
          >
            Welcome back, {profile?.name || user?.email?.split("@")[0]}!
          </h1>
          <p
            className="text-base sm:text-lg mb-6 sm:mb-8"
            style={{ color: "var(--color-text-muted)" }}
          >
            Here's what's happening with your job applications today.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-xl p-4 sm:p-6 shadow-sm border hover:shadow-md transition-shadow"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-accent-light)",
                  }}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <h3
                    className="text-2xl sm:text-3xl font-bold mb-1"
                    style={{ color: "var(--color-text-main)" }}
                  >
                    {stat.value}
                  </h3>
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-xl p-4 sm:p-6 md:p-8 shadow-sm border"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-accent-light)",
            }}
          >
            <h2
              className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
              style={{ color: "var(--color-text-main)" }}
            >
              Recent Applications
            </h2>
            <p
              className="text-sm sm:text-base"
              style={{ color: "var(--color-text-muted)" }}
            >
              {stats?.total === 0
                ? "No applications yet. Go to the Jobs page to find matching positions."
                : "Your recent job applications will appear here."}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/ErrorBoundary.tsx src/layouts/DashboardLayout.tsx src/pages/Dashboard.tsx
git commit -m "feat: add ErrorBoundary, wire Dashboard stats to real Supabase data"
```

---

## Phase 3: Backend ML Cleanup

### Task 8: Clean pipeline.py

**Files:**
- Modify: `FYP/scripts/pipeline.py`

- [ ] **Step 1: Delete flan-t5 import and generator global (lines 3 and 18-21)**

Remove this import at line 3:
```python
from transformers import pipeline
```

Remove these lines at 18-21:
```python
generator = pipeline(
    "text2text-generation",
    model="google/flan-t5-base"
)
```

- [ ] **Step 2: Delete orphan block (the uncommented body of the commented-out function)**

Immediately after the `return letter` line that ends `generate_cover_letter_pro`, there is an orphan block that starts with `#def generate_cover_letter_llm(...)` comment but the body is live code. Delete lines 116-145 entirely — the block from `#def generate_cover_letter_llm` through `return result.content`.

- [ ] **Step 3: Delete generate_cover_letter_hf function**

Delete the entire `generate_cover_letter_hf` function (starts with `def generate_cover_letter_hf(` and ends at `return result[0]["generated_text"].strip()`). It uses the deleted `generator` global and is never called at the active call site.

- [ ] **Step 4: Remove commented cover-letter alternatives in process_application**

In `process_application`, delete the three commented-out cover-letter calls (the `# cover_letter = generate_cover_letter_pro(...)`, `# cover_letter = generate_cover_letter_llm(...)`, and `# cover_letter = generate_cover_letter_hf(...)` blocks). Keep only the active `generate_cover_letter_mistral` call.

- [ ] **Step 5: Fix process_multiple_jobs indentation**

Rewrite the loop body with uniform 4-space indentation (the current mix of 1-space and 4-space indents inside the `for` loop is fragile):

```python
    for idx, item in enumerate(top_jobs):
        print(f"Generating cover letter {idx+1}/{len(top_jobs)}...")

        job = item["job"]

        output = process_application(
            resume_pdf_path,
            job["description"],
            job_title=job.get("title"),
            company=job.get("company"),
            save_outputs=False
        )

        result_item = {
            "title": job.get("title"),
            "company": job.get("company"),
            "similarity": output["similarity"],
            "recommendation": output["recommendation"],
        }

        if idx < 3:
            cover_letter = output["cover_letter"]
            safe_company = job.get("company", "company").replace(" ", "_")
            filename = f"cover_letter_{idx+1}_{safe_company}.txt"
            file_path = os.path.join(PROCESSED_DIR, filename)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(cover_letter)
            result_item["cover_letter"] = cover_letter
            result_item["cover_letter_file"] = file_path
        else:
            result_item["cover_letter"] = "Not generated (only top 3)"
            result_item["cover_letter_file"] = None

        results.append(result_item)
```

- [ ] **Step 6: Add process_application_text function**

After the `process_application` function, add a new function for API use (skips PDF extraction):

```python
def process_application_text(resume_text: str, job_description_text: str,
                              job_title=None, company=None):
    """
    Same as process_application but accepts resume text directly.
    Used by the FastAPI server so the frontend can post profile text instead of uploading a PDF.
    """
    cleaned_resume = preprocess_text(resume_text or "")
    resume_snippet = cleaned_resume[:500]
    cleaned_jd = preprocess_text(job_description_text or "")

    job_title = job_title or extract_job_title(job_description_text)
    company = company or extract_company(job_description_text)

    resume_skills = extract_skills(cleaned_resume)
    jd_skills = extract_skills(cleaned_jd)
    resume_skills_norm = [s.lower() for s in resume_skills]
    jd_skills_norm = [s.lower() for s in jd_skills]

    try:
        similarity = float(get_similarity(cleaned_resume, cleaned_jd))
    except Exception:
        similarity = 0.0

    missing_skills = [s for s in jd_skills_norm if s not in resume_skills_norm]
    recommendation = get_recommendation(similarity, missing_skills)
    applicant_name = extract_name_from_resume(resume_text)

    cover_letter = generate_cover_letter_mistral(
        resume_skills_norm,
        jd_skills_norm,
        job_title,
        company,
        applicant_name,
        resume_snippet,
    )

    return {
        "resume_skills": resume_skills_norm,
        "jd_skills": jd_skills_norm,
        "missing_skills": missing_skills,
        "similarity": similarity,
        "cover_letter": cover_letter,
        "recommendation": recommendation,
        "applicant_name": applicant_name,
        "job_title": job_title,
        "company": company,
    }
```

- [ ] **Step 7: Verify syntax**

```bash
cd FYP
python -c "import scripts.pipeline; print('OK')"
```

Expected: `OK`. If you see `ImportError` or `SyntaxError`, fix the indicated line before continuing.

- [ ] **Step 8: Commit**

```bash
git add FYP/scripts/pipeline.py
git commit -m "fix: clean pipeline.py — remove dead code, fix indentation, add process_application_text"
```

---

### Task 9: Simplify skill_extractor.py

**Files:**
- Modify: `FYP/scripts/skill_extractor.py`

- [ ] **Step 1: Rewrite without spaCy**

The spaCy token loop (lines 19-26) is redundant — the substring scan on lines 29-31 already catches everything including the same single-word skills. Drop spaCy entirely.

Replace entire `FYP/scripts/skill_extractor.py`:

```python
TECH_SKILLS = [
    "python", "java", "c++", "c#", "javascript", "typescript", "html", "css",
    "django", "flask", "fastapi", "react", "node", "nodejs", "express",
    "sql", "mysql", "postgresql", "mongodb",
    "nlp", "machine learning", "deep learning", "tensorflow",
    "pytorch", "pyspark", "aws", "azure", "gcp", "docker", "kubernetes",
    "rest api", "graphql", "git", "linux", "computer vision", "api", "ml",
    "scikit-learn", "pandas", "numpy", "redis", "elasticsearch",
]


def extract_skills(text: str) -> list[str]:
    """Extract tech skills from text via substring matching."""
    text_lower = text.lower()
    return [skill for skill in TECH_SKILLS if skill in text_lower]
```

- [ ] **Step 2: Verify**

```bash
cd FYP
python -c "from scripts.skill_extractor import extract_skills; print(extract_skills('python django react sql machine learning'))"
```

Expected: `['python', 'django', 'react', 'sql', 'machine learning']` (order may vary)

- [ ] **Step 3: Commit**

```bash
git add FYP/scripts/skill_extractor.py
git commit -m "fix: drop spaCy from skill_extractor — substring match is sufficient and 10x faster"
```

---

## Phase 4: FastAPI Bridge

### Task 10: Create FastAPI server

**Files:**
- Create: `FYP/api/__init__.py`
- Create: `FYP/api/models.py`
- Create: `FYP/api/server.py`

- [ ] **Step 1: Install FastAPI**

```bash
cd FYP
pip install "fastapi>=0.111.0" "uvicorn[standard]>=0.29.0"
```

Expected: `Successfully installed fastapi-...`

- [ ] **Step 2: Create FYP/api/__init__.py**

Create `FYP/api/__init__.py` as an empty file.

- [ ] **Step 3: Create FYP/api/models.py**

```python
from pydantic import BaseModel
from typing import Optional


class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str
    job_title: Optional[str] = None
    company: Optional[str] = None


class AnalyzeResponse(BaseModel):
    resume_skills: list[str]
    jd_skills: list[str]
    missing_skills: list[str]
    similarity: float
    cover_letter: str
    recommendation: str
    applicant_name: str
    job_title: str
    company: str


class BatchAnalyzeRequest(BaseModel):
    resume_text: str


class JobResult(BaseModel):
    title: Optional[str]
    company: Optional[str]
    similarity: float
    recommendation: str
    cover_letter: str
    cover_letter_file: Optional[str]
```

- [ ] **Step 4: Create FYP/api/server.py**

```python
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from api.models import AnalyzeRequest, AnalyzeResponse, BatchAnalyzeRequest, JobResult
from scripts.pipeline import process_application_text
from scripts.preprocess import preprocess_text
from scripts.semantic_similarity import get_semantic_similarity as get_similarity

app = FastAPI(title="Applica-Smart ML API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JOBS_PATH = os.path.join(os.path.dirname(__file__), "..", "jobs.json")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/pipeline/analyze", response_model=AnalyzeResponse)
def analyze_single(req: AnalyzeRequest):
    """Analyze one resume text against one job description."""
    try:
        result = process_application_text(
            resume_text=req.resume_text,
            job_description_text=req.job_description,
            job_title=req.job_title,
            company=req.company,
        )
        return AnalyzeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pipeline/analyze-batch", response_model=list[JobResult])
def analyze_batch(req: BatchAnalyzeRequest):
    """Score resume against all jobs in jobs.json, return top 5 with cover letters."""
    if not os.path.exists(JOBS_PATH):
        raise HTTPException(
            status_code=404,
            detail="jobs.json not found — run the scraper first: cd FYP/job_scraper && node main_scraper.js"
        )
    with open(JOBS_PATH, "r", encoding="utf-8") as f:
        jobs = json.load(f)

    cleaned_resume = preprocess_text(req.resume_text)

    scored = []
    for job in jobs:
        jd = job.get("description", "")
        if not jd or len(jd) < 50:
            continue
        cleaned_jd = preprocess_text(jd)
        try:
            score = float(get_similarity(cleaned_resume, cleaned_jd))
        except Exception:
            score = 0.0
        scored.append({"job": job, "score": score})

    scored.sort(key=lambda x: x["score"], reverse=True)
    top = scored[:5]

    results = []
    for idx, item in enumerate(top):
        job = item["job"]
        output = process_application_text(
            resume_text=req.resume_text,
            job_description_text=job.get("description", ""),
            job_title=job.get("title"),
            company=job.get("company"),
        )
        cover_letter = output["cover_letter"] if idx < 3 else "Not generated (only top 3)"
        results.append(JobResult(
            title=job.get("title"),
            company=job.get("company"),
            similarity=output["similarity"],
            recommendation=output["recommendation"],
            cover_letter=cover_letter,
            cover_letter_file=None,
        ))

    return results


@app.get("/api/jobs", response_model=list[dict])
def get_jobs():
    """Return raw jobs from jobs.json."""
    if not os.path.exists(JOBS_PATH):
        raise HTTPException(status_code=404, detail="jobs.json not found")
    with open(JOBS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)
```

- [ ] **Step 5: Start server and verify**

```bash
cd FYP
uvicorn api.server:app --reload --port 8000
```

Expected output includes: `INFO: Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)`

Open `http://127.0.0.1:8000/docs` in browser. FastAPI Swagger UI should appear with three endpoints: `/health`, `/api/pipeline/analyze`, `/api/pipeline/analyze-batch`.

- [ ] **Step 6: Test /health**

```bash
curl http://localhost:8000/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 7: Commit**

```bash
git add FYP/api/
git commit -m "feat: FastAPI bridge — exposes ML pipeline over HTTP for frontend integration"
```

---

## Phase 5: Frontend–Backend Integration

### Task 11: Add pipeline service, JobCard, and Jobs page

**Files:**
- Create: `src/services/pipeline.service.ts`
- Create: `src/components/jobs/JobCard.tsx`
- Create: `src/pages/Jobs.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/dashboard/DashboardNavbar.tsx`

- [ ] **Step 1: Create pipeline.service.ts**

Create `src/services/pipeline.service.ts`:

```typescript
const API_BASE = import.meta.env.VITE_ML_API_URL || "http://localhost:8000";

export interface JobAnalysis {
  title: string | null;
  company: string | null;
  similarity: number;
  recommendation: string;
  cover_letter: string;
  cover_letter_file: string | null;
}

export interface SingleAnalysis {
  resume_skills: string[];
  jd_skills: string[];
  missing_skills: string[];
  similarity: number;
  cover_letter: string;
  recommendation: string;
  applicant_name: string;
  job_title: string;
  company: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail: string }).detail ?? "API error");
  }
  return res.json();
}

export const pipelineService = {
  async analyzeSingle(
    resumeText: string,
    jobDescription: string,
    jobTitle?: string,
    company?: string
  ): Promise<SingleAnalysis> {
    return post("/api/pipeline/analyze", {
      resume_text: resumeText,
      job_description: jobDescription,
      job_title: jobTitle,
      company,
    });
  },

  async analyzeBatch(resumeText: string): Promise<JobAnalysis[]> {
    return post("/api/pipeline/analyze-batch", { resume_text: resumeText });
  },
};
```

- [ ] **Step 2: Create JobCard.tsx**

Create `src/components/jobs/JobCard.tsx`:

```tsx
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { JobAnalysis } from "../../services/pipeline.service";

interface Props {
  job: JobAnalysis;
  rank: number;
}

const recommendationColor: Record<string, string> = {
  "STRONG MATCH – Recommended to Apply": "#16a34a",
  "MODERATE MATCH – You Can Apply": "#ca8a04",
  "WEAK MATCH – Not Recommended": "#dc2626",
};

const JobCard = ({ job, rank }: Props) => {
  const [showLetter, setShowLetter] = useState(false);

  return (
    <div
      className="rounded-xl p-5 shadow-sm border mb-4"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-accent-light)",
      }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded mr-2"
            style={{
              backgroundColor: "var(--color-accent-light)",
              color: "var(--color-primary)",
            }}
          >
            #{rank}
          </span>
          <span className="font-bold text-lg" style={{ color: "var(--color-text-main)" }}>
            {job.title ?? "Unknown Position"}
          </span>
          {job.company && (
            <span className="ml-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              @ {job.company}
            </span>
          )}
        </div>
        <span className="text-sm font-semibold" style={{ color: "var(--color-text-main)" }}>
          {Math.round(job.similarity * 100)}% match
        </span>
      </div>

      <p
        className="text-sm mt-2 font-medium"
        style={{ color: recommendationColor[job.recommendation] ?? "var(--color-text-muted)" }}
      >
        {job.recommendation}
      </p>

      {job.cover_letter !== "Not generated (only top 3)" && (
        <button
          onClick={() => setShowLetter(!showLetter)}
          className="mt-3 flex items-center gap-1 text-sm font-medium"
          style={{ color: "var(--color-primary)" }}
        >
          {showLetter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showLetter ? "Hide cover letter" : "View cover letter"}
        </button>
      )}

      {showLetter && (
        <pre
          className="mt-3 text-sm whitespace-pre-wrap rounded-lg p-4"
          style={{
            backgroundColor: "var(--color-background)",
            color: "var(--color-text-body)",
            fontFamily: "inherit",
          }}
        >
          {job.cover_letter}
        </pre>
      )}
    </div>
  );
};

export default JobCard;
```

- [ ] **Step 3: Create Jobs.tsx**

Create `src/pages/Jobs.tsx`:

```tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { pipelineService, type JobAnalysis } from "../services/pipeline.service";
import type { Profile } from "../lib/supabase";
import JobCard from "../components/jobs/JobCard";
import Button from "../components/ui/Button";

function profileToText(profile: Profile): string {
  const lines: string[] = [];
  if (profile.name) lines.push(profile.name);
  if (profile.email) lines.push(profile.email);
  if (profile.phone) lines.push(profile.phone);
  if (profile.bio) lines.push("\n" + profile.bio);
  if (profile.skills?.length) lines.push("\nSkills: " + profile.skills.join(", "));
  if (profile.experience?.length) {
    lines.push("\nExperience:");
    profile.experience.forEach((e) => {
      lines.push(
        `${e.position} at ${e.company} (${e.startDate} - ${e.endDate ?? "Present"})`
      );
      if (e.description) lines.push(e.description);
    });
  }
  if (profile.education?.length) {
    lines.push("\nEducation:");
    profile.education.forEach((ed) => {
      lines.push(`${ed.level} - ${ed.institutionName} (${ed.startYear} - ${ed.endYear})`);
    });
  }
  return lines.join("\n");
}

const Jobs = () => {
  const { profile } = useAuth();
  const [results, setResults] = useState<JobAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const data = await pipelineService.analyzeBatch(profileToText(profile));
      setResults(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze. Is the ML server running on port 8000?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen p-4 sm:p-6 md:p-8"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--color-text-main)" }}
          >
            Job Recommendations
          </h1>
          <p className="mb-6" style={{ color: "var(--color-text-muted)" }}>
            Run the ML pipeline to find jobs from the scraped board that best match
            your profile. Ollama must be running locally for cover letter generation.
          </p>

          {!profile && (
            <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
              Complete your profile first to get personalized recommendations.
            </p>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={!profile || loading}
            variant="primary"
            className="flex items-center gap-2 mb-6"
          >
            <Zap className="w-4 h-4" />
            {loading ? "Analyzing…" : "Find Matching Jobs"}
          </Button>

          {error && (
            <div className="rounded-lg p-4 mb-6 border" style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
              <p className="text-sm" style={{ color: "#b91c1c" }}>{error}</p>
            </div>
          )}

          {results.length > 0 && (
            <div>
              <p
                className="text-sm mb-4 font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                Top {results.length} matches (cover letters generated for top 3):
              </p>
              {results.map((job, i) => (
                <JobCard key={i} job={job} rank={i + 1} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Jobs;
```

- [ ] **Step 4: Add /jobs route to App.tsx**

In `src/App.tsx`, add the import and route:

```tsx
import Jobs from "./pages/Jobs";
```

Inside the dashboard `<Route element={<DashboardLayout />}>` block, add:
```tsx
              <Route path="/jobs" element={<Jobs />} />
```

The full dashboard block becomes:
```tsx
            {/* Protected/Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/applications" element={<Dashboard />} />
              <Route path="/resume" element={<CVGenerator />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/jobs" element={<Jobs />} />
            </Route>
```

- [ ] **Step 5: Add Jobs link to DashboardNavbar**

In `src/components/dashboard/DashboardNavbar.tsx`, add `Search` to the lucide-react import:
```tsx
import {
  LayoutDashboard, Briefcase, FileText, Settings, User, LogOut,
  Menu, X, Bell, Search,
} from "lucide-react";
```

Add to `navLinks` array after the `Resume` entry:
```tsx
    { label: "Jobs", href: "/jobs", icon: Search },
```

- [ ] **Step 6: Add VITE_ML_API_URL to .env**

Open your `.env` file and add:
```
VITE_ML_API_URL=http://localhost:8000
```

- [ ] **Step 7: Integration test**

1. Start Ollama: ensure `ollama run mistral` has been pulled
2. Start FastAPI: `cd FYP && uvicorn api.server:app --reload --port 8000`
3. Start frontend: `npm run dev` (from project root)
4. Log in, navigate to `/jobs`
5. Click "Find Matching Jobs"
6. Confirm job cards appear with similarity scores, recommendations, and expandable cover letters

- [ ] **Step 8: Commit**

```bash
git add src/services/pipeline.service.ts src/components/jobs/ src/pages/Jobs.tsx src/App.tsx src/components/dashboard/DashboardNavbar.tsx
git commit -m "feat: Jobs page — ML pipeline integration with job recommendations and cover letters"
```

---

## Self-Review

### Spec Coverage

| Audit item | Task |
|---|---|
| Delete axiosInstance.ts / apiRoutes.ts | Task 2 |
| Delete dead FYP scripts | Task 2 |
| Untrack node_modules / venv from git | Task 1 |
| Fix DashboardLayout hardcoded bg | Task 3 |
| Fix ProtectedRoute hardcoded colors | Task 3 |
| Replace alert() in CVGenerator | Task 4 |
| Remove console.logs from useAuth / ProtectedRoute | Task 5 |
| Fix duplicate profile fetch | Task 5 |
| Remove setTimeout logout hack | Task 5 |
| supabase.ts friendly env error | Task 6 |
| Error boundary around dashboard | Task 7 |
| Wire Dashboard stats to real data | Task 7 |
| Clean pipeline.py dead code + indentation | Task 8 |
| Add process_application_text for API use | Task 8 |
| Simplify skill_extractor.py | Task 9 |
| Build FastAPI bridge | Task 10 |
| Frontend calls ML pipeline | Task 11 |
| Integration story: decided and built | Tasks 10–11 |

### Type Consistency

- `JobAnalysis` in `pipeline.service.ts` matches `JobResult` Pydantic model field names exactly (`title`, `company`, `similarity`, `recommendation`, `cover_letter`, `cover_letter_file`)
- `AnalyzeResponse` Pydantic fields match `process_application_text` return dict keys exactly
- `profileToText` in `Jobs.tsx` consumes `Profile` from `src/lib/supabase.ts` — uses only fields confirmed to exist: `name`, `email`, `phone`, `bio`, `skills`, `experience`, `education`

---

## Running Order Reference

```
Phase 1 (hygiene)
    ↓
Phase 2 (frontend) ←→ Phase 3 (backend ML)   ← parallel OK
         ↓                     ↓
    Phase 5 ←────── Phase 4 (FastAPI)
```

Start Ollama before running the full integration test in Task 11:
```bash
ollama pull mistral   # first time only
ollama run mistral    # keep running in background
```
