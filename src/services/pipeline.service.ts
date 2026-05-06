const API_BASE = import.meta.env.VITE_ML_API_URL || "http://localhost:8000";

export interface SkillGap {
  matched: string[];
  missing: string[];
  extra: string[];
}

export interface JobAnalysis {
  title: string | null;
  company: string | null;
  similarity: number;
  recommendation: string;
  cover_letter: string;
  cover_letter_source?: "llm" | "template" | null;
  cover_letter_file?: string | null;
}

export interface JobMatch {
  title: string | null;
  company: string | null;
  description: string | null;
  url: string | null;
  similarity: number;
  recommendation: string;
  skill_gap: SkillGap;
  cover_letter: string | null;
  cover_letter_source: "llm" | "template" | null;
}

export interface MatchResponse {
  matches: JobMatch[];
  total_jobs_considered: number;
}

export interface SingleAnalysis {
  job_title: string;
  company: string;
  applicant_name: string;
  similarity: number;
  recommendation: string;
  resume_skills: string[];
  jd_skills: string[];
  skill_gap: SkillGap;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail?: string }).detail ?? `API error ${res.status}`);
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
    return postJson("/v1/resumes/analyze", {
      resume_text: resumeText,
      job_description: jobDescription,
      job_title: jobTitle,
      company,
    });
  },

  async match(resumeText: string, topK = 5, generateLettersForTop = 3): Promise<MatchResponse> {
    return postJson("/v1/jobs/match", {
      resume_text: resumeText,
      top_k: topK,
      generate_letters_for_top: generateLettersForTop,
    });
  },

  // Convenience wrapper kept for the legacy `JobsPage` UI which expects a flat
  // list of `JobAnalysis`. Drops the empty-cover-letter sentinel entries beyond
  // the top-N where letters are generated.
  async analyzeBatch(resumeText: string): Promise<JobAnalysis[]> {
    const result = await this.match(resumeText);
    return result.matches.map((m) => ({
      title: m.title,
      company: m.company,
      similarity: m.similarity,
      recommendation: m.recommendation,
      cover_letter: m.cover_letter ?? "Not generated (only top 3)",
      cover_letter_source: m.cover_letter_source,
      cover_letter_file: null,
    }));
  },

  async health(): Promise<{ status: string; components: Record<string, string> }> {
    const res = await fetch(`${API_BASE}/readyz`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json();
  },
};
