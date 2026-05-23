import { Text, View, Link } from "@react-pdf/renderer";
import type {
  Profile,
  Project,
  Certification,
  Language,
  Award,
  Volunteer,
  ReferenceEntry,
  Link as LinkEntry,
} from "../../../lib/supabase";

type Mode = "light" | "dark";
export type ExtraSectionId =
  | "projects"
  | "certifications"
  | "languages"
  | "awards"
  | "volunteer"
  | "references"
  | "links";

interface ExtraProps {
  profile: Profile;
  accent?: string;
  mode?: Mode;
  /** Render compact single-column variant (for sidebars / narrow columns) */
  compact?: boolean;
  /** Override default font size (base = 10, headings = 12) */
  baseFontSize?: number;
  /** Skip rendering these sections (template already handles them natively) */
  skip?: ExtraSectionId[];
}

const palette = (mode: Mode) =>
  mode === "dark"
    ? {
        title: "#FFFFFF",
        body: "#FFFFFF",
        muted: "#d1d5db",
        rule: "#a8c5e6",
      }
    : {
        title: "#111827",
        body: "#1f2937",
        muted: "#4b5563",
        rule: "#9ca3af",
      };

interface SectionProps {
  title: string;
  accent?: string;
  mode: Mode;
  baseFontSize: number;
  compact: boolean;
  children: React.ReactNode;
}

const Section = ({ title, accent, mode, baseFontSize, compact, children }: SectionProps) => {
  const c = palette(mode);
  return (
    <View style={{ marginBottom: compact ? 12 : 16 }} wrap={false}>
      <Text
        style={{
          fontSize: baseFontSize + 2,
          fontWeight: "bold",
          color: accent ?? c.title,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 1,
          borderBottom: `1pt solid ${c.rule}`,
          paddingBottom: 3,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
};

const fmtRange = (start?: string, end?: string) => {
  if (!start && !end) return "";
  if (start && end) return `${start} - ${end}`;
  return start || end || "";
};

const proficiencyLabel: Record<Language["proficiency"], string> = {
  native: "Native",
  fluent: "Fluent",
  professional: "Professional",
  intermediate: "Intermediate",
  basic: "Basic",
};

export const ExtraSections = ({
  profile,
  accent,
  mode = "light",
  compact = false,
  baseFontSize = 10,
  skip = [],
}: ExtraProps) => {
  const c = palette(mode);
  const skipSet = new Set(skip);

  const projects = skipSet.has("projects") ? [] : profile.projects ?? [];
  const certifications = skipSet.has("certifications") ? [] : profile.certifications ?? [];
  const languages = skipSet.has("languages") ? [] : profile.languages ?? [];
  const awards = skipSet.has("awards") ? [] : profile.awards ?? [];
  const volunteer = skipSet.has("volunteer") ? [] : profile.volunteer ?? [];
  const referencesList = skipSet.has("references") ? [] : profile.references_list ?? [];
  const links = skipSet.has("links") ? [] : profile.links ?? [];

  const hasAny =
    projects.length > 0 ||
    certifications.length > 0 ||
    languages.length > 0 ||
    awards.length > 0 ||
    volunteer.length > 0 ||
    referencesList.length > 0 ||
    links.length > 0;

  if (!hasAny) return null;

  const sectionProps = { accent, mode, baseFontSize, compact };

  return (
    <>
      {projects.length > 0 && (
        <Section title="Projects" {...sectionProps}>
          {projects.map((p: Project, i: number) => (
            <View key={p.id ?? i} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: baseFontSize, fontWeight: "bold", color: c.body }}>
                  {p.name}
                  {p.role ? ` - ${p.role}` : ""}
                </Text>
                {(p.startDate || p.endDate) && (
                  <Text style={{ fontSize: baseFontSize - 1, color: c.muted, fontStyle: "italic" }}>
                    {fmtRange(p.startDate, p.endDate)}
                  </Text>
                )}
              </View>
              {p.description && (
                <Text style={{ fontSize: baseFontSize - 1, color: c.body, marginTop: 2, lineHeight: 1.4 }}>
                  {p.description}
                </Text>
              )}
              {p.tech && p.tech.length > 0 && (
                <Text style={{ fontSize: baseFontSize - 1, color: c.muted, marginTop: 2 }}>
                  Tech: {p.tech.join(", ")}
                </Text>
              )}
              {p.link && (
                <Link
                  src={p.link}
                  style={{ fontSize: baseFontSize - 1, color: accent ?? c.body, marginTop: 1 }}
                >
                  {p.link}
                </Link>
              )}
            </View>
          ))}
        </Section>
      )}

      {certifications.length > 0 && (
        <Section title="Certifications" {...sectionProps}>
          {certifications.map((cert: Certification, i: number) => (
            <View key={cert.id ?? i} style={{ marginBottom: 6 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: baseFontSize, fontWeight: "bold", color: c.body }}>
                  {cert.name}
                </Text>
                {cert.date && (
                  <Text style={{ fontSize: baseFontSize - 1, color: c.muted, fontStyle: "italic" }}>
                    {cert.date}
                  </Text>
                )}
              </View>
              <Text style={{ fontSize: baseFontSize - 1, color: c.muted }}>
                {cert.issuer}
                {cert.credentialId ? ` - ID: ${cert.credentialId}` : ""}
              </Text>
              {cert.url && (
                <Link
                  src={cert.url}
                  style={{ fontSize: baseFontSize - 1, color: accent ?? c.body }}
                >
                  {cert.url}
                </Link>
              )}
            </View>
          ))}
        </Section>
      )}

      {languages.length > 0 && (
        <Section title="Languages" {...sectionProps}>
          <View style={{ flexDirection: compact ? "column" : "row", flexWrap: "wrap" }}>
            {languages.map((lang: Language, i: number) => (
              <Text
                key={i}
                style={{
                  fontSize: baseFontSize,
                  color: c.body,
                  marginRight: 14,
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontWeight: "bold" }}>{lang.name}</Text>
                {" - "}
                <Text style={{ color: c.muted }}>{proficiencyLabel[lang.proficiency]}</Text>
              </Text>
            ))}
          </View>
        </Section>
      )}

      {awards.length > 0 && (
        <Section title="Awards" {...sectionProps}>
          {awards.map((a: Award, i: number) => (
            <View key={a.id ?? i} style={{ marginBottom: 6 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: baseFontSize, fontWeight: "bold", color: c.body }}>
                  {a.title}
                </Text>
                {a.year && (
                  <Text style={{ fontSize: baseFontSize - 1, color: c.muted, fontStyle: "italic" }}>
                    {a.year}
                  </Text>
                )}
              </View>
              {a.issuer && (
                <Text style={{ fontSize: baseFontSize - 1, color: c.muted }}>{a.issuer}</Text>
              )}
              {a.description && (
                <Text style={{ fontSize: baseFontSize - 1, color: c.body, marginTop: 2 }}>
                  {a.description}
                </Text>
              )}
            </View>
          ))}
        </Section>
      )}

      {volunteer.length > 0 && (
        <Section title="Volunteer" {...sectionProps}>
          {volunteer.map((v: Volunteer, i: number) => (
            <View key={v.id ?? i} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: baseFontSize, fontWeight: "bold", color: c.body }}>
                  {v.role} - {v.organization}
                </Text>
                {(v.startDate || v.endDate) && (
                  <Text style={{ fontSize: baseFontSize - 1, color: c.muted, fontStyle: "italic" }}>
                    {fmtRange(v.startDate, v.endDate)}
                  </Text>
                )}
              </View>
              {v.description && (
                <Text style={{ fontSize: baseFontSize - 1, color: c.body, marginTop: 2, lineHeight: 1.4 }}>
                  {v.description}
                </Text>
              )}
            </View>
          ))}
        </Section>
      )}

      {referencesList.length > 0 && (
        <Section title="References" {...sectionProps}>
          {referencesList.map((r: ReferenceEntry, i: number) => (
            <View key={r.id ?? i} style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: baseFontSize, fontWeight: "bold", color: c.body }}>
                {r.name}
                {r.relation ? ` (${r.relation})` : ""}
              </Text>
              {r.contact && (
                <Text style={{ fontSize: baseFontSize - 1, color: c.muted }}>{r.contact}</Text>
              )}
            </View>
          ))}
        </Section>
      )}

      {links.length > 0 && (
        <Section title="Links" {...sectionProps}>
          {links.map((l: LinkEntry, i: number) => (
            <View key={i} style={{ marginBottom: 3 }}>
              <Link
                src={l.url}
                style={{ fontSize: baseFontSize, color: accent ?? c.body }}
              >
                {l.label || l.url}
              </Link>
            </View>
          ))}
        </Section>
      )}
    </>
  );
};
