import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 60, fontFamily: "Times-Roman", backgroundColor: "#FFFFFF" },
  senderBlock: { marginBottom: 30 },
  senderName: { fontSize: 12, fontWeight: "bold" },
  senderInfo: { fontSize: 10, color: "#333333", lineHeight: 1.4 },
  date: { fontSize: 11, marginBottom: 24 },
  recipient: { fontSize: 11, marginBottom: 24, lineHeight: 1.5 },
  body: { fontSize: 11, lineHeight: 1.7, color: "#000000", textAlign: "justify" },
  paragraph: { marginBottom: 12 },
  signature: { marginTop: 28 },
});

export interface CoverLetterData {
  applicantName: string;
  applicantEmail?: string;
  applicantPhone?: string;
  applicantAddress?: string;
  company: string;
  jobTitle: string;
  body: string;
  date?: string;
}

const splitBody = (text: string): string[] => {
  const trimmed = text.replace(/Dear[\s\S]*?,/i, "").replace(/Sincerely,[\s\S]*$/i, "").trim();
  return trimmed.split(/\n{2,}/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
};

export const ClassicLetter = ({ data }: { data: CoverLetterData }) => {
  const today = data.date ?? new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const paragraphs = splitBody(data.body);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.senderBlock}>
          <Text style={styles.senderName}>{data.applicantName}</Text>
          {data.applicantAddress && <Text style={styles.senderInfo}>{data.applicantAddress}</Text>}
          {data.applicantEmail && <Text style={styles.senderInfo}>{data.applicantEmail}</Text>}
          {data.applicantPhone && <Text style={styles.senderInfo}>{data.applicantPhone}</Text>}
        </View>

        <Text style={styles.date}>{today}</Text>

        <View style={styles.recipient}>
          <Text>Hiring Manager</Text>
          <Text>{data.company}</Text>
        </View>

        <View>
          <Text style={[styles.body, styles.paragraph]}>Dear Hiring Manager,</Text>
          {paragraphs.map((p, i) => (
            <Text key={i} style={[styles.body, styles.paragraph]}>{p}</Text>
          ))}
        </View>

        <View style={styles.signature}>
          <Text style={styles.body}>Sincerely,</Text>
          <Text style={[styles.body, { marginTop: 28 }]}>{data.applicantName}</Text>
        </View>
      </Page>
    </Document>
  );
};
