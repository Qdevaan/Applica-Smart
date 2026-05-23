import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
} from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";
import { ExtraSections } from "./_extraSections";

const styles = StyleSheet.create({
  page: { backgroundColor: "#ffffff", fontFamily: "Helvetica", color: "#0f172a" },
  heroWrap: { position: "relative", height: 130 },
  heroSvg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  heroContent: {
    position: "absolute",
    top: 30,
    left: 40,
    right: 40,
    bottom: 0,
  },
  name: { fontSize: 26, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  tagline: { fontSize: 11, color: "#e0e7ff", marginTop: 6 },
  contact: { fontSize: 9, color: "#cbd5e1", marginTop: 8 },
  body: { paddingHorizontal: 40, paddingTop: 18, paddingBottom: 30 },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    color: "#4f46e5",
    marginBottom: 6,
    marginTop: 14,
  },
  bio: { fontSize: 10.5, lineHeight: 1.55 },
  expRow: { marginBottom: 10 },
  expHeader: { flexDirection: "row", justifyContent: "space-between" },
  position: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  dates: { fontSize: 9, color: "#64748b" },
  company: { fontSize: 10, color: "#4f46e5", marginBottom: 2 },
  desc: { fontSize: 10, lineHeight: 1.5 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  pill: {
    fontSize: 9,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  linkRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  link: { fontSize: 9, color: "#4f46e5", marginRight: 10 },
});

interface Props { profile: Profile; }

export const GradientTemplate = ({ profile }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.heroWrap}>
        <Svg style={styles.heroSvg} viewBox="0 0 595 130">
          <Defs>
            <LinearGradient id="g" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#4f46e5" />
              <Stop offset="1" stopColor="#06b6d4" />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={595} height={130} fill="url(#g)" />
        </Svg>
        <View style={styles.heroContent}>
          <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
          {profile.bio && <Text style={styles.tagline}>{profile.bio.split(".")[0]}.</Text>}
          <Text style={styles.contact}>
            {[profile.email, profile.phone, profile.address].filter(Boolean).join("  •  ")}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        {profile.links && profile.links.length > 0 && (
          <View style={styles.linkRow}>
            {profile.links.map((l, i) => (
              <Text key={i} style={styles.link}>
                {l.label}: {l.url}
              </Text>
            ))}
          </View>
        )}

        {profile.bio && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
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
                    {e.startDate} – {e.current ? "Present" : e.endDate ?? ""}
                  </Text>
                </View>
                <Text style={styles.company}>{e.company}</Text>
                {e.description && <Text style={styles.desc}>{e.description}</Text>}
              </View>
            ))}
          </>
        )}

        {profile.skills?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.pillRow}>
              {profile.skills.map((s, i) => (
                <Text key={i} style={styles.pill}>{s}</Text>
              ))}
            </View>
          </>
        )}

        {profile.education?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((ed, i) => (
              <View key={ed.id ?? i} style={styles.expRow}>
                <Text style={styles.position}>{ed.degree ?? ed.institutionName}</Text>
                <Text style={styles.company}>{ed.institutionName}</Text>
                <Text style={styles.dates}>{ed.startYear} – {ed.endYear}</Text>
              </View>
            ))}
          </>
        )}

        <ExtraSections profile={profile} accent="#4f46e5" skip={["links"]} />
      </View>
    </Page>
  </Document>
);

export default GradientTemplate;
