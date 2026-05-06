# Applica-Smart — Project Audit

> Audit date: 2026-05-06
> Scope: full repo (`src/` React frontend + `FYP/` Python+Node backend)

---

## 1. What This Project Does

Applica-Smart is a job-application assistant split into two **disconnected** subsystems:

### Frontend (`src/`) — React 19 + Vite + TypeScript
A SPA where a user signs up, fills out a profile (education / experience / skills / hobbies), then generates a downloadable PDF résumé using one of three templates (Modern / Classic / Minimal).

- **Auth + DB + Storage:** Supabase (`@supabase/supabase-js`)
- **Routing:** `react-router-dom` v7 with `RootLayout` (public) and `DashboardLayout` (protected via `ProtectedRoute`)
- **Forms:** `react-hook-form` + `zod` validators
- **PDF rendering:** `@react-pdf/renderer`, templates lazy-loaded per choice
- **Styling:** Tailwind v4 + CSS custom properties (`--color-primary`, etc.) for light/dark theming via `useTheme`
- **Animations:** `framer-motion`
- **Pages:** Landing, Login, SignUp, Dashboard (stats placeholder), Profile, Settings, CVGenerator, Applications (alias of Dashboard)

### Backend (`FYP/`) — Python ML pipeline + Node scrapers
A **CLI-only** research pipeline. No HTTP server runs.

1. `job_scraper/main_scraper.js` runs Puppeteer against RemoteOK / Freelancer / Guru → writes `jobs.json`
2. `scripts/pipeline.py`:
   - `pdf_extractor.py` (`pdfplumber`) → raw resume text
   - `preprocess.py` (`nltk`) → lower / strip / detok / stopwords
   - `skill_extractor.py` (`spaCy` + 29-word `TECH_SKILLS` keyword list)
   - `semantic_similarity.py` (`sentence-transformers` `all-MiniLM-L6-v2`, cosine sim)
   - `process_multiple_jobs(...)` ranks jobs by similarity and generates a cover letter for top-3 via local **Ollama** (`mistral` at `http://localhost:11434`)
   - Recommendation tiers: STRONG (≥0.70 + ≤2 missing skills) / MODERATE (≥0.40) / WEAK
3. Outputs land in `data/processed/*.txt` and `final_results.json`

### The integration that doesn't exist
`src/utils/axiosInstance.ts` points at `http://localhost:5000/api` and `src/utils/apiRoutes.ts` defines REST routes (`/applications/auto-apply/start`, etc.) — **nothing serves them**. `FYP/package.json` lists `express` but no server file exists. The frontend talks to Supabase only; FYP runs offline only.

---

## 2. The Good

### Frontend
- **Clean module boundaries.** `services/` (Supabase wrappers), `hooks/` (auth + theme contexts), `components/` (UI / auth / dashboard / cv / landing), `layouts/`, `pages/`, `utils/validators/`. Easy to navigate.
- **TypeScript everywhere**, strict configs in `tsconfig.app.json`.
- **Theme system done right** — single source of truth in `src/index.css` via CSS vars; `useTheme` toggles `.dark` class. Component-level reuse via `var(--color-*)`.
- **Form architecture** — `LoginFields` / `SignUpFields` split out, schemas in `utils/validators/`, integrated with `react-hook-form` + `zod` resolvers.
- **Lazy-loaded PDF templates** in `cv.service.ts` — keeps initial bundle smaller (`await import(...)` per template).
- **Auth context** (`useAuth.tsx`) handles session restore + `onAuthStateChange` subscription + non-blocking profile fetch.
- **`ProtectedRoute`** wraps `DashboardLayout` with a 5-second loading-stuck escape hatch.
- **CV pipeline end-to-end works:** profile → React-PDF → blob → download / Supabase storage → record in `cv_documents` table.
- **Animation polish** with framer-motion across landing, navbar, cv-generator, dashboard cards.

### Backend (FYP)
- **Right tool choices for the ML stack** — `sentence-transformers` cosine similarity is a real upgrade over the legacy TF-IDF (`similarity.py` is kept around but unused by `pipeline.py`).
- **Pipeline is functionally complete for a research demo:** PDF-in → ranked jobs + 3 cover letters out.
- **Filtering layer** (`process_multiple_jobs`) skips jobs <50 chars and ranks before generating expensive cover letters — only top-3 LLM calls.
- **Multi-source scraping** (RemoteOK, Freelancer, Guru) aggregated in `main_scraper.js`.
- **Heuristic fallbacks** for `extract_job_title` / `extract_company` / `extract_name_from_resume` when fields are missing.
- **Recommendation tiering** is simple and explainable.

---

## 3. The Bad

### Architecture / integration
- **Two systems, zero glue.** Frontend never calls FYP. `axiosInstance.ts` + `apiRoutes.ts` describe an API that doesn't exist. `BACKEND_API_GUIDE.md` documents endpoints no server implements. Either write the server (FastAPI/Express wrapper around `pipeline.py`) or delete the dead files.
- **Auto-apply is vapourware.** `apiRoutes.ts` declares `START_AUTO_APPLY` / `STOP_AUTO_APPLY` / `GET_AUTO_APPLY_STATUS` — no implementation anywhere.

### Frontend
- **`localStorage` auth dead code.** `axiosInstance.ts` reads `authToken` and on 401 redirects via `window.location.href = "/login"` (nukes React state). Real auth uses Supabase session cookies. Pick one.
- **Module-load throw.** `src/lib/supabase.ts:6` throws if env vars missing — whole app crashes white-screen instead of a friendly error.
- **`Dashboard.tsx` stats hardcoded** (47 / 28% / 15 / 5). No call to `jobApplicationService.getApplicationStats`.
- **`alert()` UX** in `CVGenerator.tsx` (download / save success/error). Project already has a `Toast` component — use it.
- **`pdf(doc as any)`** — escape-hatch typing in `cv.service.ts`.
- **Duplicate profile fetch** in `useAuth` — both `initializeAuth` and `onAuthStateChange` fire `getProfile` on initial load with the same session.
- **`signOut` setTimeout(100) hack** in `DashboardNavbar.tsx` to "ensure state is cleared" — masks a real ordering bug.
- **`DashboardLayout.tsx:8`** still uses hardcoded `bg-[#FDF0D5]` instead of `var(--color-background)` — breaks dark mode under the navbar.
- **Console-log spam** in `useAuth.tsx`, `ProtectedRoute.tsx` (~10 emoji-prefixed logs per render). Production noise.
- **No tests.** Zero `.test.ts(x)` files in `src/`.
- **`/applications` route reuses `<Dashboard />`** — placeholder.
- **One-line README.md.**

### Backend (FYP)
- **Hardcoded skill list** of 29 keywords in `skill_extractor.py`. spaCy is loaded but the token loop is redundant — the substring scan that follows already catches everything.
- **Brittle JD heuristics** in `extract_company` / `extract_job_title` — split on "at" + "we are", "join", etc. Will misfire on most real listings.
- **Ollama hard dependency.** `pipeline.py` POSTs to `localhost:11434` with model `mistral`. No retry, no fallback if Ollama is down — just `KeyError: 'response'`.
- **HuggingFace `flan-t5-base` loaded at import** (`pipeline.py:18`) but only used inside the unused `generate_cover_letter_hf`. Wastes ~250 MB RAM and slows startup.
- **Broken scripts shipped:**
  - `scripts/test.py:21` references `jobs` before it's defined.
  - `scripts/test_similarity.py` imports `preprocess_resume` / `preprocess_job_description` — these functions don't exist (`preprocess.py` only exports `clean_text` / `preprocess_text`).
- **Empty source files:** `model_training.py`, `ner.py` (1 line each). Empty dirs: `models/`, `notebook/`, `data/embeddings/`.
- **Scrapers fragile.** Puppeteer DOM selectors break when the sites redesign. `scraper.js` runs `headless: false` and `jobs.json` already contains `"description": "Error fetching description"` for the very first record — the live failure is committed.
- **`.slice(0, 10)`** in every scraper means max 30 jobs total ever.
- **Output artifacts committed** (`data/processed/cover_letter_*.txt`, `final_results.json`, `jobs.json`).

### Repo hygiene
- **Massive `node_modules/` and `venv/` checked in.** (Top-level `node_modules/` ~half a gig; `FYP/node_modules/`, `FYP/venv/` similar.)
- **Doc sprawl at root** — `BACKEND_API_GUIDE.md`, `CV_GENERATION_README.md`, `CV_IMPLEMENTATION_SUMMARY.md`, `PROJECT_SUMMARY.md`, `QUICK_START.md`, `SUPABASE_GUIDE.md`, `SUPABASE_INTEGRATION.md`. Most overlap or describe non-existent code.
- `.env` was tracked until commit `9f11219` ("Stop tracking .env file") — rotate any keys that were in there.

---

## 4. The Ugly

- **`pipeline.py` is a graveyard of cover-letter strategies.** Four different generators (`_pro`, `_llm`, `_hf`, `_mistral`); three are commented out at the call site. Worse: lines 118–145 are an orphan function body — the `def` was commented (`#def generate_cover_letter_llm`) but the body lives on as a top-level block of unreachable code with bare `template`, `prompt`, `chain.invoke(...)`. `langchain_core` / `langchain_openai` imports also commented out. **Delete the corpses.**

- **`process_multiple_jobs` indentation drift** (`pipeline.py:467-509`). Inside `for idx, item in enumerate(top_jobs):` the body is indented inconsistently (some lines start at column 5 rather than 4). Currently runs by accident because Python tolerates uniform-but-odd indents inside one block. One stray edit and the whole loop will throw `IndentationError`. Rewrite the loop with clean 4-space indents.

- **`spaCy` loaded for nothing.** `skill_extractor.py:1-19` loads `en_core_web_sm` solely to tokenize — but the multi-word substring loop right after (`for skill in TECH_SKILLS: if skill in text_lower`) already finds every entry in the list. Drop spaCy or actually use entity recognition.

- **`ProtectedRoute` is observability theatre.** ~15 `console.log` calls (with emojis) per render, plus `useEffect` that just logs the same state, plus a 5-second "auth probably stuck" forced redirect. The real bug it papers over is the duplicate fetch in `useAuth` — fix the cause.

- **Auth + token mismatch is a security smell.** `axiosInstance` interceptors imply a JWT-bearer flow; Supabase session lives in cookies/localStorage under a different key. If anyone wires up the missing backend without auditing this, they'll ship a system where the React app *thinks* it's authenticated but the server gets no token.

- **`jobs.json` committed with a known scrape failure** as the first entry (`"description": "Error fetching description"` for "Senior Frontend Developer / Sanctuary Computer"). This is presumably the demo input — a broken record breaks the demo.

- **`venv/` committed** means anyone who clones gets *your* machine's Windows-pathed Python virtualenv. It will not work on theirs and the directory weighs hundreds of MB.

- **CommonJS + ESM mix** — root `package.json` has `"type": "module"`, `FYP/package.json` is `"commonjs"`. Two `node_modules/` trees, two lockfiles. Pick a workspace strategy (npm workspaces / pnpm) or document the split.

- **Zero error boundaries.** A render crash anywhere in the dashboard tree blanks the page; combined with `supabase.ts` throwing at import, a missing env var = white screen with a console error.

---

## 5. Quick-win Punch List

Ordered by ROI.

1. **Delete dead code** — `axiosInstance.ts`, `apiRoutes.ts`, `similarity.py`, `model_training.py`, `ner.py`, the orphan block in `pipeline.py`, the unused `flan-t5` `generator` global.
2. **Add `node_modules/` and `venv/` to `.gitignore`** and `git rm --cached` them. (Verify `.gitignore` already excludes them; commit history still carries the bulk.)
3. **Fix `DashboardLayout` hardcoded background** → `var(--color-background)`.
4. **Replace `alert()`** in `CVGenerator` with the existing `Toast` component.
5. **Wire Dashboard stats** to `jobApplicationService.getApplicationStats(user.id)`.
6. **Strip console.logs** from `useAuth` and `ProtectedRoute`; deduplicate the profile fetch.
7. **Wrap `supabase.ts` env check** in a friendly error UI rather than a module-load throw.
8. **Fix `pipeline.py:467-509` indentation.** Make the loop deterministic.
9. **Consolidate root markdown** into this `documentation/` folder; keep `README.md` as the single entry point.
10. **Decide the integration story.** Either build the Express/FastAPI shim around `pipeline.py` and connect the React app, or remove the API illusion entirely. The current half-state is the worst option.
