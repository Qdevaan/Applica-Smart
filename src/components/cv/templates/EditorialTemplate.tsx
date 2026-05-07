import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";
import { ExtraSections } from "./_extraSections";

const ACCENT = "#7f1d1d";
const INK = "#111111";
const MUTED = "#666666";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fafaf7",
    fontFamily: "Times-Roman",
    paddingHorizontal: 48,
    paddingVertical: 44,
    color: INK,
  },
  hero: {
    borderBottomWidth: 2,
    borderBottomColor: INK,
    paddingBottom: 14,
    marginBottom: 14,
  },
  kicker: {
    fontSize: 9,
    letterSpacing: 4,
    textTransform: "uppercase",
    color: ACCENT,
    fontFamily: "Times-Bold",
    marginBottom: 4,
  },
  name: { fontSize: 36, fontFamily: "Times-Bold", lineHeight: 1.05 },
  contact: { fontSize: 9, color: MUTED, marginTop: 6 },
  twoCol: { flexDirection: "row", gap: 18 },
  colMain: { flex: 2, paddingRight: 14 },
  colSide: { flex: 1, borderLeftWidth: 1, borderLeftColor: "#dcdcdc", paddingLeft: 14 },
  numberedTitle: { fontSize: 18, fontFamily: "Times-Bold", marginBottom: 6, marginTop: 14 },
  numberedTitleAccent: { color: ACCENT },
  dropCapWrap: { flexDirection: "row", marginBottom: 10 },
  dropCap: { fontSize: 42, fontFamily: "Times-Bold", color: ACCENT, lineHeight: 1, marginRight: 6 },
  bioRest: { flex: 1, fontSize: 10.5, lineHeight: 1.6, paddingTop: 4 },
  expBlock: { marginBottom: 10 },
  expRow: { flexDirection: "row", justifyContent: "space-between" },
  position: { fontSize: 11, fontFamily: "Times-Bold" },
  dates: { fontSize: 9, color: MUTED, fontStyle: "italic" },
  company: { fontSize: 10, color: ACCENT, fontStyle: "italic", marginBottom: 2 },
  desc: { fontSize: 10, lineHeight: 1.55 },
  pull: {
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
    paddingLeft: 10,
    fontStyle: "italic",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#333",
    marginVertical: 12,
  },
  sideTitle: {
    fontSize: 9,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "Times-Bold",
    color: ACCENT,
    marginTop: 12,
    marginBottom: 4,
  },
  sideItem: { fontSize: 10, marginBottom: 3 },
});

interface Props { profile: Profile; }

const splitBio = (bio: string): { firstLetter: string; rest: string; pull?: string } => {
  if (!bio) return { firstLetter: "", rest: "" };
  const firstLetter = bio.charAt(0);
  const rest = bio.slice(1);
  const sentences = bio.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const pull = sentences.length > 1 ? sentences[1] : undefined;
  return { firstLetter, rest, pull };
};

export const EditorialTemplate = ({ profile }: Props) => {
  const { firstLetter, rest, pull } = splitBio(profile.bio ?? "");
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Curriculum Vitae</Text>
          <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
          <Text style={styles.contact}>
            {[profile.email, profile.phone, profile.address].filter(Boolean).join("   //   ")}
          </Text>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.colMain}>
            {profile.bio && (
              <>
                <Text style={styles.numberedTitle}>
                  <Text style={styles.numberedTitleAccent}>01  </Text>Profile
                </Text>
                <View style={styles.dropCapWrap}>
                  <Text style={styles.dropCap}>{firstLetter}</Text>
                  <Text style={styles.bioRest}>{rest}</Text>
                </View>
                {pull && <Text style={styles.pull}>“{pull}”</Text>}
              </>
            )}

            <Text style={styles.numberedTitle}>
              <Text style={styles.numberedTitleAccent}>02  </Text>Experience
            </Text>
            {profile.experience?.map((e, i) => (
              <View key={e.id ?? i} style={styles.expBlock}>
                <View style={styles.expRow}>
                  <Text style={styles.position}>{e.position}</Text>
                  <Text style={styles.dates}>
                    {e.startDate} – {e.current ? "Present" : e.endDate ?? ""}
                  </Text>
                </View>
                <Text style={styles.company}>{e.company}</Text>
                {e.description && <Text style={styles.desc}>{e.description}</Text>}
              </View>
            ))}
          </View>

          <View style={styles.colSide}>
            <Text style={styles.sideTitle}>Education</Text>
            {profile.education?.map((ed, i) => (
              <View key={ed.id ?? i} style={{ marginBottom: 6 }}>
                <Text style={[styles.sideItem, { fontFamily: "Times-Bold" }]}>
                  {ed.degree ?? ed.institutionName}
                </Text>
                <Text style={styles.sideItem}>{ed.institutionName}</Text>
                <Text style={[styles.sideItem, { color: MUTED }]}>
                  {ed.startYear} – {ed.endYear}
                </Text>
              </View>
            ))}

            {profile.skills && profile.skills.length > 0 && (
              <>
                <Text style={styles.sideTitle}>Skills</Text>
                {profile.skills.slice(0, 12).map((s, i) => (
                  <Text key={i} style={styles.sideItem}>• {s}</Text>
                ))}
              </>
            )}

            {profile.languages && profile.languages.length > 0 && (
              <>
                <Text style={styles.sideTitle}>Languages</Text>
                {profile.languages.map((l, i) => (
                  <Text key={i} style={styles.sideItem}>
                    {l.name} ({l.proficiency})
                  </Text>
                ))}
              </>
            )}
          </View>
        </View>

        <ExtraSections profile={profile} accent="#7f1d1d" skip={["languages"]} />
      </Page>
    </Document>
  );
};

export default EditorialTemplate;
