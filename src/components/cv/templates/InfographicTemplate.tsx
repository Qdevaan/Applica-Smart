import {
  Document, Page, Text, View, StyleSheet, Svg, Rect, Circle, Path, G,
} from "@react-pdf/renderer";
import type { Profile, SkillLevel, Language } from "../../../lib/supabase";
import { ExtraSections } from "./_extraSections";

const ACCENT = "#f59e0b";
const INK = "#1f2937";
const MUTED = "#6b7280";
const TRACK = "#fef3c7";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", color: INK, backgroundColor: "#ffffff", paddingHorizontal: 36, paddingVertical: 30 },
  header: { marginBottom: 14 },
  name: { fontSize: 24, fontFamily: "Helvetica-Bold" },
  tagline: { fontSize: 11, color: MUTED, marginTop: 4 },
  contact: { fontSize: 9, color: MUTED, marginTop: 6 },
  sectionTitle: {
    fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
    fontFamily: "Helvetica-Bold", color: ACCENT,
    marginTop: 14, marginBottom: 6,
  },
  bio: { fontSize: 10.5, lineHeight: 1.55 },
  twoCol: { flexDirection: "row", marginTop: 8 },
  col: { flex: 1, paddingRight: 12 },
  skillRow: { marginBottom: 6 },
  skillLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  skillLabel: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  skillLevelText: { fontSize: 9, color: MUTED },
  ringRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  ringWrap: { width: 90, alignItems: "center", marginBottom: 8 },
  ringLabel: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginTop: 2, textAlign: "center" },
  ringSub: { fontSize: 8.5, color: MUTED, textAlign: "center" },
  ringPct: { fontSize: 10, fontFamily: "Helvetica-Bold", color: ACCENT, marginTop: -38, textAlign: "center" },
  expRow: { marginBottom: 9 },
  expHeader: { flexDirection: "row", justifyContent: "space-between" },
  position: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  dates: { fontSize: 9, color: MUTED },
  company: { fontSize: 10, color: ACCENT, marginBottom: 2 },
  desc: { fontSize: 10, lineHeight: 1.5 },
});

const SkillBar = ({ s }: { s: SkillLevel }) => {
  const pct = (s.level / 5) * 100;
  return (
    <View style={styles.skillRow}>
      <View style={styles.skillLabelRow}>
        <Text style={styles.skillLabel}>{s.name}</Text>
        <Text style={styles.skillLevelText}>{s.level}/5</Text>
      </View>
      <Svg width={"100%"} height={6} viewBox="0 0 100 6" preserveAspectRatio="none">
        <Rect x={0} y={0} width={100} height={6} fill={TRACK} rx={3} ry={3} />
        <Rect x={0} y={0} width={pct} height={6} fill={ACCENT} rx={3} ry={3} />
      </Svg>
    </View>
  );
};

const profMap: Record<Language["proficiency"], number> = {
  basic: 0.2, intermediate: 0.45, professional: 0.7, fluent: 0.9, native: 1,
};

const arcPath = (frac: number, r: number, cx: number, cy: number): string => {
  const angle = frac * Math.PI * 2;
  const x = cx + r * Math.sin(angle);
  const y = cy - r * Math.cos(angle);
  const large = frac > 0.5 ? 1 : 0;
  if (frac >= 1) return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r}`;
  return `M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x} ${y}`;
};

const Ring = ({ lang }: { lang: Language }) => {
  const cx = 30; const cy = 30; const r = 22; const frac = profMap[lang.proficiency] ?? 0.5;
  return (
    <View style={styles.ringWrap}>
      <Svg width={60} height={60} viewBox="0 0 60 60">
        <Circle cx={cx} cy={cy} r={r} stroke={TRACK} strokeWidth={6} fill="none" />
        <G>
          <Path d={arcPath(frac, r, cx, cy)} stroke={ACCENT} strokeWidth={6} fill="none" strokeLinecap="round" />
        </G>
      </Svg>
      <Text style={styles.ringPct}>{Math.round(frac * 100)}%</Text>
      <Text style={styles.ringLabel}>{lang.name}</Text>
      <Text style={styles.ringSub}>{lang.proficiency}</Text>
    </View>
  );
};

interface Props { profile: Profile; }

export const InfographicTemplate = ({ profile }: Props) => {
  const skillLevels: SkillLevel[] =
    profile.skill_levels && profile.skill_levels.length > 0
      ? profile.skill_levels
      : (profile.skills ?? []).map((name) => ({ name, level: 4 as 1 | 2 | 3 | 4 | 5 }));
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
          {profile.bio && <Text style={styles.tagline}>{profile.bio.split(".")[0]}.</Text>}
          <Text style={styles.contact}>
            {[profile.email, profile.phone, profile.address].filter(Boolean).join("  ·  ")}
          </Text>
        </View>

        {profile.bio && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </>
        )}

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {skillLevels.slice(0, 8).map((s, i) => (<SkillBar key={i} s={s} />))}
          </View>
          {profile.languages && profile.languages.length > 0 && (
            <View style={styles.col}>
              <Text style={styles.sectionTitle}>Languages</Text>
              <View style={styles.ringRow}>
                {profile.languages.map((l, i) => (<Ring key={i} lang={l} />))}
              </View>
            </View>
          )}
        </View>

        {profile.experience?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profile.experience.map((e, i) => (
              <View key={e.id ?? i} style={styles.expRow}>
                <View style={styles.expHeader}>
                  <Text style={styles.position}>{e.position}</Text>
                  <Text style={styles.dates}>{e.startDate} – {e.current ? "Present" : e.endDate ?? ""}</Text>
                </View>
                <Text style={styles.company}>{e.company}</Text>
                {e.description && <Text style={styles.desc}>{e.description}</Text>}
              </View>
            ))}
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

        <ExtraSections profile={profile} accent="#f59e0b" skip={["languages"]} />
      </Page>
    </Document>
  );
};

export default InfographicTemplate;
