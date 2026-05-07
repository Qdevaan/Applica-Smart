import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";
import { ExtraSections } from "./_extraSections";

const ACCENT = "#7c3aed";
const ACCENT_LIGHT = "#ede9fe";
const TEXT = "#1f2937";
const MUTED = "#6b7280";

const styles = StyleSheet.create({
  page: { backgroundColor: "#FFFFFF", fontFamily: "Helvetica", padding: 0 },
  topBar: { height: 8, backgroundColor: ACCENT },
  header: { paddingHorizontal: 36, paddingTop: 28, paddingBottom: 18 },
  name: { fontSize: 30, fontWeight: "bold", color: TEXT, letterSpacing: -0.5 },
  tagline: { fontSize: 11, color: ACCENT, marginTop: 4, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1 },
  contactBar: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, gap: 14 },
  contactItem: { fontSize: 9.5, color: MUTED },
  body: { flexDirection: "row", paddingHorizontal: 36, paddingBottom: 28 },
  left: { width: "62%", paddingRight: 18 },
  right: { width: "38%" },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  bio: { fontSize: 10, lineHeight: 1.6, color: TEXT },
  expBlock: { marginBottom: 14, paddingLeft: 10, borderLeft: `2pt solid ${ACCENT_LIGHT}` },
  expTitle: { fontSize: 11, fontWeight: "bold", color: TEXT },
  expCompany: { fontSize: 10, color: ACCENT, marginTop: 1 },
  expDates: { fontSize: 9, color: MUTED, marginTop: 1, marginBottom: 4 },
  expDesc: { fontSize: 9.5, color: TEXT, lineHeight: 1.5 },
  bullet: { fontSize: 9.5, color: TEXT, marginTop: 2, marginLeft: 6 },
  skillRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  skillTag: {
    fontSize: 9,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginRight: 5,
    marginBottom: 5,
    backgroundColor: ACCENT_LIGHT,
    color: ACCENT,
    borderRadius: 3,
  },
  hobbyItem: { fontSize: 10, color: TEXT, marginBottom: 4 },
  eduBlock: { marginBottom: 10 },
  eduTitle: { fontSize: 10, fontWeight: "bold", color: TEXT },
  eduDetail: { fontSize: 9, color: MUTED, marginTop: 1 },
});

interface Props { profile: Profile; }

const formatEducation = (edu: any) => {
  if (edu.level === "school") return `${edu.schoolType === "matric" ? "Matriculation" : "O-Levels"}`;
  if (edu.level === "college") return `${edu.collegeProgram?.toUpperCase() || "College"}`;
  if (edu.level === "university") return `${edu.degreeType || "Degree"} in ${edu.degree || ""}`;
  return "";
};

export const CreativeTemplate = ({ profile }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.topBar} />
      <View style={styles.header}>
        <Text style={styles.name}>{profile.name || "Your Name"}</Text>
        {profile.bio && <Text style={styles.tagline}>Creative Professional</Text>}
        <View style={styles.contactBar}>
          {profile.email && <Text style={styles.contactItem}>✉ {profile.email}</Text>}
          {profile.phone && <Text style={styles.contactItem}>☎ {profile.phone}</Text>}
          {profile.address && <Text style={styles.contactItem}>⌂ {profile.address}</Text>}
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.left}>
          {profile.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bio}>{profile.bio}</Text>
            </View>
          )}

          {profile.experience && profile.experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience</Text>
              {profile.experience.map((exp, i) => (
                <View key={i} style={styles.expBlock}>
                  <Text style={styles.expTitle}>{exp.position}</Text>
                  <Text style={styles.expCompany}>{exp.company}</Text>
                  <Text style={styles.expDates}>{exp.startDate} – {exp.current ? "Present" : exp.endDate}</Text>
                  {exp.description && <Text style={styles.expDesc}>{exp.description}</Text>}
                  {exp.responsibilities?.map((r, j) => (
                    <Text key={j} style={styles.bullet}>› {r}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.right}>
          {profile.skills && profile.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillRow}>
                {profile.skills.map((s, i) => (
                  <Text key={i} style={styles.skillTag}>{s}</Text>
                ))}
              </View>
            </View>
          )}

          {profile.education && profile.education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {profile.education.map((edu, i) => (
                <View key={i} style={styles.eduBlock}>
                  <Text style={styles.eduTitle}>{formatEducation(edu)}</Text>
                  <Text style={styles.eduDetail}>{edu.institutionName}</Text>
                  <Text style={styles.eduDetail}>{edu.startYear} – {edu.endYear}</Text>
                </View>
              ))}
            </View>
          )}

          {profile.hobbies && profile.hobbies.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests</Text>
              {profile.hobbies.map((h, i) => (
                <Text key={i} style={styles.hobbyItem}>• {h}</Text>
              ))}
            </View>
          )}

          <ExtraSections profile={profile} accent="#7c3aed" compact />
        </View>
      </View>
    </Page>
  </Document>
);
