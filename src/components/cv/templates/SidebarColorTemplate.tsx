import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";
import { ExtraSections } from "./_extraSections";

const ACCENT = "#0f766e";
const ACCENT_DARK = "#0b5950";
const INK = "#0f172a";
const MUTED = "#475569";

const styles = StyleSheet.create({
  page: { flexDirection: "row", fontFamily: "Helvetica", color: INK, backgroundColor: "#ffffff" },
  sidebar: {
    width: "35%",
    backgroundColor: ACCENT,
    color: "#ffffff",
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: "center",
    marginBottom: 14,
  },
  initialsCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: "center",
    marginBottom: 14,
    backgroundColor: ACCENT_DARK,
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: { fontSize: 32, color: "#ffffff", fontFamily: "Helvetica-Bold" },
  sidebarTitle: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    color: "#ecfeff",
    marginTop: 14,
    marginBottom: 4,
  },
  sidebarItem: { fontSize: 9.5, color: "#ecfeff", marginBottom: 3, lineHeight: 1.4 },
  main: { width: "65%", paddingHorizontal: 28, paddingVertical: 28 },
  name: { fontSize: 26, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  role: { fontSize: 12, color: ACCENT, marginTop: 4, marginBottom: 12 },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    borderBottomWidth: 1,
    borderBottomColor: ACCENT,
    paddingBottom: 2,
    marginTop: 14,
    marginBottom: 6,
  },
  bio: { fontSize: 10.5, lineHeight: 1.5 },
  expRow: { marginBottom: 9 },
  expHeader: { flexDirection: "row", justifyContent: "space-between" },
  position: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  dates: { fontSize: 9, color: MUTED },
  company: { fontSize: 10, color: MUTED, fontStyle: "italic", marginBottom: 2 },
  desc: { fontSize: 9.5, lineHeight: 1.5 },
});

const initials = (name?: string | null): string => {
  if (!name) return "•";
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
};

interface Props { profile: Profile; }

export const SidebarColorTemplate = ({ profile }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.sidebar}>
        {profile.photo_url ? (
          <Image src={profile.photo_url} style={styles.photo} />
        ) : (
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>{initials(profile.name)}</Text>
          </View>
        )}

        <Text style={styles.sidebarTitle}>Contact</Text>
        {profile.email && <Text style={styles.sidebarItem}>{profile.email}</Text>}
        {profile.phone && <Text style={styles.sidebarItem}>{profile.phone}</Text>}
        {profile.address && <Text style={styles.sidebarItem}>{profile.address}</Text>}

        {profile.skills && profile.skills.length > 0 && (
          <>
            <Text style={styles.sidebarTitle}>Skills</Text>
            {profile.skills.slice(0, 14).map((s, i) => (
              <Text key={i} style={styles.sidebarItem}>• {s}</Text>
            ))}
          </>
        )}

        {profile.languages && profile.languages.length > 0 && (
          <>
            <Text style={styles.sidebarTitle}>Languages</Text>
            {profile.languages.map((l, i) => (
              <Text key={i} style={styles.sidebarItem}>{l.name} — {l.proficiency}</Text>
            ))}
          </>
        )}

        {profile.hobbies && profile.hobbies.length > 0 && (
          <>
            <Text style={styles.sidebarTitle}>Interests</Text>
            {profile.hobbies.slice(0, 6).map((h, i) => (
              <Text key={i} style={styles.sidebarItem}>{h}</Text>
            ))}
          </>
        )}
      </View>

      <View style={styles.main}>
        <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
        {profile.experience?.[0]?.position && (
          <Text style={styles.role}>{profile.experience[0].position}</Text>
        )}

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
                    {e.startDate} – {e.current ? "Present" : e.endDate ?? ""}
                  </Text>
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

        {profile.projects && profile.projects.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Projects</Text>
            {profile.projects.map((p, i) => (
              <View key={p.id ?? i} style={styles.expRow}>
                <Text style={styles.position}>{p.name}</Text>
                {p.role && <Text style={styles.company}>{p.role}</Text>}
                {p.description && <Text style={styles.desc}>{p.description}</Text>}
              </View>
            ))}
          </>
        )}

        <ExtraSections profile={profile} accent="#0f766e" skip={["projects", "languages"]} />
      </View>
    </Page>
  </Document>
);

export default SidebarColorTemplate;
