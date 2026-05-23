import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Profile } from "../../../lib/supabase";
import { ExtraSections } from "./_extraSections";

// Register fonts (optional - using default fonts)
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },
  // Left Sidebar (Blue)
  sidebar: {
    width: "35%",
    backgroundColor: "#1e3a5f",
    padding: 20,
    paddingTop: 30,
  },
  profileSection: {
    marginBottom: 25,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  contactInfo: {
    marginTop: 15,
  },
  contactItem: {
    fontSize: 9,
    color: "#FFFFFF",
    marginBottom: 6,
    lineHeight: 1.4,
  },
  contactLabel: {
    fontSize: 8,
    color: "#a8c5e6",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sidebarSection: {
    marginBottom: 25,
  },
  sidebarTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: "2pt solid #a8c5e6",
    paddingBottom: 5,
  },
  skillItem: {
    fontSize: 9,
    color: "#FFFFFF",
    marginBottom: 6,
    paddingLeft: 5,
  },
  skillBullet: {
    fontSize: 9,
    color: "#a8c5e6",
  },
  hobbyItem: {
    fontSize: 9,
    color: "#FFFFFF",
    marginBottom: 5,
  },
  // Right Content Area (White)
  content: {
    width: "65%",
    padding: 30,
    paddingTop: 30,
  },
  mainSection: {
    marginBottom: 20,
  },
  mainSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e3a5f",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: "2pt solid #1e3a5f",
    paddingBottom: 5,
  },
  bio: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#333",
    textAlign: "justify",
  },
  experienceItem: {
    marginBottom: 15,
  },
  jobTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e3a5f",
  },
  dateRange: {
    fontSize: 9,
    color: "#666",
    fontStyle: "italic",
  },
  company: {
    fontSize: 10,
    color: "#666",
    marginBottom: 5,
    fontStyle: "italic",
  },
  description: {
    fontSize: 9,
    color: "#444",
    lineHeight: 1.5,
  },
  educationItem: {
    marginBottom: 12,
  },
  degreeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  degree: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e3a5f",
  },
  institution: {
    fontSize: 10,
    color: "#666",
    fontStyle: "italic",
  },
  educationDetails: {
    fontSize: 9,
    color: "#666",
    marginTop: 2,
  },
});

interface ModernTemplateProps {
  profile: Profile;
}

export const ModernTemplate = ({ profile }: ModernTemplateProps) => {
  const formatEducation = (edu: any) => {
    if (edu.level === "school") {
      return `${edu.schoolType === "matric" ? "Matriculation" : "O-Levels"} - ${
        edu.schoolMarks ? `Marks: ${edu.schoolMarks}` : ""
      }`;
    } else if (edu.level === "college") {
      return `${edu.collegeProgram?.toUpperCase() || "College"} - ${
        edu.collegeMarks ? `Marks: ${edu.collegeMarks}` : ""
      }`;
    } else if (edu.level === "university") {
      return `${edu.degreeType || "Degree"} in ${edu.degree || ""}${
        edu.cgpa ? ` - CGPA: ${edu.cgpa}` : ""
      }`;
    }
    return "";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Left Sidebar (Blue) */}
        <View style={styles.sidebar}>
          {/* Profile/Name Section */}
          <View style={styles.profileSection}>
            <Text style={styles.name}>{profile.name || "Your Name"}</Text>
          </View>

          {/* Contact Information */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>Contact</Text>
            <View style={styles.contactInfo}>
              {profile.email && (
                <View>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactItem}>{profile.email}</Text>
                </View>
              )}
              {profile.phone && (
                <View>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactItem}>{profile.phone}</Text>
                </View>
              )}
              {profile.address && (
                <View>
                  <Text style={styles.contactLabel}>Address</Text>
                  <Text style={styles.contactItem}>{profile.address}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Skills in Sidebar */}
          {profile.skills && profile.skills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Skills</Text>
              {profile.skills.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>
                  <Text style={styles.skillBullet}>• </Text>
                  {skill}
                </Text>
              ))}
            </View>
          )}

          {/* Hobbies in Sidebar */}
          {profile.hobbies && profile.hobbies.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Interests</Text>
              {profile.hobbies.map((hobby, index) => (
                <Text key={index} style={styles.hobbyItem}>
                  <Text style={styles.skillBullet}>• </Text>
                  {hobby}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Right Content Area (White) */}
        <View style={styles.content}>
          {/* Professional Summary */}
          {profile.bio && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Professional Summary</Text>
              <Text style={styles.bio}>{profile.bio}</Text>
            </View>
          )}

          {/* Work Experience */}
          {profile.experience && profile.experience.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Work Experience</Text>
              {profile.experience.map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  <View style={styles.jobTitleRow}>
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
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Education</Text>
              {profile.education.map((edu, index) => (
                <View key={index} style={styles.educationItem}>
                  <View style={styles.degreeRow}>
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

          <ExtraSections profile={profile} accent="#1e3a5f" />
        </View>
      </Page>
    </Document>
  );
};
