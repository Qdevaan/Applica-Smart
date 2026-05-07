import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";
import { ExtraSections } from "./_extraSections";

const styles = StyleSheet.create({
  page: { backgroundColor: "#FFFFFF", fontFamily: "Times-Roman", padding: 0 },
  header: {
    backgroundColor: "#0b1d3a",
    color: "#FFFFFF",
    paddingHorizontal: 40,
    paddingVertical: 28,
  },
  name: { fontSize: 26, fontWeight: "bold", letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 12, color: "#c9a46a", textTransform: "uppercase", letterSpacing: 2 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 14, gap: 18 },
  contactText: { fontSize: 9, color: "#e6e6e6" },
  body: { paddingHorizontal: 40, paddingVertical: 24 },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0b1d3a",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 6,
    borderBottom: "1pt solid #c9a46a",
    paddingBottom: 4,
  },
  bio: { fontSize: 10.5, lineHeight: 1.6, color: "#222", textAlign: "justify" },
  expRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  expTitle: { fontSize: 11, fontWeight: "bold", color: "#0b1d3a" },
  expDates: { fontSize: 9, color: "#555", fontStyle: "italic" },
  company: { fontSize: 10, color: "#444", fontStyle: "italic", marginBottom: 4 },
  desc: { fontSize: 10, color: "#333", lineHeight: 1.55 },
  bullet: { fontSize: 10, color: "#333", marginLeft: 10, lineHeight: 1.5 },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap" },
  skillChip: {
    fontSize: 9,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#f1efe8",
    color: "#0b1d3a",
    border: "0.5pt solid #c9a46a",
  },
  expBlock: { marginBottom: 12 },
});

interface Props {
  profile: Profile;
}

const formatEducation = (edu: any) => {
  if (edu.level === "school") return `${edu.schoolType === "matric" ? "Matriculation" : "O-Levels"}${edu.schoolMarks ? ` — ${edu.schoolMarks}` : ""}`;
  if (edu.level === "college") return `${edu.collegeProgram?.toUpperCase() || "College"}${edu.collegeMarks ? ` — ${edu.collegeMarks}` : ""}`;
  if (edu.level === "university") return `${edu.degreeType || "Degree"} in ${edu.degree || ""}${edu.cgpa ? ` — CGPA ${edu.cgpa}` : ""}`;
  return "";
};

export const ExecutiveTemplate = ({ profile }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{profile.name || "Your Name"}</Text>
        {profile.bio && <Text style={styles.title}>Senior Professional</Text>}
        <View style={styles.contactRow}>
          {profile.email && <Text style={styles.contactText}>{profile.email}</Text>}
          {profile.phone && <Text style={styles.contactText}>{profile.phone}</Text>}
          {profile.address && <Text style={styles.contactText}>{profile.address}</Text>}
        </View>
      </View>

      <View style={styles.body}>
        {profile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
        )}

        {profile.experience && profile.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {profile.experience.map((exp, i) => (
              <View key={i} style={styles.expBlock}>
                <View style={styles.expRow}>
                  <Text style={styles.expTitle}>{exp.position}</Text>
                  <Text style={styles.expDates}>
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
                <Text style={styles.company}>{exp.company}</Text>
                {exp.description && <Text style={styles.desc}>{exp.description}</Text>}
                {exp.responsibilities?.map((r, j) => (
                  <Text key={j} style={styles.bullet}>• {r}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {profile.education && profile.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((edu, i) => (
              <View key={i} style={styles.expBlock}>
                <View style={styles.expRow}>
                  <Text style={styles.expTitle}>{formatEducation(edu)}</Text>
                  <Text style={styles.expDates}>{edu.startYear} — {edu.endYear}</Text>
                </View>
                <Text style={styles.company}>{edu.institutionName}</Text>
              </View>
            ))}
          </View>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Competencies</Text>
            <View style={styles.skillsGrid}>
              {profile.skills.map((s, i) => (
                <Text key={i} style={styles.skillChip}>{s}</Text>
              ))}
            </View>
          </View>
        )}

        <ExtraSections profile={profile} accent="#0b1d3a" />
      </View>
    </Page>
  </Document>
);
