// JSON Resume v1.0.0 spec — mirrors api/schemas.py on the backend.
// https://jsonresume.org/schema

export interface JRLocation {
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  countryCode?: string | null;
  region?: string | null;
}

export interface JRProfile {
  network?: string | null;
  username?: string | null;
  url?: string | null;
}

export interface JRBasics {
  name?: string | null;
  label?: string | null;
  image?: string | null;
  email?: string | null;
  phone?: string | null;
  url?: string | null;
  summary?: string | null;
  location?: JRLocation | null;
  profiles?: JRProfile[];
}

export interface JRWork {
  name?: string | null;
  position?: string | null;
  url?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  summary?: string | null;
  highlights?: string[];
}

export interface JREducation {
  institution?: string | null;
  url?: string | null;
  area?: string | null;
  studyType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  score?: string | null;
  courses?: string[];
}

export interface JRSkill {
  name: string;
  level?: string | null;
  keywords?: string[];
}

export interface JRProject {
  name?: string | null;
  description?: string | null;
  highlights?: string[];
  keywords?: string[];
  startDate?: string | null;
  endDate?: string | null;
  url?: string | null;
}

export interface JRAward {
  title?: string | null;
  date?: string | null;
  awarder?: string | null;
  summary?: string | null;
}

export interface JRCertificate {
  name?: string | null;
  date?: string | null;
  issuer?: string | null;
  url?: string | null;
}

export interface JRLanguage {
  language?: string | null;
  fluency?: string | null;
}

export interface JRInterest {
  name?: string | null;
  keywords?: string[];
}

export interface JsonResume {
  basics: JRBasics;
  work: JRWork[];
  education: JREducation[];
  skills: JRSkill[];
  projects: JRProject[];
  awards: JRAward[];
  certificates: JRCertificate[];
  languages: JRLanguage[];
  interests: JRInterest[];
  references: unknown[];
  volunteer: unknown[];
  publications: unknown[];
  meta: { canonical?: string; version?: string; lastModified?: string };
}

export interface ParseResumeResponse {
  resume: JsonResume;
  raw_text: string;
  parser: "llm" | "heuristic";
}
