import React from "react";
import { pdf } from "@react-pdf/renderer";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/supabase";

export type CVTemplate =
  | "modern"
  | "classic"
  | "minimal"
  | "executive"
  | "creative"
  | "ats"
  | "compact";

export type TemplateCategory =
  | "all"
  | "modern"
  | "traditional"
  | "creative"
  | "executive"
  | "ats"
  | "compact";

export interface CVTemplateOption {
  id: CVTemplate;
  name: string;
  description: string;
  preview: string;
  category: Exclude<TemplateCategory, "all">;
  bestFor: string[];
  accentColor: string;
}

export const templateCategories: { id: TemplateCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "modern", label: "Modern" },
  { id: "traditional", label: "Traditional" },
  { id: "creative", label: "Creative" },
  { id: "executive", label: "Executive" },
  { id: "ats", label: "ATS-Friendly" },
  { id: "compact", label: "Compact" },
];

export const availableTemplates: CVTemplateOption[] = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean and contemporary design with color accents",
    preview: "/templates/modern-preview.png",
    category: "modern",
    bestFor: ["Software", "Product", "Marketing"],
    accentColor: "#1e3a5f",
  },
  {
    id: "classic",
    name: "Classic Traditional",
    description: "Timeless and formal layout for traditional industries",
    preview: "/templates/classic-preview.png",
    category: "traditional",
    bestFor: ["Finance", "Law", "Academia"],
    accentColor: "#111827",
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Simple and elegant design with maximum readability",
    preview: "/templates/minimal-preview.png",
    category: "modern",
    bestFor: ["Design", "Writing", "Consulting"],
    accentColor: "#374151",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Formal navy & gold layout for senior roles and traditional industries",
    preview: "/templates/executive-preview.png",
    category: "executive",
    bestFor: ["Senior leadership", "Banking", "Operations"],
    accentColor: "#1e3a8a",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Vibrant accent palette for design, marketing, and product roles",
    preview: "/templates/creative-preview.png",
    category: "creative",
    bestFor: ["Design", "Marketing", "Media"],
    accentColor: "#C1121F",
  },
  {
    id: "ats",
    name: "ATS-Optimized",
    description: "Plain single-column layout designed to pass automated resume screeners",
    preview: "/templates/ats-preview.png",
    category: "ats",
    bestFor: ["High-volume applications", "Large companies"],
    accentColor: "#000000",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Two-column dense layout that fits a strong career on a single page",
    preview: "/templates/compact-preview.png",
    category: "compact",
    bestFor: ["Senior IC", "Long careers", "One-page mandates"],
    accentColor: "#780000",
  },
];

class CVService {
  /**
   * Generate CV PDF blob from profile data
   */
  async generateCVBlob(
    profile: Profile,
    templateId: CVTemplate
  ): Promise<Blob> {
    try {
      // Dynamically import the selected template and generate PDF
      let blob: Blob;

      switch (templateId) {
        case "modern": {
          const { ModernTemplate } = await import(
            "../components/cv/templates/ModernTemplate"
          );
          const doc = React.createElement(ModernTemplate, { profile });
          blob = await pdf(doc as any).toBlob();
          break;
        }
        case "classic": {
          const { ClassicTemplate } = await import(
            "../components/cv/templates/ClassicTemplate"
          );
          const doc = React.createElement(ClassicTemplate, { profile });
          blob = await pdf(doc as any).toBlob();
          break;
        }
        case "minimal": {
          const { MinimalTemplate } = await import(
            "../components/cv/templates/MinimalTemplate"
          );
          const doc = React.createElement(MinimalTemplate, { profile });
          blob = await pdf(doc as any).toBlob();
          break;
        }
        case "executive": {
          const { ExecutiveTemplate } = await import(
            "../components/cv/templates/ExecutiveTemplate"
          );
          const doc = React.createElement(ExecutiveTemplate, { profile });
          blob = await pdf(doc as any).toBlob();
          break;
        }
        case "creative": {
          const { CreativeTemplate } = await import(
            "../components/cv/templates/CreativeTemplate"
          );
          const doc = React.createElement(CreativeTemplate, { profile });
          blob = await pdf(doc as any).toBlob();
          break;
        }
        case "ats": {
          const { ATSTemplate } = await import(
            "../components/cv/templates/ATSTemplate"
          );
          const doc = React.createElement(ATSTemplate, { profile });
          blob = await pdf(doc as any).toBlob();
          break;
        }
        case "compact": {
          const { CompactTemplate } = await import(
            "../components/cv/templates/CompactTemplate"
          );
          const doc = React.createElement(CompactTemplate, { profile });
          blob = await pdf(doc as any).toBlob();
          break;
        }
        default:
          throw new Error(`Unknown template: ${templateId}`);
      }

      return blob;
    } catch (error) {
      console.error("Error generating CV:", error);
      throw error;
    }
  }

  /**
   * Download CV as PDF file
   */
  async downloadCV(
    profile: Profile,
    templateId: CVTemplate,
    fileName?: string
  ): Promise<void> {
    try {
      const blob = await this.generateCVBlob(profile, templateId);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        fileName || `${profile.name?.replace(/\s+/g, "_")}_CV.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CV:", error);
      throw error;
    }
  }

  /**
   * Upload CV to Supabase storage
   */
  async uploadCV(
    userId: string,
    profile: Profile,
    templateId: CVTemplate
  ): Promise<string> {
    try {
      const blob = await this.generateCVBlob(profile, templateId);

      // Upload to Supabase storage
      const fileName = `${userId}/${Date.now()}_CV.pdf`;
      const { data, error } = await supabase.storage
        .from("cvs")
        .upload(fileName, blob, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("cvs").getPublicUrl(data.path);

      // Update profile with CV link
      await supabase
        .from("profiles")
        .update({ cv_link: publicUrl })
        .eq("id", userId);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading CV:", error);
      throw error;
    }
  }

  /**
   * Save CV document record to database
   */
  async saveCVRecord(
    userId: string,
    templateId: CVTemplate,
    fileUrl: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from("cv_documents").insert({
        user_id: userId,
        template_used: templateId,
        file_url: fileUrl,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving CV record:", error);
      throw error;
    }
  }

  /**
   * Get user's CV history
   */
  async getCVHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from("cv_documents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching CV history:", error);
      throw error;
    }
  }
}

export const cvService = new CVService();
