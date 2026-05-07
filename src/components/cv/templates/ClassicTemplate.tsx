import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";
import { ExtraSections } from "./_extraSections";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Times-Roman",
  },
  header: {
    textAlign: "center",
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: "2pt solid #000",
  },
  name: {
    fontSize: 24,
    fontFamily: "Times-Bold",
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 10,
    marginTop: 5,
    lineHeight: 1.4,
  },
  section: {
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Times-Bold",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bio: {
    fontSize: 11,
    lineHeight: 1.6,
    textAlign: "justify",
  },
  experienceItem: {
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: "Times-Bold",
  },
  company: {
    fontSize: 11,
    fontStyle: "italic",
  },
  dateRange: {
    fontSize: 10,
    fontStyle: "italic",
  },
  description: {
    fontSize: 10,
    marginTop: 5,
    lineHeight: 1.5,
  },
  educationItem: {
    marginBottom: 12,
  },
  degree: {
    fontSize: 11,
    fontFamily: "Times-Bold",
  },
  institution: {
    fontSize: 10,
    fontStyle: "italic",
  },
  educationDetails: {
    fontSize: 10,
  },
  skillsList: {
    fontSize: 10,
    lineHeight: 1.5,
  },
});

interface ClassicTemplateProps {
  profile: Profile;
}

export const ClassicTemplate = ({ profile }: ClassicTemplateProps) => {
  const formatEducation = (edu: any) => {
    if (edu.level === "school") {
      return `${edu.schoolType === "matric" ? "Matriculation" : "O-Levels"}${
        edu.schoolMarks ? ` (${edu.schoolMarks})` : ""
      }`;
    } else if (edu.level === "college") {
      return `${edu.collegeProgram?.toUpperCase() || "Intermediate"}${
        edu.collegeMarks ? ` (${edu.collegeMarks})` : ""
      }`;
    } else if (edu.level === "university") {
      return `${edu.degreeType || ""} ${edu.degree || ""}${
        edu.cgpa ? ` (CGPA: ${edu.cgpa})` : ""
      }`;
    }
    return "";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {profile.name?.toUpperCase() || "YOUR NAME"}
          </Text>
          <View style={styles.contactInfo}>
            {profile.email && <Text>{profile.email}</Text>}
            {profile.phone && <Text>{profile.phone}</Text>}
            {profile.address && <Text>{profile.address}</Text>}
          </View>
        </View>

        {/* Bio */}
        {profile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Objective</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
        )}

        {/* Experience */}
        {profile.experience && profile.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {profile.experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.row}>
                  <Text style={styles.jobTitle}>{exp.position}</Text>
                  <Text style={styles.dateRange}>
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
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
                <View style={styles.row}>
                  <Text style={styles.degree}>{formatEducation(edu)}</Text>
                  <Text style={styles.dateRange}>
                    {edu.startYear} - {edu.endYear}
                  </Text>
                </View>
                <Text style={styles.institution}>{edu.institutionName}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillsList}>{profile.skills.join(" • ")}</Text>
          </View>
        )}

        {/* Hobbies */}
        {profile.hobbies && profile.hobbies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests & Hobbies</Text>
            <Text style={styles.skillsList}>{profile.hobbies.join(", ")}</Text>
          </View>
        )}

        <ExtraSections profile={profile} accent="#111827" />
      </Page>
    </Document>
  );
};
