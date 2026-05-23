import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";
import { ExtraSections } from "./_extraSections";

const GOLD = "#b8860b";
const INK = "#1a1a1a";
const MUTED = "#5b5b5b";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Times-Roman",
    paddingHorizontal: 60,
    paddingVertical: 50,
    color: INK,
  },
  headerWrap: { alignItems: "center", marginBottom: 18 },
  name: {
    fontSize: 26,
    letterSpacing: 4,
    textTransform: "uppercase",
    fontFamily: "Times-Bold",
  },
  rule: {
    width: "30%",
    borderBottomWidth: 1,
    borderBottomColor: GOLD,
    marginVertical: 6,
  },
  contact: { fontSize: 9, color: MUTED, letterSpacing: 1 },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: GOLD,
    marginTop: 18,
    marginBottom: 6,
    textAlign: "center",
    fontFamily: "Times-Bold",
  },
  bio: { fontSize: 11, lineHeight: 1.6, textAlign: "center", fontStyle: "italic" },
  expRow: { marginBottom: 10 },
  expHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  position: { fontSize: 11, fontFamily: "Times-Bold" },
  dates: { fontSize: 9, color: MUTED },
  company: { fontSize: 10, fontStyle: "italic", color: MUTED, marginBottom: 3 },
  desc: { fontSize: 10, lineHeight: 1.55 },
  twoCol: { flexDirection: "row", marginTop: 6 },
  col: { flex: 1, paddingRight: 12 },
  listItem: { fontSize: 10, marginBottom: 3 },
});

interface Props { profile: Profile; }

export const ElegantSerifTemplate = ({ profile }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.headerWrap}>
        <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
        <View style={styles.rule} />
        <Text style={styles.contact}>
          {[profile.email, profile.phone, profile.address].filter(Boolean).join("  •  ")}
        </Text>
      </View>

      {profile.bio && (
        <>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
        </>
      )}

      {profile.experience?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Experience</Text>
          {profile.experience.map((e, i) => (
            <View key={e.id ?? i} style={styles.expRow}>
              <View style={styles.expHeader}>
                <Text style={styles.position}>{e.position}</Text>
                <Text style={styles.dates}>
                  {e.startDate} — {e.current ? "Present" : e.endDate ?? ""}
                </Text>
              </View>
              <Text style={styles.company}>{e.company}</Text>
              {e.description && <Text style={styles.desc}>{e.description}</Text>}
            </View>
          ))}
        </>
      )}

      <View style={styles.twoCol}>
        {profile.education?.length > 0 && (
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((ed, i) => (
              <View key={ed.id ?? i} style={{ marginBottom: 6 }}>
                <Text style={styles.position}>{ed.degree ?? ed.institutionName}</Text>
                <Text style={styles.company}>{ed.institutionName}</Text>
                <Text style={styles.dates}>
                  {ed.startYear} — {ed.endYear}
                </Text>
              </View>
            ))}
          </View>
        )}
        {profile.languages && profile.languages.length > 0 && (
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Languages</Text>
            {profile.languages.map((l, i) => (
              <Text key={i} style={styles.listItem}>
                {l.name} — {l.proficiency}
              </Text>
            ))}
          </View>
        )}
      </View>

      <ExtraSections profile={profile} accent="#b8860b" skip={["languages"]} />
    </Page>
  </Document>
);

export default ElegantSerifTemplate;
