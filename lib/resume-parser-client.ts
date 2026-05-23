import type { ParsedProfile, ParseResumeResponse, Seniority } from "@/lib/job-radar-types";

const PRODUCTION_API_URL = "https://ai-job-radar-api.onrender.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || PRODUCTION_API_URL;

export class ParseResumeDebugError extends Error {
  debugResult: unknown;

  constructor(message: string, debugResult: unknown) {
    super(message);
    this.name = "ParseResumeDebugError";
    this.debugResult = debugResult;
  }
}

function getResumeParserUrls() {
  const urls = [API_URL, PRODUCTION_API_URL, "/api"];

  return Array.from(new Set(urls.filter(Boolean))).map((url) =>
    url.endsWith("/") ? url.slice(0, -1) : url
  );
}

function createResumeFormData(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

function normalizeSeniority(value: string): Seniority {
  if (value === "Junior" || value === "Mid-level" || value === "Senior" || value === "Lead") {
    return value;
  }

  return "Any";
}

function validateParseResponse(value: unknown): asserts value is ParseResumeResponse {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid parser response.");
  }

  const response = value as Partial<ParseResumeResponse>;

  if (!response.file_name || typeof response.file_name !== "string") {
    throw new Error("Invalid parser response: missing file name.");
  }

  if (!response.raw_text || typeof response.raw_text !== "string") {
    throw new Error("Invalid parser response: raw text is empty.");
  }

  if (!response.profile || typeof response.profile !== "object") {
    throw new Error("Invalid parser response: missing profile.");
  }
}

function compactJoin(values: string[]) {
  return values.filter(Boolean).join(" - ");
}

function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function mapParsedProfile(response: ParseResumeResponse): ParsedProfile {
  const profile = response.profile;
  const backendTools = normalizeList(profile.tools);
  const backendTechnicalSkills = normalizeList(profile.technical_skills);
  const backendBusinessSkills = normalizeList(profile.business_skills);
  const backendIndustries = normalizeList(profile.industries);
  const backendKeywords = normalizeList(profile.keywords);
  const backendSuggestions = normalizeList(profile.target_role_suggestions);
  const experience = Array.isArray(profile.experience)
    ? profile.experience.map((item) => ({
        company: item.company || "",
        role: item.role || "",
        period: item.period || "",
        location: item.location || "",
        bullets: normalizeList(item.bullets),
        toolsDetected: normalizeList(item.tools_detected),
        domainSkillsDetected: normalizeList(item.domain_skills_detected),
      }))
    : [];
  const educationDetails = Array.isArray(profile.education)
    ? profile.education.map((item) => ({
        institution: item.institution || "",
        degree: item.degree || "",
        field: item.field || "",
        period: item.period || "",
        location: item.location || "",
      }))
    : [];
  const certificationDetails = Array.isArray(profile.certifications)
    ? profile.certifications.map((item) => ({
        name: item.name || "",
        issuer: item.issuer || "",
        date: item.date || "",
      }))
    : [];
  const languageDetails = Array.isArray(profile.languages)
    ? profile.languages.map((item) => ({
        language: item.language || "",
        level: item.level || "",
      }))
    : [];
  const currentOrPreviousRoles = [
    profile.current_role,
    ...experience.map((item) => item.role),
    ...normalizeList(profile.previous_roles),
  ].filter(Boolean);
  const inferredCurrentRole = profile.current_role || experience[0]?.role || "";
  const inferredCurrentCompany = profile.current_company || experience[0]?.company || "";
  const previousRoles = currentOrPreviousRoles.filter(
    (role, index) => index > 0 && role !== inferredCurrentRole
  );
  const education = educationDetails
    .map((item) => compactJoin([item.degree, item.field, item.institution, item.period]))
    .filter(Boolean);
  const certifications = certificationDetails
    .map((item) => compactJoin([item.name, item.issuer, item.date]))
    .filter(Boolean);
  const languages = languageDetails
    .map((item) => compactJoin([item.language, item.level]))
    .filter(Boolean);
  const skills = [
    ...backendTechnicalSkills,
    ...backendBusinessSkills,
    ...backendKeywords,
    ...experience.flatMap((item) => item.domainSkillsDetected),
  ].filter(Boolean);
  const tools = [
    ...backendTools,
    ...experience.flatMap((item) => item.toolsDetected),
  ].filter(Boolean);

  return {
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    headline: profile.headline,
    summary: profile.summary,
    currentRole: inferredCurrentRole,
    currentCompany: inferredCurrentCompany,
    previousRoles,
    professionalHeadline: profile.headline || inferredCurrentRole,
    currentOrPreviousRoles,
    experience,
    industries: backendIndustries,
    skills: Array.from(new Set(skills)),
    tools: Array.from(new Set(tools)),
    technicalSkills: backendTechnicalSkills,
    businessSkills: backendBusinessSkills,
    seniorityLevel: normalizeSeniority(profile.seniority?.level || ""),
    seniorityConfidence: profile.seniority?.confidence || "",
    educationDetails,
    education,
    certificationDetails,
    certifications,
    languageDetails,
    languages,
    keywords: backendKeywords,
    targetRoleSuggestions: backendSuggestions,
    limited: false,
    sourceNote: "Resume parsed by the universal backend extraction endpoint.",
  };
}

export async function parseResumeFile(file: File): Promise<{
  response: ParseResumeResponse;
  parsedProfile: ParsedProfile;
}> {
  if (!file) {
    throw new Error("Select a CV before parsing.");
  }

  if (!/\.(pdf|docx)$/i.test(file.name)) {
    throw new Error("Only PDF and DOCX files are supported.");
  }

  console.log("[AI Job Radar] selectedFile", file);
  console.log("[AI Job Radar] formData ready", {
    fileName: file.name,
    fileSize: file.size,
    parserUrls: getResumeParserUrls(),
  });

  let response: Response | null = null;
  let body: unknown = null;
  let lastError: unknown = null;
  const parserUrls = getResumeParserUrls();

  for (const parserUrl of parserUrls) {
    try {
      console.log("[AI Job Radar] parsing endpoint attempt", parserUrl);
      response = await fetch(`${parserUrl}/parse-resume`, {
        method: "POST",
        body: createResumeFormData(file),
      });

      body = await response.json().catch(() => null);
      console.log("[AI Job Radar] API response result", {
        parserUrl,
        status: response.status,
        body,
      });

      if (response.ok) {
        break;
      }

      lastError = body;
    } catch (error) {
      console.log("[AI Job Radar] parser endpoint failed", {
        parserUrl,
        error,
      });
      lastError = error;
      response = null;
      body = null;
    }
  }

  if (!response) {
    throw new ParseResumeDebugError(
      "Resume parser service is unavailable. Try again in a few seconds while the server wakes up.",
      lastError
    );
  }

  if (!response.ok) {
    const message =
      body &&
      typeof body === "object" &&
      "detail" in body &&
      typeof body.detail === "string"
        ? body.detail
        : "Error parsing CV. The parser did not accept this upload.";
    throw new ParseResumeDebugError(message, body);
  }

  validateParseResponse(body);

  if (body.error) {
    throw new ParseResumeDebugError(body.error, body);
  }

  if (!body.raw_text.trim()) {
    throw new ParseResumeDebugError("No text extracted", body);
  }

  const parsedProfile = mapParsedProfile(body);
  console.log("[AI Job Radar] extracted raw text length", body.raw_text.length);
  console.log("[AI Job Radar] parsed profile", parsedProfile);
  console.log("[AI Job Radar] full parser debug", body.debug || body);

  return {
    response: body,
    parsedProfile,
  };
}
