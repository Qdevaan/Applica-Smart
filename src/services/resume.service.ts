import type { JsonResume, ParseResumeResponse } from "../types/jsonResume";
import type { Profile, Education, Experience } from "../lib/supabase";
import { supabase } from "../lib/supabase";

const API_BASE = import.meta.env.VITE_ML_API_URL || "http://localhost:8000";

class ResumeService {
  async parseText(text: string): Promise<ParseResumeResponse> {
    const res = await fetch(`${API_BASE}/v1/resumes/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(await readError(res, "Resume parse failed"));
    return res.json();
  }

  async parseFile(file: File): Promise<ParseResumeResponse> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/v1/resumes/parse-file`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error(await readError(res, "Resume parse failed"));
    return res.json();
  }

  // Map the canonical JSON Resume returned by the backend onto the existing
  // Supabase Profile shape used by the React templates. Fields that have no
  // direct equivalent (volunteer, publications, references) are dropped on
  // purpose — extend Profile if you start consuming them.
  toProfile(jr: JsonResume, existing?: Partial<Profile>): Partial<Profile> {
    const basics = jr.basics ?? {};
    const address = [basics.location?.address, basics.location?.city, basics.location?.region]
      .filter(Boolean)
      .join(", ");

    return {
      ...existing,
      name: basics.name ?? existing?.name ?? null,
      email: basics.email ?? existing?.email ?? null,
      phone: basics.phone ?? existing?.phone ?? null,
      address: address || existing?.address || null,
      bio: basics.summary ?? existing?.bio ?? null,
      skills: (jr.skills ?? []).map((s) => s.name).filter(Boolean),
      experience: (jr.work ?? []).map<Experience>((w) => ({
        company: w.name ?? "",
        position: w.position ?? "",
        startDate: w.startDate ?? "",
        endDate: w.endDate ?? null,
        current: !w.endDate,
        description: w.summary ?? "",
        responsibilities: w.highlights ?? [],
      })),
      education: (jr.education ?? []).map<Education>((e) => ({
        level: "university",
        institutionName: e.institution ?? "",
        startYear: (e.startDate ?? "").slice(0, 4),
        endYear: (e.endDate ?? "").slice(0, 4) || "Present",
        degreeType: (e.studyType?.toLowerCase() as Education["degreeType"]) ?? "other",
        degree: e.area ?? "",
        cgpa: e.score ?? "",
      })),
      hobbies: (jr.interests ?? []).map((i) => i.name).filter(Boolean) as string[],
    };
  }

  async saveProfile(userId: string, patch: Partial<Profile>): Promise<void> {
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
    if (error) throw error;
  }

  async parseAndSave(userId: string, file: File, existing?: Partial<Profile>): Promise<{
    parsed: ParseResumeResponse;
    profilePatch: Partial<Profile>;
  }> {
    const parsed = await this.parseFile(file);
    const profilePatch = this.toProfile(parsed.resume, existing);
    await this.saveProfile(userId, profilePatch);
    return { parsed, profilePatch };
  }
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const err = await res.json();
    return err.detail ?? err.title ?? fallback;
  } catch {
    return fallback;
  }
}

export const resumeService = new ResumeService();
