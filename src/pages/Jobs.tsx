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
