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
