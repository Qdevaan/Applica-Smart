import React from "react";
import { pdf } from "@react-pdf/renderer";
import { supabase } from "../lib/supabase";
import type { CoverLetterData } from "../components/cover-letter/templates/ClassicLetter";

export type CoverLetterTemplate = "classic" | "modern" | "minimal";

export interface CoverLetterTemplateOption {
  id: CoverLetterTemplate;
  name: string;
  description: string;
}

export const availableCoverLetterTemplates: CoverLetterTemplateOption[] = [
  {
    id: "classic",
    name: "Classic Business Letter",
    description: "Traditional formal letter with sender block and date header",
  },
  {
    id: "modern",
    name: "Modern Header",
    description: "Navy & gold header bar with structured paragraphs",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean two-column header with quiet typography",
  },
];

const API_BASE = import.meta.env.VITE_ML_API_URL || "http://localhost:8000";

export interface GenerateCoverLetterParams {
  resumeText: string;
  jobDescription: string;
  jobTitle?: string;
  company?: string;
  applicantName?: string;
  tone?: "professional" | "enthusiastic" | "concise" | "narrative";
  wordTarget?: number;
}

export interface GeneratedCoverLetter {
  cover_letter: string;
  source: "llm" | "template";
  job_title: string;
  company: string;
  applicant_name: string;
}

class CoverLetterService {
  async generate(params: GenerateCoverLetterParams): Promise<GeneratedCoverLetter> {
    const res = await fetch(`${API_BASE}/v1/cover-letters/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_text: params.resumeText,
        job_description: params.jobDescription,
        job_title: params.jobTitle,
        company: params.company,
        applicant_name: params.applicantName,
        tone: params.tone ?? "professional",
        word_target: params.wordTarget ?? 220,
      }),
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      throw new Error(detail?.detail ?? `Cover letter API error ${res.status}`);
    }
    return res.json();
  }

  async renderPDF(template: CoverLetterTemplate, data: CoverLetterData): Promise<Blob> {
    switch (template) {
      case "classic": {
        const { ClassicLetter } = await import("../components/cover-letter/templates/ClassicLetter");
        return pdf(React.createElement(ClassicLetter, { data }) as any).toBlob();
      }
      case "modern": {
        const { ModernLetter } = await import("../components/cover-letter/templates/ModernLetter");
        return pdf(React.createElement(ModernLetter, { data }) as any).toBlob();
      }
      case "minimal": {
        const { MinimalLetter } = await import("../components/cover-letter/templates/MinimalLetter");
        return pdf(React.createElement(MinimalLetter, { data }) as any).toBlob();
      }
      default:
        throw new Error(`Unknown cover letter template: ${template}`);
    }
  }

  async download(template: CoverLetterTemplate, data: CoverLetterData, fileName?: string): Promise<void> {
    const blob = await this.renderPDF(template, data);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName ?? `${data.applicantName.replace(/\s+/g, "_")}_${data.company.replace(/\s+/g, "_")}_CoverLetter.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async upload(userId: string, template: CoverLetterTemplate, data: CoverLetterData): Promise<string> {
    const blob = await this.renderPDF(template, data);
    const path = `${userId}/${Date.now()}_${data.company.replace(/\s+/g, "_")}_CoverLetter.pdf`;

    const { data: uploaded, error } = await supabase.storage
      .from("cover_letters")
      .upload(path, blob, { contentType: "application/pdf", upsert: true });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from("cover_letters").getPublicUrl(uploaded.path);

    await supabase.from("cover_letter_documents").insert({
      user_id: userId,
      template_used: template,
      job_title: data.jobTitle,
      company: data.company,
      file_url: publicUrl,
      body: data.body,
    });

    return publicUrl;
  }
}

export const coverLetterService = new CoverLetterService();
