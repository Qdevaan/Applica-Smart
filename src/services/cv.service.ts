import React from "react";
import { pdf } from "@react-pdf/renderer";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/supabase";
import {
  templates,
  templateCategories,
  loadTemplateComponent,
  type TemplateId,
  type TemplateCategory,
  type TemplateMeta,
} from "../components/cv/templates";

// Re-export for backward compat with existing imports
export type CVTemplate = TemplateId;
export type { TemplateCategory } from "../components/cv/templates";
export { templateCategories };

export interface CVTemplateOption {
  id: TemplateId;
  name: string;
  description: string;
  preview: string;
  category: Exclude<TemplateCategory, "all">;
  bestFor: string[];
  accentColor: string;
}

export const availableTemplates: CVTemplateOption[] = templates.map(
  ({ id, name, description, preview, category, bestFor, accentColor }: TemplateMeta) => ({
    id,
    name,
    description,
    preview,
    category,
    bestFor,
    accentColor,
  })
);

class CVService {
  /**
   * Generate CV PDF blob from profile data
   */
  async generateCVBlob(
    profile: Profile,
    templateId: CVTemplate
  ): Promise<Blob> {
    const Component = await loadTemplateComponent(templateId);
    if (!Component) {
      throw new Error(`Unknown CV template: ${templateId}`);
    }
    const doc = React.createElement(Component, { profile });
    // pdf() expects a DocumentElement; @react-pdf typings require any cast.
    return await pdf(doc as any).toBlob();
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
