import type { DemoReportRequest, ParsedProfile, Seniority } from "@/lib/job-radar-types";

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function inferSeniority(text: string, fallback: Seniority): Seniority {
  const lower = text.toLowerCase();

  if (/\b(lead|head|director|principal|staff)\b/.test(lower)) {
    return "Lead";
  }

  if (/\b(senior|sr\.?)\b/.test(lower)) {
    return "Senior";
  }

  if (/\b(junior|jr\.?|intern|trainee)\b/.test(lower)) {
    return "Junior";
  }

  return fallback;
}

function extractLines(text: string, patterns: RegExp[]) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => patterns.some((pattern) => pattern.test(line)))
    .slice(0, 6);
}

export function parseProfileFromResume(request: DemoReportRequest): ParsedProfile {
  const resumeText = (request.resumeText || "").trim();
  const hasUsableText = resumeText.length > 80;
  const nonEmptyLines = resumeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const professionalHeadline =
    nonEmptyLines.find((line) => line.length > 8 && line.length < 110) ||
    `${request.seniority === "Any" ? "" : `${request.seniority} `}${request.targetRole}`.trim();

  const roleLines = extractLines(resumeText, [
    /\b(manager|lead|director|principal|staff|senior|junior|coordinator|specialist|consultant|engineer|developer|designer|analyst|associate)\b/i,
  ]);
  const skills = unique(request.mustHaveKeywords).slice(0, 10);
  const industries = request.desiredIndustry ? [request.desiredIndustry] : [];

  return {
    name: nonEmptyLines[0] || "",
    email: "",
    phone: "",
    location: request.location,
    headline: professionalHeadline,
    summary: nonEmptyLines.slice(1, 4).join(" "),
    currentRole: roleLines[0] || request.targetRole,
    currentCompany: "",
    previousRoles: roleLines.slice(1),
    professionalHeadline,
    currentOrPreviousRoles: roleLines.length ? roleLines : [request.targetRole],
    experience: [],
    industries,
    skills,
    tools: [],
    technicalSkills: [],
    businessSkills: skills,
    seniorityLevel: inferSeniority(resumeText, request.seniority),
    seniorityConfidence: hasUsableText ? "low" : "",
    educationDetails: [],
    education: extractLines(resumeText, [
      /\b(university|college|bachelor|mba|master|degree|graduation|academic|education|formacao|formacao academica)\b/i,
    ]),
    certificationDetails: [],
    certifications: extractLines(resumeText, [
      /\b(certified|certification|certificate|certifications|courses|certificados|certificacoes)\b/i,
    ]),
    languageDetails: [],
    languages: extractLines(resumeText, [
      /\b(english|portuguese|spanish|french|german|languages|idiomas|linguas)\b/i,
    ]),
    keywords: skills,
    targetRoleSuggestions: request.targetRole ? [request.targetRole] : [],
    limited: !hasUsableText,
    sourceNote: hasUsableText
      ? "O texto do CV foi lido localmente com extracao limitada de contingencia. O upload usa o parser universal do backend."
      : "Nenhum texto legivel de CV estava disponivel, entao o relatorio usa apenas o cargo-alvo e os campos do formulario.",
  };
}
