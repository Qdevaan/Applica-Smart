import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { CoverLetterData } from "./ClassicLetter";

const styles = StyleSheet.create({
  page: { padding: 56, fontFamily: "Helvetica", backgroundColor: "#FFFFFF" },
  topRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32, alignItems: "flex-end" },
  name: { fontSize: 18, fontWeight: "bold", color: "#111111", letterSpacing: -0.3 },
  contact: { fontSize: 9, color: "#555555", textAlign: "right", lineHeight: 1.4 },
  divider: { height: 0.5, backgroundColor: "#cccccc", marginBottom: 24 },
  date: { fontSize: 10, color: "#555555", marginBottom: 24 },
  body: { fontSize: 10.5, lineHeight: 1.7, color: "#222222" },
  paragraph: { marginBottom: 12 },
  greeting: { fontSize: 10.5, marginBottom: 12, color: "#111111" },
  signOff: { fontSize: 10.5, color: "#555555", marginTop: 16 },
  signName: { fontSize: 11, fontWeight: "bold", color: "#111111", marginTop: 24 },
});

const splitBody = (text: string): string[] => {
  const trimmed = text.replace(/Dear[\s\S]*?,/i, "").replace(/Sincerely,[\s\S]*$/i, "").trim();
  return trimmed.split(/\n{2,}/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
};

export const MinimalLetter = ({ data }: { data: CoverLetterData }) => {
  const today = data.date ?? new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const paragraphs = splitBody(data.body);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{data.applicantName}</Text>
          <View>
            {data.applicantEmail && <Text style={styles.contact}>{data.applicantEmail}</Text>}
            {data.applicantPhone && <Text style={styles.contact}>{data.applicantPhone}</Text>}
            {data.applicantAddress && <Text style={styles.contact}>{data.applicantAddress}</Text>}
          </View>
        </View>
        <View style={styles.divider} />

        <Text style={styles.date}>{today}</Text>

        <View style={styles.body}>
          <Text style={styles.greeting}>Dear Hiring Manager at {data.company},</Text>
          {paragraphs.map((p, i) => (
            <Text key={i} style={[styles.body, styles.paragraph]}>{p}</Text>
          ))}
          <Text style={styles.signOff}>Sincerely,</Text>
          <Text style={styles.signName}>{data.applicantName}</Text>
        </View>
      </Page>
    </Document>
  );
};
