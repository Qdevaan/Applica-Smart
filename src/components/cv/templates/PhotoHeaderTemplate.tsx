import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";
import { ExtraSections } from "./_extraSections";

const ACCENT = "#1e40af";
const INK = "#0f172a";
const MUTED = "#475569";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", color: INK, backgroundColor: "#ffffff" },
  banner: {
    height: 150,
    backgroundColor: ACCENT,
    paddingHorizontal: 36,
    paddingVertical: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  photo: { width: 96, height: 96, borderRadius: 48, marginRight: 22, borderWidth: 3, borderColor: "#ffffff" },
  initialsCircle: {
    width: 96, height: 96, borderRadius: 48, marginRight: 22,
    backgroundColor: "#1e3a8a",
    borderWidth: 3, borderColor: "#ffffff",
    alignItems: "center", justifyContent: "center",
  },
  initialsText: { fontSize: 32, color: "#fff", fontFamily: "Helvetica-Bold" },
  bannerCol: { flex: 1 },
  name: { fontSize: 26, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  role: { fontSize: 12, color: "#dbeafe", marginTop: 4 },
  contact: { fontSize: 9, color: "#dbeafe", marginTop: 8 },
  body: { flexDirection: "row", paddingHorizontal: 32, paddingVertical: 22 },
  left: { width: "32%", paddingRight: 14 },
  right: { width: "68%", paddingLeft: 14, borderLeftWidth: 1, borderLeftColor: "#e2e8f0" },
  sideTitle: {
    fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
    color: ACCENT, fontFamily: "Helvetica-Bold",
    marginTop: 10, marginBottom: 4,
  },
  sideItem: { fontSize: 9.5, marginBottom: 3 },
  sectionTitle: {
    fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
    fontFamily: "Helvetica-Bold", color: ACCENT,
    borderBottomWidth: 1, borderBottomColor: ACCENT, paddingBottom: 2,
    marginTop: 12, marginBottom: 6,
  },
  bio: { fontSize: 10.5, lineHeight: 1.55 },
  expRow: { marginBottom: 9 },
  expHeader: { flexDirection: "row", justifyContent: "space-between" },
  position: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  dates: { fontSize: 9, color: MUTED },
  company: { fontSize: 10, color: MUTED, fontStyle: "italic", marginBottom: 2 },
  desc: { fontSize: 10, lineHeight: 1.5 },
});

const initials = (name?: string | null): string => {
  if (!name) return "•";
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
};

interface Props { profile: Profile; }

export const PhotoHeaderTemplate = ({ profile }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.banner}>
        {profile.photo_url ? (
          <Image src={profile.photo_url} style={styles.photo} />
        ) : (
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>{initials(profile.name)}</Text>
          </View>
        )}
        <View style={styles.bannerCol}>
          <Text style={styles.name}>{profile.name ?? "Your Name"}</Text>
          {profile.experience?.[0]?.position && (
            <Text style={styles.role}>{profile.experience[0].position}</Text>
          )}
          <Text style={styles.contact}>
            {[profile.email, profile.phone, profile.address].filter(Boolean).join("   •   ")}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.left}>
          {profile.skills && profile.skills.length > 0 && (
            <>
              <Text style={styles.sideTitle}>Skills</Text>
              {profile.skills.slice(0, 14).map((s, i) => (
                <Text key={i} style={styles.sideItem}>• {s}</Text>
              ))}
            </>
          )}
          {profile.languages && profile.languages.length > 0 && (
            <>
              <Text style={styles.sideTitle}>Languages</Text>
              {profile.languages.map((l, i) => (
                <Text key={i} style={styles.sideItem}>{l.name} — {l.proficiency}</Text>
              ))}
            </>
          )}
          {profile.hobbies && profile.hobbies.length > 0 && (
            <>
              <Text style={styles.sideTitle}>Interests</Text>
              {profile.hobbies.map((h, i) => (
                <Text key={i} style={styles.sideItem}>{h}</Text>
              ))}
            </>
          )}
        </View>

        <View style={styles.right}>
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

          <ExtraSections profile={profile} accent="#1e40af" skip={["languages"]} />
        </View>
      </View>
    </Page>
  </Document>
);

export default PhotoHeaderTemplate;
