import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { CoverLetterData } from "./ClassicLetter";

const ACCENT = "#0b1d3a";
const ACCENT_GOLD = "#c9a46a";

const styles = StyleSheet.create({
  page: { backgroundColor: "#FFFFFF", fontFamily: "Helvetica", padding: 0 },
  header: {
    backgroundColor: ACCENT,
    color: "#FFFFFF",
    paddingHorizontal: 50,
    paddingVertical: 28,
  },
  name: { fontSize: 22, fontWeight: "bold", letterSpacing: 1, color: "#FFFFFF" },
  contact: { fontSize: 9.5, color: "#dfe5ee", marginTop: 8, lineHeight: 1.5 },
  goldBar: { height: 4, backgroundColor: ACCENT_GOLD },
  body: { paddingHorizontal: 50, paddingVertical: 36 },
  date: { fontSize: 10.5, color: "#444", marginBottom: 16 },
  recipient: { marginBottom: 18 },
  recipientLine: { fontSize: 10.5, color: "#222", lineHeight: 1.5 },
  greeting: { fontSize: 11, fontWeight: "bold", color: ACCENT, marginBottom: 12 },
  paragraph: { fontSize: 10.5, lineHeight: 1.7, color: "#222", textAlign: "justify", marginBottom: 12 },
  signature: { marginTop: 24 },
  signOff: { fontSize: 11, color: "#222" },
  signName: { fontSize: 12, fontWeight: "bold", color: ACCENT, marginTop: 28 },
});

const splitBody = (text: string): string[] => {
  const trimmed = text.replace(/Dear[\s\S]*?,/i, "").replace(/Sincerely,[\s\S]*$/i, "").trim();
  return trimmed.split(/\n{2,}/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
};

export const ModernLetter = ({ data }: { data: CoverLetterData }) => {
  const today = data.date ?? new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const contactBits = [data.applicantEmail, data.applicantPhone, data.applicantAddress].filter(Boolean);
  const paragraphs = splitBody(data.body);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.applicantName}</Text>
          {contactBits.length > 0 && <Text style={styles.contact}>{contactBits.join("  •  ")}</Text>}
        </View>
        <View style={styles.goldBar} />

        <View style={styles.body}>
          <Text style={styles.date}>{today}</Text>
          <View style={styles.recipient}>
            <Text style={styles.recipientLine}>Hiring Manager</Text>
            <Text style={styles.recipientLine}>{data.company}</Text>
            <Text style={styles.recipientLine}>Re: {data.jobTitle}</Text>
          </View>

          <Text style={styles.greeting}>Dear Hiring Manager at {data.company},</Text>

          {paragraphs.map((p, i) => (
            <Text key={i} style={styles.paragraph}>{p}</Text>
          ))}

          <View style={styles.signature}>
            <Text style={styles.signOff}>Sincerely,</Text>
            <Text style={styles.signName}>{data.applicantName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
