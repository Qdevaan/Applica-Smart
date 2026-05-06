import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";

// Single-page-friendly compact layout. Tight typography, small section
// dividers, generous use of horizontal space.
const styles = StyleSheet.create({
  page: { padding: 28, fontFamily: "Helvetica", backgroundColor: "#FFFFFF" },
  header: { borderBottom: "1pt solid #111827", paddingBottom: 6, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  contact: { fontSize: 8.5, color: "#374151", marginTop: 3 },
  twoCol: { flexDirection: "row", gap: 18, marginTop: 4 },
  left: { flex: 2 },
  right: { flex: 1 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
    borderBottom: "0.5pt solid #9ca3af",
    paddingBottom: 2,
  },
  bio: { fontSize: 9, color: "#1f2937", lineHeight: 1.4, marginBottom: 10 },
  expRow: { marginBottom: 8 },
  expHead: { flexDirection: "row", justifyContent: "space-between" },
  expTitle: { fontSize: 9.5, fontWeight: "bold", color: "#111827" },
  expDates: { fontSize: 8, color: "#6b7280" },
  expCompany: { fontSize: 8.5, color: "#4b5563", fontStyle: "italic" },
  expDesc: { fontSize: 8.5, color: "#1f2937", lineHeight: 1.4, marginTop: 1 },
  bullet: { fontSize: 8.5, color: "#1f2937", marginLeft: 8, lineHeight: 1.35 },
  skillsLine: { fontSize: 8.5, color: "#1f2937", lineHeight: 1.45 },
  eduRow: { marginBottom: 6 },
  eduTitle: { fontSize: 9, fontWeight: "bold", color: "#111827" },
  eduSub: { fontSize: 8, color: "#4b5563" },
});

interface Props { profile: Profile; }

const fmtEdu = (edu: any) => {
  if (edu.level === "school") return `${edu.schoolType === "matric" ? "Matric" : "O-Levels"}${edu.schoolMarks ? `, ${edu.schoolMarks}` : ""}`;
  if (edu.level === "college") return `${edu.collegeProgram?.toUpperCase() || "College"}${edu.collegeMarks ? `, ${edu.collegeMarks}` : ""}`;
  if (edu.level === "university") return `${edu.degreeType || ""} ${edu.degree || ""}${edu.cgpa ? `, CGPA ${edu.cgpa}` : ""}`;
  return "";
};

export const CompactTemplate = ({ profile }: Props) => {
  const contactBits = [profile.email, profile.phone, profile.address].filter(Boolean);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name || "Your Name"}</Text>
          {contactBits.length > 0 && <Text style={styles.contact}>{contactBits.join("  •  ")}</Text>}
        </View>

        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <View style={styles.twoCol}>
          <View style={styles.left}>
            {profile.experience && profile.experience.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Experience</Text>
                {profile.experience.map((exp, i) => (
                  <View key={i} style={styles.expRow}>
                    <View style={styles.expHead}>
                      <Text style={styles.expTitle}>{exp.position}</Text>
                      <Text style={styles.expDates}>{exp.startDate} – {exp.current ? "Present" : exp.endDate}</Text>
                    </View>
                    <Text style={styles.expCompany}>{exp.company}</Text>
                    {exp.description && <Text style={styles.expDesc}>{exp.description}</Text>}
                    {exp.responsibilities?.map((r, j) => (
                      <Text key={j} style={styles.bullet}>• {r}</Text>
                    ))}
                  </View>
                ))}
              </>
            )}
          </View>

          <View style={styles.right}>
            {profile.skills && profile.skills.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Skills</Text>
                <Text style={styles.skillsLine}>{profile.skills.join("  ·  ")}</Text>
              </>
            )}

            {profile.education && profile.education.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.sectionTitle}>Education</Text>
                {profile.education.map((edu, i) => (
                  <View key={i} style={styles.eduRow}>
                    <Text style={styles.eduTitle}>{fmtEdu(edu)}</Text>
                    <Text style={styles.eduSub}>{edu.institutionName}</Text>
                    <Text style={styles.eduSub}>{edu.startYear} – {edu.endYear}</Text>
                  </View>
                ))}
              </View>
            )}

            {profile.hobbies && profile.hobbies.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.sectionTitle}>Interests</Text>
                <Text style={styles.skillsLine}>{profile.hobbies.join(", ")}</Text>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};
