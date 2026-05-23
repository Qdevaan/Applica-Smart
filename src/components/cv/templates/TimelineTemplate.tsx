import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";
import { ExtraSections } from "./_extraSections";

const ACCENT = "#0f172a";
const SPINE = "#cbd5e1";
const MUTED = "#64748b";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    paddingHorizontal: 40,
    paddingVertical: 36,
    color: "#0f172a",
  },
  header: { marginBottom: 18 },
  name: { fontSize: 24, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  tagline: { fontSize: 11, color: MUTED, marginBottom: 6 },
  contact: { fontSize: 9, color: MUTED },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    marginBottom: 8,
    marginTop: 12,
  },
  timelineRow: { flexDirection: "row", marginBottom: 12 },
  spineCol: {
    width: 100,
    paddingRight: 10,
    alignItems: "flex-end",
  },
  spineDate: { fontSize: 9, color: MUTED, fontFamily: "Helvetica-Bold" },
  spineSubDate: { fontSize: 8, color: MUTED, marginTop: 1 },
  axis: {
    width: 16,
    alignItems: "center",
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: ACCENT,
    marginTop: 2,
  },
  line: {
    width: 1.5,
    flex: 1,
    backgroundColor: SPINE,
    marginTop: 2,
  },
  contentCol: { flex: 1, paddingLeft: 8 },
  position: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  company: { fontSize: 10, color: ACCENT, marginBottom: 3 },
  desc: { fontSize: 9.5, lineHeight: 1.5 },
  bullet: { fontSize: 9.5, lineHeight: 1.5, marginLeft: 8 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  pill: {
    fontSize: 9,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    marginRight: 4,
    marginBottom: 4,
  },
});

interface Props { profile: Profile; }

interface Entry { from: string; to: string; title: string; org: string; description?: string; bullets?: string[]; }

export const TimelineTemplate = ({ profile }: Props) => {
  const expEntries: Entry[] = (profile.experience ?? []).map((e) => ({
    from: e.startDate ?? "",
    to: e.current ? "Present" : e.endDate ?? "",
    title: e.position,
    org: e.company,
    description: e.description,
    bullets: e.responsibilities,
  }));
  const eduEntries: Entry[] = (profile.education ?? []).map((ed) => ({
    from: ed.startYear ?? "",
    to: ed.endYear ?? "",
    title: ed.degree ?? ed.institutionName,
    org: ed.institutionName,
  }));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
          {profile.bio && <Text style={styles.tagline}>{profile.bio.split(".")[0]}.</Text>}
          <Text style={styles.contact}>
            {[profile.email, profile.phone, profile.address].filter(Boolean).join("  •  ")}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Experience</Text>
        {expEntries.map((entry, i) => (
          <View key={i} style={styles.timelineRow}>
            <View style={styles.spineCol}>
              <Text style={styles.spineDate}>{entry.to}</Text>
              <Text style={styles.spineSubDate}>{entry.from}</Text>
            </View>
            <View style={styles.axis}>
              <View style={styles.dot} />
              {i < expEntries.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.contentCol}>
              <Text style={styles.position}>{entry.title}</Text>
              <Text style={styles.company}>{entry.org}</Text>
              {entry.description && <Text style={styles.desc}>{entry.description}</Text>}
              {entry.bullets?.map((b, j) => (
                <Text key={j} style={styles.bullet}>• {b}</Text>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Education</Text>
        {eduEntries.map((entry, i) => (
          <View key={i} style={styles.timelineRow}>
            <View style={styles.spineCol}>
              <Text style={styles.spineDate}>{entry.to}</Text>
              <Text style={styles.spineSubDate}>{entry.from}</Text>
            </View>
            <View style={styles.axis}>
              <View style={styles.dot} />
              {i < eduEntries.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.contentCol}>
              <Text style={styles.position}>{entry.title}</Text>
              <Text style={styles.company}>{entry.org}</Text>
            </View>
          </View>
        ))}

        {profile.skills && profile.skills.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.pillRow}>
              {profile.skills.map((s, i) => (
                <Text key={i} style={styles.pill}>{s}</Text>
              ))}
            </View>
          </>
        )}

        <ExtraSections profile={profile} accent="#0f172a" />
      </Page>
    </Document>
  );
};

export default TimelineTemplate;
