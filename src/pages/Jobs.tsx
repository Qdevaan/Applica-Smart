import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { pipelineService, type JobAnalysis } from "../services/pipeline.service";
import type { Profile } from "../lib/supabase";
import JobCard from "../components/jobs/JobCard";
import Button from "../components/ui/Button";

const JOBS_CACHE_PREFIX = "applica:jobs:";

interface JobsCacheEntry {
  results: JobAnalysis[];
  fetchedAt: number;
}

const readJobsCache = (userId: string): JobsCacheEntry | null => {
  try {
    const raw = localStorage.getItem(JOBS_CACHE_PREFIX + userId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as JobsCacheEntry;
    if (!Array.isArray(parsed.results)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeJobsCache = (userId: string, results: JobAnalysis[]) => {
  try {
    const entry: JobsCacheEntry = { results, fetchedAt: Date.now() };
    localStorage.setItem(JOBS_CACHE_PREFIX + userId, JSON.stringify(entry));
  } catch {
    // storage full / disabled — ignore
  }
};

const formatFetchedAt = (ts: number): string => {
  const diffMs = Date.now() - ts;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

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
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached results once profile is available — survives page reloads / nav
  useEffect(() => {
    if (!profile?.id) return;
    const cached = readJobsCache(profile.id);
    if (cached) {
      setResults(cached.results);
      setFetchedAt(cached.fetchedAt);
    }
  }, [profile?.id]);

  const handleAnalyze = async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const data = await pipelineService.analyzeBatch(profileToText(profile));
      setResults(data);
      const now = Date.now();
      setFetchedAt(now);
      writeJobsCache(profile.id, data);
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

  const hasCached = results.length > 0;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{
              backgroundColor: "var(--color-accent-light)",
              color: "var(--color-primary)",
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Match
          </span>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3"
            style={{ color: "var(--color-text-main)" }}
          >
            Find Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#780000] to-[#C1121F]">
              Perfect Match
            </span>
          </h1>
          <p className="mb-6 text-base sm:text-lg" style={{ color: "var(--color-text-body)" }}>
            Run the ML pipeline to find jobs from the scraped board that best match
            your profile. Ollama must be running locally for cover letter generation.
          </p>

          {!profile && (
            <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
              Complete your profile first to get personalized recommendations.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button
              onClick={handleAnalyze}
              disabled={!profile || loading}
              variant="primary"
              className="flex items-center gap-2"
            >
              {hasCached ? (
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {loading
                ? "Analyzing…"
                : hasCached
                ? "Refresh Matches"
                : "Find Matching Jobs"}
            </Button>
            {hasCached && fetchedAt && !loading && (
              <span
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                Cached · last updated {formatFetchedAt(fetchedAt)}
              </span>
            )}
          </div>

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
