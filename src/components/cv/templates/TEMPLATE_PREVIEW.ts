// Template Preview Component - For Testing Purposes Only
// This file demonstrates what each template looks like

import type { Profile } from "../../../lib/supabase";

// Sample data for preview
export const sampleProfile: Profile = {
  id: "sample-id",
  name: "John Doe",
  email: "john.doe@email.com",
  phone: "+1 (555) 123-4567",
  address: "San Francisco, CA",
  bio: "Experienced software engineer with a passion for building scalable web applications. Specialized in full-stack development with React, Node.js, and cloud technologies.",
  
  experience: [
    {
      id: "1",
      company: "Tech Company Inc.",
      position: "Senior Software Engineer",
      startDate: "2020-01",
      endDate: null,
      current: true,
      description: "Lead development of customer-facing web applications. Mentored junior developers and improved code quality through comprehensive testing.",
      responsibilities: [
        "Built scalable React applications",
        "Implemented CI/CD pipelines",
        "Reduced load time by 40%"
      ]
    },
    {
      id: "2",
      company: "Startup Solutions",
      position: "Full Stack Developer",
      startDate: "2018-06",
      endDate: "2019-12",
      current: false,
      description: "Developed and maintained multiple client projects using modern web technologies.",
    }
  ],
  
  education: [
    {
      id: "1",
      level: "university",
      institutionName: "University of California",
      startYear: "2014",
      endYear: "2018",
      degree: "Computer Science",
      degreeType: "bachelors",
      cgpa: "3.8",
    },
    {
      id: "2",
      level: "college",
      institutionName: "City College",
      startYear: "2012",
      endYear: "2014",
      collegeProgram: "ics",
      collegeMarks: "85%",
    },
    {
      id: "3",
      level: "school",
      institutionName: "Central High School",
      startYear: "2010",
      endYear: "2012",
      schoolType: "matric",
      schoolMarks: "90%",
    }
  ],
  
  skills: [
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "PostgreSQL",
    "AWS",
    "Docker",
    "Git",
    "REST APIs",
    "GraphQL"
  ],
  
  hobbies: [
    "Open Source Contributing",
    "Reading Tech Blogs",
    "Photography",
    "Hiking"
  ],

  photo_url: "https://i.pravatar.cc/300?u=applica-sample",
  accent_color: "#1e3a5f",

  skill_levels: [
    { name: "React", level: 5 },
    { name: "TypeScript", level: 5 },
    { name: "Node.js", level: 4 },
    { name: "Python", level: 4 },
    { name: "PostgreSQL", level: 4 },
    { name: "AWS", level: 3 },
    { name: "Docker", level: 3 },
    { name: "Git", level: 5 },
  ],

  links: [
    { label: "GitHub", url: "https://github.com/johndoe", icon: "github" },
    { label: "LinkedIn", url: "https://linkedin.com/in/johndoe", icon: "linkedin" },
    { label: "Portfolio", url: "https://johndoe.dev", icon: "globe" },
  ],

  projects: [
    {
      id: "p1",
      name: "Applica-Smart",
      role: "Lead Engineer",
      description: "AI-driven job application copilot with CV/cover-letter generation and recommendation pipeline.",
      link: "https://applica-smart.example",
      tech: ["React", "TypeScript", "Supabase", "Python"],
      startDate: "2025-06",
      endDate: "2026-05",
    },
    {
      id: "p2",
      name: "Open-Source Resume Kit",
      role: "Maintainer",
      description: "PDF resume primitives library used by 4k+ developers.",
      link: "https://github.com/johndoe/resume-kit",
      tech: ["TypeScript", "react-pdf", "Vite"],
      startDate: "2023-01",
      endDate: "2024-08",
    },
  ],

  certifications: [
    {
      id: "c1",
      name: "AWS Certified Solutions Architect — Associate",
      issuer: "Amazon Web Services",
      date: "2024-03",
      url: "https://aws.amazon.com/verification",
      credentialId: "AWS-SA-123456",
    },
  ],

  languages: [
    { name: "English", proficiency: "native" },
    { name: "Spanish", proficiency: "fluent" },
    { name: "Urdu", proficiency: "professional" },
  ],

  publications: [
    {
      id: "pub1",
      title: "Latency-bounded recommendation pipelines for skill-based job matching",
      venue: "IEEE BigData Workshops",
      year: "2024",
      url: "https://example.com/paper",
      authors: ["John Doe", "A. Smith", "B. Khan"],
    },
  ],

  awards: [
    {
      id: "a1",
      title: "Engineering Excellence Award",
      issuer: "Tech Company Inc.",
      year: "2023",
      description: "Top 1% of engineers globally for shipping platform-critical infra.",
    },
  ],

  volunteer: [
    {
      id: "v1",
      organization: "Code for All",
      role: "Mentor",
      startDate: "2022-09",
      endDate: "2024-06",
      description: "Mentored 12 junior devs through OSS contribution programs.",
    },
  ],

  references_list: [],
  template_prefs: { defaultTemplateId: "modern", accentColor: "#1e3a5f" },

  preferences: null,
  cv_link: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
};

/* 
TEMPLATE COMPARISON:

┌─────────────────────────────────────────────────────────────┐
│                      MODERN TEMPLATE                         │
├─────────────────────────────────────────────────────────────┤
│ JOHN DOE                                    [Bold, Large]   │
│ john.doe@email.com | +1555... | San Francisco [Small]      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    [Red Line]            │
│                                                              │
│ PROFESSIONAL SUMMARY                        [Red, Caps]     │
│ ────────────────────                                        │
│ Experienced software engineer with...      [Justified]      │
│                                                              │
│ WORK EXPERIENCE                             [Red, Caps]     │
│ ────────────────────                                        │
│ Senior Software Engineer                    [Bold]          │
│ Tech Company Inc.                           [Red]           │
│ 2020-01 - Present                          [Italic, Gray]   │
│ Lead development of customer-facing...                      │
│                                                              │
│ SKILLS                                      [Red, Caps]     │
│ ────────────────────                                        │
│ ┌──────┐ ┌────────────┐ ┌─────────┐      [Pill Tags]      │
│ │ React│ │TypeScript │ │ Node.js │                         │
│ └──────┘ └────────────┘ └─────────┘                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     CLASSIC TEMPLATE                         │
├─────────────────────────────────────────────────────────────┤
│                      JOHN DOE                [Center, Bold] │
│                  john.doe@email.com          [Center]       │
│                +1 (555) 123-4567             [Center]       │
│                 San Francisco, CA            [Center]       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    [Black Line]   │
│                                                              │
│ OBJECTIVE                                    [Bold, Caps]   │
│                                                              │
│ Experienced software engineer with a passion [Justified]    │
│ for building scalable web applications...                   │
│                                                              │
│ PROFESSIONAL EXPERIENCE                      [Bold, Caps]   │
│                                                              │
│ Senior Software Engineer         2020-01 - Present          │
│ Tech Company Inc.                           [Italic]        │
│ Lead development of customer-facing web applications.       │
│                                                              │
│ SKILLS                                       [Bold, Caps]   │
│                                                              │
│ React • TypeScript • Node.js • Python • PostgreSQL          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     MINIMAL TEMPLATE                         │
├─────────────────────────────────────────────────────────────┤
│ John Doe                                     [Large, Bold]  │
│ john.doe@email.com • +1555... • San Francisco [Small]      │
│ ───────────────────────────────────────────  [Light Gray]  │
│                                                              │
│ ABOUT                                        [Small Caps]   │
│                                                              │
│ Experienced software engineer with a passion                │
│ for building scalable web applications.                     │
│                                                              │
│ EXPERIENCE                                   [Small Caps]   │
│                                                              │
│ Senior Software Engineer    2020-01 — Present               │
│ Tech Company Inc.                           [Gray]          │
│ Lead development of customer-facing web applications.       │
│                                                              │
│ SKILLS                                       [Small Caps]   │
│                                                              │
│ • React        • TypeScript      • Node.js                  │
│ • Python       • PostgreSQL      • AWS                      │
│ • Docker       • Git             • REST APIs                │
└─────────────────────────────────────────────────────────────┘

KEY DIFFERENCES:

Modern Template:
✓ Burgundy/red accent colors (#780000)
✓ Skill pills/tags with background
✓ Bold section dividers
✓ Contemporary feel
✓ Helvetica font

Classic Template:
✓ Black and white only
✓ Centered header
✓ Times Roman font
✓ Traditional layout
✓ Bullet separators (•) for skills

Minimal Template:
✓ Ultra-clean grayscale
✓ Em dashes (—) for dates
✓ Maximum white space
✓ Small caps headings
✓ Grid layout for skills

All templates:
✓ A4 page size
✓ Professional spacing
✓ Print-ready quality
✓ Mobile preview support
✓ Dark mode compatible UI

*/
