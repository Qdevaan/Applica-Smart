import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabaseMisconfigured = !supabaseUrl || !supabaseAnonKey;

export const supabase = supabaseMisconfigured
  ? ({} as ReturnType<typeof createClient>)
  : createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Link {
  label: string;
  url: string;
  icon?: string;
}

export interface Project {
  id: string;
  name: string;
  role?: string;
  description?: string;
  link?: string;
  tech?: string[];
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
  credentialId?: string;
}

export type LanguageProficiency =
  | 'native'
  | 'fluent'
  | 'professional'
  | 'intermediate'
  | 'basic';

export interface Language {
  name: string;
  proficiency: LanguageProficiency;
}

export interface Publication {
  id: string;
  title: string;
  venue?: string;
  year?: string;
  url?: string;
  authors?: string[];
}

export interface Award {
  id: string;
  title: string;
  issuer?: string;
  year?: string;
  description?: string;
}

export interface Volunteer {
  id: string;
  organization: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ReferenceEntry {
  id: string;
  name: string;
  contact?: string;
  relation?: string;
}

export type SkillLevelValue = 1 | 2 | 3 | 4 | 5;
export interface SkillLevel {
  name: string;
  level: SkillLevelValue;
}

export interface TemplatePrefs {
  defaultTemplateId?: string;
  accentColor?: string;
}

export interface Profile {
  id: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  bio: string | null;
  education: Education[];
  skills: string[];
  experience: Experience[];
  hobbies: string[];
  preferences: string | null;
  cv_link: string | null;
  created_at: string;
  updated_at: string;

  // New optional fields (added 2026-05-07)
  photo_url?: string | null;
  accent_color?: string | null;
  skill_levels?: SkillLevel[];
  links?: Link[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  publications?: Publication[];
  awards?: Award[];
  volunteer?: Volunteer[];
  references_list?: ReferenceEntry[];
  template_prefs?: TemplatePrefs;
}

export interface Education {
  id?: string;
  level: 'school' | 'college' | 'university'; // Education level
  institutionName: string; // Name of institute
  startYear: string; // Starting year
  endYear: string; // Ending year (or "Present" if currently studying)
  
  // School specific
  schoolType?: 'matric' | 'olevels'; // Only for school
  schoolMarks?: string; // marks or percentage
  
  // College specific
  collegeProgram?: 'alevels' | 'premedical' | 'ics' | 'preengineering' | 'other'; // Only for college
  collegeMarks?: string;
  
  // University specific
  degree?: string; // Degree name
  degreeType?: 'bachelors' | 'masters' | 'phd' | 'diploma' | 'other';
  cgpa?: string;
  currentlyStudying?: boolean;
}

export interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  responsibilities?: string[];
}

export interface JobApplication {
  id: string;
  user_id: string;
  job_title: string | null;
  company: string | null;
  job_url: string | null;
  status: string;
  applied_at: string;
}

export interface CVDocument {
  id: string;
  user_id: string;
  template_used: string | null;
  file_url: string | null;
  created_at: string;
}
