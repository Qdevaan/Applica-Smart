import {
  Document, Page, Text, View, StyleSheet, Svg, Rect,
} from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";

const ACCENT = "#10b981";
const INK = "#0f172a";
const MUTED = "#64748b";

const styles = StyleSheet.create({
  page: { fontFamily: "Courier", color: INK, backgroundColor: "#ffffff", paddingHorizontal: 38, paddingVertical: 32 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 },
  nameWrap: {},
  name: { fontSize: 24, fontFamily: "Courier-Bold" },
  handle: { fontSize: 11, color: ACCENT, marginTop: 2 },
  contact: { fontSize: 9, color: MUTED, textAlign: "right" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e2e8f0", marginBottom: 10 },
  contribTitle: { fontSize: 9, color: MUTED, marginBottom: 4 },
  sectionTitle: {
    fontSize: 11, fontFamily: "Courier-Bold", color: ACCENT,
    marginTop: 14, marginBottom: 6,
  },
  comment: { fontSize: 9.5, color: MUTED, marginBottom: 2 },
  bio: { fontSize: 10, lineHeight: 1.5 },
  expRow: { marginBottom: 9 },
  expHeader: { flexDirection: "row", justifyContent: "space-between" },
  position: { fontSize: 11, fontFamily: "Courier-Bold" },
  dates: { fontSize: 9, color: MUTED },
  company: { fontSize: 10, color: ACCENT, marginBottom: 2 },
  desc: { fontSize: 10, lineHeight: 1.5 },
  projectCard: {
    borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4,
    padding: 8, marginBottom: 8,
  },
  projectName: { fontSize: 11, fontFamily: "Courier-Bold" },
  projectMeta: { fontSize: 9, color: MUTED, marginVertical: 2 },
  projectDesc: { fontSize: 10, lineHeight: 1.4 },
  techRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  tech: {
    fontSize: 8.5, paddingHorizontal: 5, paddingVertical: 1.5,
    backgroundColor: "#ecfdf5", color: "#065f46",
    borderRadius: 3, marginRight: 3, marginBottom: 3,
  },
  skillsRow: { flexDirection: "row", flexWrap: "wrap" },
  skillTag: {
    fontSize: 9, paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: "#f1f5f9", borderRadius: 3,
    marginRight: 4, marginBottom: 4,
  },
});

const hashStr = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const ContribGrid = ({ seed }: { seed: string }) => {
  const cols = 26;
  const rows = 7;
  const cell = 6;
  const gap = 1.5;
  const w = cols * (cell + gap);
  const h = rows * (cell + gap);
  const palette = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
  let h0 = hashStr(seed) || 1;
  const rng = () => { h0 = (h0 * 9301 + 49297) % 233280; return h0 / 233280; };
  const cells = [] as { x: number; y: number; c: string }[];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const v = rng();
      const idx = v < 0.5 ? 0 : v < 0.7 ? 1 : v < 0.85 ? 2 : v < 0.95 ? 3 : 4;
      cells.push({ x: c * (cell + gap), y: r * (cell + gap), c: palette[idx] });
    }
  }
  return (
    <Svg width={w} height={h}>
      {cells.map((p, i) => (
        <Rect key={i} x={p.x} y={p.y} width={cell} height={cell} fill={p.c} rx={1} ry={1} />
      ))}
    </Svg>
  );
};

interface Props { profile: Profile; }

export const DevTemplate = ({ profile }: Props) => {
  const handle = (() => {
    const gh = profile.links?.find((l) => /github/i.test(l.label) || /github/i.test(l.url));
    if (gh) return gh.url.replace(/^https?:\/\/(www\.)?github\.com\//i, "@");
    return profile.email ? `@${profile.email.split("@")[0]}` : "";
  })();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.nameWrap}>
            <Text style={styles.name}>{profile.name ?? "your_name"}</Text>
            {handle && <Text style={styles.handle}>{handle}</Text>}
          </View>
          <Text style={styles.contact}>
            {[profile.email, profile.phone, profile.address].filter(Boolean).join("\n")}
          </Text>
        </View>
        <View style={styles.divider} />

        <Text style={styles.contribTitle}># last 6 months of commits</Text>
        <ContribGrid seed={profile.name ?? "anon"} />

        {profile.bio && (
          <>
            <Text style={styles.sectionTitle}>// about</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </>
        )}

        {profile.experience?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>// experience</Text>
            {profile.experience.map((e, i) => (
              <View key={e.id ?? i} style={styles.expRow}>
                <View style={styles.expHeader}>
                  <Text style={styles.position}>{e.position}</Text>
                  <Text style={styles.dates}>
                    {e.startDate} → {e.current ? "Present" : e.endDate ?? ""}
                  </Text>
                </View>
                <Text style={styles.company}>{e.company}</Text>
                {e.description && <Text style={styles.desc}>{e.description}</Text>}
              </View>
            ))}
          </>
        )}

        {profile.projects && profile.projects.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>// projects</Text>
            {profile.projects.map((p, i) => (
              <View key={p.id ?? i} style={styles.projectCard}>
                <Text style={styles.projectName}>{p.name}</Text>
                {(p.role || p.link) && (
                  <Text style={styles.projectMeta}>
                    {[p.role, p.link].filter(Boolean).join("  ·  ")}
                  </Text>
                )}
                {p.description && <Text style={styles.projectDesc}>{p.description}</Text>}
                {p.tech && p.tech.length > 0 && (
                  <View style={styles.techRow}>
                    {p.tech.map((t, j) => (
                      <Text key={j} style={styles.tech}>{t}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {profile.skills?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>// stack</Text>
            <View style={styles.skillsRow}>
              {profile.skills.map((s, i) => (
                <Text key={i} style={styles.skillTag}>{s}</Text>
              ))}
            </View>
          </>
        )}

        {profile.education?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>// education</Text>
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

export default DevTemplate;
