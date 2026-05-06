import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";

const styles = StyleSheet.create({
  page: { fontFamily: "Times-Roman", color: "#000000", backgroundColor: "#ffffff", paddingHorizontal: 56, paddingVertical: 48 },
  header: { alignItems: "center", marginBottom: 14 },
  name: { fontSize: 22, fontFamily: "Times-Bold", letterSpacing: 1 },
  affiliation: { fontSize: 10, marginTop: 2 },
  contact: { fontSize: 9, marginTop: 2 },
  sectionTitle: {
    fontSize: 11, fontFamily: "Times-Bold",
    textTransform: "uppercase", letterSpacing: 2,
    borderBottomWidth: 0.7, borderBottomColor: "#000",
    paddingBottom: 1, marginTop: 14, marginBottom: 6,
  },
  twoCol: { flexDirection: "row", justifyContent: "space-between" },
  block: { marginBottom: 6 },
  position: { fontSize: 10.5, fontFamily: "Times-Bold" },
  org: { fontSize: 10, fontStyle: "italic" },
  dates: { fontSize: 9 },
  desc: { fontSize: 10, lineHeight: 1.5, marginTop: 1 },
  pubItem: { fontSize: 10, lineHeight: 1.55, marginBottom: 4 },
  num: { fontFamily: "Times-Bold" },
});

interface Props { profile: Profile; }

export const AcademicTemplate = ({ profile }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
        <Text style={styles.contact}>
          {[profile.email, profile.phone, profile.address].filter(Boolean).join("  ·  ")}
        </Text>
      </View>

      {profile.education?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Education</Text>
          {profile.education.map((ed, i) => (
            <View key={ed.id ?? i} style={[styles.twoCol, styles.block]}>
              <View>
                <Text style={styles.position}>{ed.degree ?? ed.institutionName}</Text>
                <Text style={styles.org}>{ed.institutionName}</Text>
                {ed.cgpa && <Text style={styles.desc}>CGPA: {ed.cgpa}</Text>}
              </View>
              <Text style={styles.dates}>{ed.startYear} – {ed.endYear}</Text>
            </View>
          ))}
        </>
      )}

      {profile.experience?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Research & Professional Experience</Text>
          {profile.experience.map((e, i) => (
            <View key={e.id ?? i} style={styles.block}>
              <View style={styles.twoCol}>
                <Text style={styles.position}>{e.position}</Text>
                <Text style={styles.dates}>
                  {e.startDate} – {e.current ? "Present" : e.endDate ?? ""}
                </Text>
              </View>
              <Text style={styles.org}>{e.company}</Text>
              {e.description && <Text style={styles.desc}>{e.description}</Text>}
            </View>
          ))}
        </>
      )}

      {profile.publications && profile.publications.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Publications</Text>
          {profile.publications.map((p, i) => (
            <Text key={p.id ?? i} style={styles.pubItem}>
              <Text style={styles.num}>[{i + 1}] </Text>
              {(p.authors ?? []).join(", ")}
              {p.authors?.length ? ". " : ""}
              {p.title}.
              {p.venue ? ` ${p.venue},` : ""}
              {p.year ? ` ${p.year}.` : ""}
              {p.url ? ` ${p.url}` : ""}
            </Text>
          ))}
        </>
      )}

      {profile.awards && profile.awards.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Awards & Honors</Text>
          {profile.awards.map((a, i) => (
            <View key={a.id ?? i} style={[styles.twoCol, styles.block]}>
              <View>
                <Text style={styles.position}>{a.title}</Text>
                {a.issuer && <Text style={styles.org}>{a.issuer}</Text>}
              </View>
              {a.year && <Text style={styles.dates}>{a.year}</Text>}
            </View>
          ))}
        </>
      )}

      {profile.certifications && profile.certifications.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {profile.certifications.map((c, i) => (
            <View key={c.id ?? i} style={[styles.twoCol, styles.block]}>
              <View>
                <Text style={styles.position}>{c.name}</Text>
                <Text style={styles.org}>{c.issuer}</Text>
              </View>
              {c.date && <Text style={styles.dates}>{c.date}</Text>}
            </View>
          ))}
        </>
      )}

      {profile.skills?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Technical Skills</Text>
          <Text style={styles.desc}>{profile.skills.join(", ")}</Text>
        </>
      )}

      {profile.languages && profile.languages.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Languages</Text>
          <Text style={styles.desc}>
            {profile.languages.map((l) => `${l.name} (${l.proficiency})`).join(", ")}
          </Text>
        </>
      )}
    </Page>
  </Document>
);

export default AcademicTemplate;
