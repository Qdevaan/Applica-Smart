import {
  Document, Page, Text, View, StyleSheet, Svg, Rect,
} from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";

const ACCENT = "#ec4899";
const INK = "#0f172a";
const MUTED = "#64748b";

const PROJECT_PALETTE = ["#fbcfe8", "#bfdbfe", "#fde68a", "#bbf7d0", "#fecaca", "#ddd6fe"];

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", color: INK, backgroundColor: "#ffffff", paddingHorizontal: 36, paddingVertical: 30 },
  hero: { marginBottom: 14 },
  rolePill: {
    fontSize: 9, paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: ACCENT, color: "#fff",
    borderRadius: 12, alignSelf: "flex-start", marginBottom: 6,
    fontFamily: "Helvetica-Bold", letterSpacing: 1, textTransform: "uppercase",
  },
  name: { fontSize: 38, fontFamily: "Helvetica-Bold", lineHeight: 1.05 },
  contact: { fontSize: 9, color: MUTED, marginTop: 6 },
  sectionTitle: {
    fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
    fontFamily: "Helvetica-Bold", color: ACCENT,
    marginTop: 14, marginBottom: 6,
  },
  bio: { fontSize: 10.5, lineHeight: 1.55 },
  projectGrid: { flexDirection: "row", flexWrap: "wrap" },
  projectCard: { width: "48%", marginBottom: 10, marginRight: "2%" },
  projectThumb: { width: "100%", height: 60, borderRadius: 4, marginBottom: 4 },
  projectName: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  projectRole: { fontSize: 9, color: MUTED, marginBottom: 2 },
  projectDesc: { fontSize: 9.5, lineHeight: 1.45 },
  expRow: { marginBottom: 8 },
  expHeader: { flexDirection: "row", justifyContent: "space-between" },
  position: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  dates: { fontSize: 9, color: MUTED },
  company: { fontSize: 10, color: ACCENT, fontStyle: "italic", marginBottom: 2 },
  desc: { fontSize: 10, lineHeight: 1.5 },
  pillRow: { flexDirection: "row", flexWrap: "wrap" },
  pill: {
    fontSize: 9, paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: "#fce7f3", color: "#9d174d",
    borderRadius: 8, marginRight: 4, marginBottom: 4,
  },
});

const ProjectThumb = ({ idx }: { idx: number }) => {
  const a = PROJECT_PALETTE[idx % PROJECT_PALETTE.length];
  const b = PROJECT_PALETTE[(idx + 2) % PROJECT_PALETTE.length];
  return (
    <Svg style={styles.projectThumb} viewBox="0 0 200 60">
      <Rect x={0} y={0} width={200} height={60} fill={a} />
      <Rect x={0} y={20} width={120} height={40} fill={b} />
      <Rect x={140} y={6} width={50} height={48} fill={ACCENT} />
    </Svg>
  );
};

interface Props { profile: Profile; }

export const PortfolioTemplate = ({ profile }: Props) => {
  const projects = profile.projects ?? [];
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          {profile.experience?.[0]?.position && (
            <Text style={styles.rolePill}>{profile.experience[0].position}</Text>
          )}
          <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
          <Text style={styles.contact}>
            {[profile.email, profile.phone, profile.address].filter(Boolean).join("   ·   ")}
          </Text>
        </View>

        {profile.bio && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </>
        )}

        {projects.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Selected Work</Text>
            <View style={styles.projectGrid}>
              {projects.map((p, i) => (
                <View key={p.id ?? i} style={styles.projectCard}>
                  <ProjectThumb idx={i} />
                  <Text style={styles.projectName}>{p.name}</Text>
                  {p.role && <Text style={styles.projectRole}>{p.role}</Text>}
                  {p.description && <Text style={styles.projectDesc}>{p.description}</Text>}
                </View>
              ))}
            </View>
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
      </Page>
    </Document>
  );
};

export default PortfolioTemplate;
