import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";

// ATS-friendly: no colors, no columns, no graphics. Standard fonts and section
// headings that ATS parsers reliably detect.
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Times-Roman", backgroundColor: "#FFFFFF" },
  name: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  contact: { fontSize: 10, marginBottom: 14, color: "#000000" },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  body: { fontSize: 10.5, lineHeight: 1.45, color: "#000000" },
  expBlock: { marginBottom: 10 },
  expTitle: { fontSize: 11, fontWeight: "bold" },
  expSub: { fontSize: 10, marginBottom: 3 },
  bullet: { fontSize: 10, marginLeft: 12, marginTop: 2 },
});

interface Props { profile: Profile; }

const formatEducation = (edu: any) => {
  if (edu.level === "school") return `${edu.schoolType === "matric" ? "Matriculation" : "O-Levels"}${edu.schoolMarks ? `, ${edu.schoolMarks}` : ""}`;
  if (edu.level === "college") return `${edu.collegeProgram?.toUpperCase() || "College"}${edu.collegeMarks ? `, ${edu.collegeMarks}` : ""}`;
  if (edu.level === "university") return `${edu.degreeType || ""} ${edu.degree || ""}${edu.cgpa ? `, CGPA ${edu.cgpa}` : ""}`;
  return "";
};

export const ATSTemplate = ({ profile }: Props) => {
  const contactBits = [profile.email, profile.phone, profile.address].filter(Boolean);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{profile.name || "Your Name"}</Text>
        {contactBits.length > 0 && (
          <Text style={styles.contact}>{contactBits.join(" | ")}</Text>
        )}

        {profile.bio && (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.body}>{profile.bio}</Text>
          </View>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.body}>{profile.skills.join(", ")}</Text>
          </View>
        )}

        {profile.experience && profile.experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profile.experience.map((exp, i) => (
              <View key={i} style={styles.expBlock}>
                <Text style={styles.expTitle}>{exp.position}, {exp.company}</Text>
                <Text style={styles.expSub}>
                  {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                </Text>
                {exp.description && <Text style={styles.body}>{exp.description}</Text>}
                {exp.responsibilities?.map((r, j) => (
                  <Text key={j} style={styles.bullet}>- {r}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {profile.education && profile.education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((edu, i) => (
              <View key={i} style={styles.expBlock}>
                <Text style={styles.expTitle}>{formatEducation(edu)}</Text>
                <Text style={styles.expSub}>
                  {edu.institutionName} — {edu.startYear}–{edu.endYear}
                </Text>
              </View>
            ))}
          </View>
        )}

        {profile.hobbies && profile.hobbies.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Interests</Text>
            <Text style={styles.body}>{profile.hobbies.join(", ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
