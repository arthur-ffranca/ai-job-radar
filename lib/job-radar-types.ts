export type Seniority = "Any" | "Junior" | "Mid-level" | "Senior" | "Lead";

export type WorkModel = "any" | "remote" | "hybrid" | "onsite";

export type DemoReportRequest = {
  resumeName: string;
  resumeText?: string;
  parsedProfile?: ParsedProfile | null;
  targetRole: string;
  location: string;
  workModel: WorkModel;
  seniority: Seniority;
  desiredIndustry: string;
  mustHaveKeywords: string[];
  avoidKeywords: string[];
};

export type RankedOpportunity = {
  company: string;
  role: string;
  location: string;
  workModel: string;
  estimatedSalary: string;
  matchScore: number;
  requiredSkills: string[];
  profileGaps: string[];
  description: string;
};

export type SkillSignal = {
  name: string;
  coverage: number;
  demand: "Core" | "Important" | "Emerging";
};

export type CareerGap = {
  title: string;
  severity: "High" | "Medium" | "Low";
  recommendation: string;
};

export type ParsedExperience = {
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
  toolsDetected: string[];
  domainSkillsDetected: string[];
};

export type ParsedEducation = {
  institution: string;
  degree: string;
  field: string;
  period: string;
  location: string;
};

export type ParsedLanguage = {
  language: string;
  level: string;
};

export type ParsedCertification = {
  name: string;
  issuer: string;
  date: string;
};

export type ParsedProfile = {
  name: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  currentRole: string;
  currentCompany: string;
  previousRoles: string[];
  professionalHeadline: string;
  currentOrPreviousRoles: string[];
  experience: ParsedExperience[];
  industries: string[];
  skills: string[];
  tools: string[];
  technicalSkills: string[];
  businessSkills: string[];
  seniorityLevel: Seniority;
  seniorityConfidence: string;
  educationDetails: ParsedEducation[];
  education: string[];
  certificationDetails: ParsedCertification[];
  certifications: string[];
  languageDetails: ParsedLanguage[];
  languages: string[];
  keywords: string[];
  targetRoleSuggestions: string[];
  limited: boolean;
  sourceNote: string;
};

export type ParseResumeResponse = {
  error?: string;
  file_name: string;
  raw_text: string;
  raw_text_length?: number;
  raw_text_preview?: string;
  llm_response_preview?: string;
  parsed_profile?: unknown;
  debug?: Record<string, unknown>;
  profile: {
    name: string;
    email: string;
    phone: string;
    location: string;
    headline: string;
    summary: string;
    current_role: string;
    current_company: string;
    seniority: {
      level: string;
      confidence: string;
    };
    experience: {
      company: string;
      role: string;
      period: string;
      location: string;
      bullets: string[];
      tools_detected: string[];
      domain_skills_detected: string[];
    }[];
    education: {
      institution: string;
      degree: string;
      field: string;
      period: string;
      location: string;
    }[];
    languages: {
      language: string;
      level: string;
    }[];
    certifications: {
      name: string;
      issuer: string;
      date: string;
    }[];
    tools: string[];
    technical_skills: string[];
    business_skills: string[];
    industries: string[];
    keywords: string[];
    target_role_suggestions: string[];
    previous_roles?: string[];
  };
};

export type JobRadarReport = {
  id: string;
  generatedAt: string;
  request: DemoReportRequest;
  parsedProfile: ParsedProfile;
  matchScore: number;
  fitSignal: string;
  relevanceWarning?: string;
  limitedAnalysisNote?: string;
  snapshot: {
    targetRole: string;
    company: string;
    workModel: string;
    location: string;
    estimatedSalary: string;
    keySkills: string[];
  };
  rankedOpportunities: RankedOpportunity[];
  keySkills: SkillSignal[];
  careerGaps: CareerGap[];
  optimizedResume: string;
  reportSummary: string;
};
