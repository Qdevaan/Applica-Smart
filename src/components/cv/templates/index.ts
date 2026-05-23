import type { ComponentType } from "react";
import type { Profile } from "../../../lib/supabase";

export type TemplateCategory =
  | "all"
  | "modern"
  | "traditional"
  | "creative"
  | "executive"
  | "ats"
  | "compact"
  | "technical"
  | "academic"
  | "elegant";

export type TemplateId =
  | "modern"
  | "classic"
  | "minimal"
  | "executive"
  | "creative"
  | "ats"
  | "compact"
  // new
  | "timeline"
  | "sidebar-color"
  | "academic"
  | "infographic"
  | "photo-header"
  | "dev"
  | "editorial"
  | "portfolio"
  | "elegant"
  | "gradient";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  preview: string;
  category: Exclude<TemplateCategory, "all">;
  bestFor: string[];
  accentColor: string;
  needsPhoto?: boolean;
  loader: () => Promise<{ default: ComponentType<{ profile: Profile }> } | { [k: string]: ComponentType<{ profile: Profile }> }>;
  exportName: string; // named export to pull off the module
}

export const templateCategories: { id: TemplateCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "modern", label: "Modern" },
  { id: "traditional", label: "Traditional" },
  { id: "creative", label: "Creative" },
  { id: "executive", label: "Executive" },
  { id: "ats", label: "ATS-Friendly" },
  { id: "compact", label: "Compact" },
  { id: "technical", label: "Technical" },
  { id: "academic", label: "Academic" },
  { id: "elegant", label: "Elegant" },
];

export const templates: TemplateMeta[] = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean and contemporary design with color accents",
    preview: "/templates/modern-preview.png",
    category: "modern",
    bestFor: ["Software", "Product", "Marketing"],
    accentColor: "#1e3a5f",
    loader: () => import("./ModernTemplate"),
    exportName: "ModernTemplate",
  },
  {
    id: "classic",
    name: "Classic Traditional",
    description: "Timeless and formal layout for traditional industries",
    preview: "/templates/classic-preview.png",
    category: "traditional",
    bestFor: ["Finance", "Law", "Academia"],
    accentColor: "#111827",
    loader: () => import("./ClassicTemplate"),
    exportName: "ClassicTemplate",
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Simple and elegant design with maximum readability",
    preview: "/templates/minimal-preview.png",
    category: "modern",
    bestFor: ["Design", "Writing", "Consulting"],
    accentColor: "#374151",
    loader: () => import("./MinimalTemplate"),
    exportName: "MinimalTemplate",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Formal navy & gold layout for senior roles and traditional industries",
    preview: "/templates/executive-preview.png",
    category: "executive",
    bestFor: ["Senior leadership", "Banking", "Operations"],
    accentColor: "#1e3a8a",
    loader: () => import("./ExecutiveTemplate"),
    exportName: "ExecutiveTemplate",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Vibrant accent palette for design, marketing, and product roles",
    preview: "/templates/creative-preview.png",
    category: "creative",
    bestFor: ["Design", "Marketing", "Media"],
    accentColor: "#C1121F",
    loader: () => import("./CreativeTemplate"),
    exportName: "CreativeTemplate",
  },
  {
    id: "ats",
    name: "ATS-Optimized",
    description: "Plain single-column layout designed to pass automated resume screeners",
    preview: "/templates/ats-preview.png",
    category: "ats",
    bestFor: ["High-volume applications", "Large companies"],
    accentColor: "#000000",
    loader: () => import("./ATSTemplate"),
    exportName: "ATSTemplate",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Two-column dense layout that fits a strong career on a single page",
    preview: "/templates/compact-preview.png",
    category: "compact",
    bestFor: ["Senior IC", "Long careers", "One-page mandates"],
    accentColor: "#780000",
    loader: () => import("./CompactTemplate"),
    exportName: "CompactTemplate",
  },
  {
    id: "elegant",
    name: "Elegant Serif",
    description: "Refined consulting/executive layout with gold accents and centered serif typography",
    preview: "/templates/elegant-preview.png",
    category: "elegant",
    bestFor: ["Consulting", "Executive search", "Legal", "Diplomacy"],
    accentColor: "#b8860b",
    loader: () => import("./ElegantSerifTemplate"),
    exportName: "ElegantSerifTemplate",
  },
  {
    id: "editorial",
    name: "Magazine Editorial",
    description: "Magazine-style layout with drop caps, pull quotes, and numbered sections",
    preview: "/templates/editorial-preview.png",
    category: "creative",
    bestFor: ["Editorial", "PR", "Brand", "Writing"],
    accentColor: "#7f1d1d",
    loader: () => import("./EditorialTemplate"),
    exportName: "EditorialTemplate",
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Vertical-spine timeline showing chronology of experience and education",
    preview: "/templates/timeline-preview.png",
    category: "modern",
    bestFor: ["Career storytelling", "Long careers", "Startups"],
    accentColor: "#0f172a",
    loader: () => import("./TimelineTemplate"),
    exportName: "TimelineTemplate",
  },
  {
    id: "gradient",
    name: "Bold Gradient",
    description: "Gradient header band, pill skills, modern startup vibe",
    preview: "/templates/gradient-preview.png",
    category: "modern",
    bestFor: ["Startups", "Product", "Growth"],
    accentColor: "#4f46e5",
    loader: () => import("./GradientTemplate"),
    exportName: "GradientTemplate",
  },
  {
    id: "sidebar-color",
    name: "Sidebar Color Block",
    description: "Full-color left sidebar with photo or initials, white content column",
    preview: "/templates/sidebar-color-preview.png",
    category: "modern",
    bestFor: ["Software", "Product", "Operations"],
    accentColor: "#0f766e",
    needsPhoto: true,
    loader: () => import("./SidebarColorTemplate"),
    exportName: "SidebarColorTemplate",
  },
  {
    id: "photo-header",
    name: "Photo Header",
    description: "Banner header with circular profile photo, EU/international style",
    preview: "/templates/photo-header-preview.png",
    category: "modern",
    bestFor: ["EU jobs", "International", "Public sector"],
    accentColor: "#1e40af",
    needsPhoto: true,
    loader: () => import("./PhotoHeaderTemplate"),
    exportName: "PhotoHeaderTemplate",
  },
  {
    id: "dev",
    name: "Tech / Developer",
    description: "Monospace headers, GitHub-style contribution grid, project cards",
    preview: "/templates/dev-preview.png",
    category: "technical",
    bestFor: ["Software", "DevOps", "ML/AI"],
    accentColor: "#10b981",
    loader: () => import("./DevTemplate"),
    exportName: "DevTemplate",
  },
  {
    id: "portfolio",
    name: "Designer Portfolio",
    description: "Bold typography with project thumbnail grid for designers",
    preview: "/templates/portfolio-preview.png",
    category: "creative",
    bestFor: ["Design", "UX", "Brand", "Illustration"],
    accentColor: "#ec4899",
    loader: () => import("./PortfolioTemplate"),
    exportName: "PortfolioTemplate",
  },
  {
    id: "academic",
    name: "Academic CV",
    description: "Dense black-and-white serif layout with publications, grants, and citations",
    preview: "/templates/academic-preview.png",
    category: "academic",
    bestFor: ["Research", "Faculty", "Postdoc", "PhD applications"],
    accentColor: "#000000",
    loader: () => import("./AcademicTemplate"),
    exportName: "AcademicTemplate",
  },
  {
    id: "infographic",
    name: "Infographic",
    description: "Skill bars and language proficiency rings, visual-first layout",
    preview: "/templates/infographic-preview.png",
    category: "creative",
    bestFor: ["Marketing", "Sales", "Customer Success"],
    accentColor: "#f59e0b",
    loader: () => import("./InfographicTemplate"),
    exportName: "InfographicTemplate",
  },
];

export function getTemplate(id: string): TemplateMeta | undefined {
  return templates.find((t) => t.id === id);
}

export async function loadTemplateComponent(
  id: TemplateId
): Promise<ComponentType<{ profile: Profile }> | undefined> {
  const meta = getTemplate(id);
  if (!meta) return undefined;
  const mod = await meta.loader();
  // Try named export first, then default
  const Comp =
    (mod as Record<string, ComponentType<{ profile: Profile }>>)[meta.exportName] ??
    (mod as { default?: ComponentType<{ profile: Profile }> }).default;
  return Comp;
}
