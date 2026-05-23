import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";
import { ExtraSections } from "./_extraSections";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 35,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  contactInfo: {
    fontSize: 9,
    color: "#666",
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 18,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  bio: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#444",
  },
  experienceItem: {
    marginBottom: 14,
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  company: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
  dateRange: {
    fontSize: 9,
    color: "#999",
  },
  description: {
    fontSize: 9,
    color: "#555",
    marginTop: 4,
    lineHeight: 1.5,
  },
  educationItem: {
    marginBottom: 12,
  },
  degree: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  institution: {
    fontSize: 9,
    color: "#666",
    marginTop: 2,
  },
  educationDetails: {
    fontSize: 9,
    color: "#999",
    marginTop: 1,
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillItem: {
    fontSize: 9,
    color: "#444",
    marginRight: 15,
    marginBottom: 6,
  },
  hobbiesText: {
    fontSize: 9,
    color: "#555",
    lineHeight: 1.5,
  },
});

interface MinimalTemplateProps {
  profile: Profile;
}

export const MinimalTemplate = ({ profile }: MinimalTemplateProps) => {
  const formatEducation = (edu: any) => {
    if (edu.level === "school") {
      return `${edu.schoolType === "matric" ? "Matriculation" : "O-Levels"}${
        edu.schoolMarks ? ` - ${edu.schoolMarks}` : ""
      }`;
    } else if (edu.level === "college") {
      return `${edu.collegeProgram?.toUpperCase() || "College"}${
        edu.collegeMarks ? ` - ${edu.collegeMarks}` : ""
      }`;
    } else if (edu.level === "university") {
      return `${edu.degree || "Degree"}${
        edu.cgpa ? ` - CGPA ${edu.cgpa}` : ""
      }`;
    }
    return "";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name || "Your Name"}</Text>
          <Text style={styles.contactInfo}>
            {[profile.email, profile.phone, profile.address]
              .filter(Boolean)
              .join(" • ")}
          </Text>
        </View>

        <View style={styles.separator} />

        {/* Bio */}
        {profile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
        )}

        {/* Experience */}
        {profile.experience && profile.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profile.experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.flexRow}>
                  <Text style={styles.jobTitle}>{exp.position}</Text>
                  <Text style={styles.dateRange}>
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
                <Text style={styles.company}>{exp.company}</Text>
                {exp.description && (
                  <Text style={styles.description}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <Text style={styles.degree}>{formatEducation(edu)}</Text>
                <Text style={styles.institution}>{edu.institutionName}</Text>
                <Text style={styles.educationDetails}>
                  {edu.startYear} — {edu.endYear}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsGrid}>
              {profile.skills.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>
                  • {skill}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Hobbies */}
        {profile.hobbies && profile.hobbies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <Text style={styles.hobbiesText}>
              {profile.hobbies.join(" • ")}
            </Text>
          </View>
        )}

        <ExtraSections profile={profile} accent="#374151" />
      </Page>
    </Document>
  );
};
