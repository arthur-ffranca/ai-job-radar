import type { DemoReportRequest, JobRadarReport, RoleTargetAnalysis } from "@/lib/job-radar-types";
import { scoreJob, fitSignalFromScore } from "@/lib/job-scorer";
import { searchMockJobs } from "@/lib/job-search";
import { parseProfileFromResume } from "@/lib/profile-parser";
import { buildCareerGaps, optimizeResumeDraft } from "@/lib/resume-optimizer";

const fallbackRequest: DemoReportRequest = {
  resumeName: "No CV uploaded",
  targetRole: "Selected Role",
  location: "",
  workModel: "any",
  seniority: "Any",
  desiredIndustry: "",
  mustHaveKeywords: [],
  avoidKeywords: [],
};

export function generateReport(request: Partial<DemoReportRequest> = {}): JobRadarReport {
  const targetRoles = Array.from(
    new Set(
      (request.targetRoles?.length ? request.targetRoles : [request.targetRole || fallbackRequest.targetRole])
        .map((role) => role.trim())
        .filter(Boolean)
    )
  ).slice(0, 3);
  const normalizedRequest: DemoReportRequest = {
    ...fallbackRequest,
    ...request,
    targetRole: targetRoles[0] || fallbackRequest.targetRole,
    targetRoles,
    location: request.location?.trim() || fallbackRequest.location,
    desiredIndustry: request.desiredIndustry?.trim() || "",
    mustHaveKeywords: request.mustHaveKeywords || [],
    avoidKeywords: request.avoidKeywords || [],
  };
  const profile = normalizedRequest.parsedProfile ?? parseProfileFromResume(normalizedRequest);
  const roleAnalyses = targetRoles.map((targetRole) => buildRoleAnalysis(profile, {
    ...normalizedRequest,
    targetRole,
  }));
  const primaryAnalysis = roleAnalyses[0];
  const bestJob = primaryAnalysis?.rankedOpportunities[0];
  const matchScore = primaryAnalysis?.matchScore || 0;

  return {
    id: `demo-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    request: normalizedRequest,
    parsedProfile: profile,
    matchScore,
    fitSignal: primaryAnalysis?.fitSignal || fitSignalFromScore(matchScore),
    relevanceWarning:
      matchScore < 45
        ? "Your current CV has limited alignment with this target role. Here are the gaps."
        : undefined,
    limitedAnalysisNote: profile.limited
      ? "No readable CV was uploaded, so this is a limited target-role analysis rather than a full profile match."
      : undefined,
    snapshot: {
      targetRole: primaryAnalysis?.targetRole || normalizedRequest.targetRole,
      company: bestJob?.company || "{company}",
      workModel: bestJob?.workModel || normalizedRequest.workModel,
      location: bestJob?.location || normalizedRequest.location || "{location}",
      estimatedSalary: bestJob?.estimatedSalary || "{salary_if_available}",
      keySkills: bestJob?.requiredSkills || [],
    },
    rankedOpportunities: primaryAnalysis?.rankedOpportunities || [],
    keySkills: primaryAnalysis?.keySkills || [],
    careerGaps: primaryAnalysis?.careerGaps || [],
    optimizedResume: primaryAnalysis?.optimizedResume || "Upload a CV and select a target role to generate role-specific resume guidance.",
    reportSummary: primaryAnalysis?.reportSummary || "Upload a CV and select a target role to generate role-specific resume guidance.",
    roleAnalyses,
  };
}

function buildRoleAnalysis(
  profile: JobRadarReport["parsedProfile"],
  request: DemoReportRequest
): RoleTargetAnalysis {
  const rankedOpportunities = searchMockJobs(request)
    .map((job) => scoreJob(job, profile, request))
    .sort((a, b) => b.matchScore - a.matchScore);
  const bestJob = rankedOpportunities[0];
  const matchScore = bestJob?.matchScore || 0;
  const careerGaps = bestJob ? buildCareerGaps(profile, bestJob, request) : [];
  const keySkills = (bestJob?.requiredSkills || request.mustHaveKeywords).map((skill) => ({
    name: skill,
    coverage: profile.skills.concat(profile.tools).some((term) => term.toLowerCase() === skill.toLowerCase()) ? 88 : 42,
    demand: "Important" as const,
  }));

  return {
    targetRole: request.targetRole,
    matchScore,
    fitSignal: fitSignalFromScore(matchScore),
    rankedOpportunities,
    careerGaps,
    keySkills,
    optimizedResume: bestJob
      ? optimizeResumeDraft(profile, bestJob, request)
      : "Upload a CV and select a target role to generate role-specific resume guidance.",
    reportSummary:
      matchScore < 45
        ? `AI Job Radar found limited alignment between the available CV context and ${request.targetRole}. The report focuses on gaps and next steps.`
        : `AI Job Radar evaluated the uploaded profile against ${request.targetRole} opportunities and ranked the strongest matches by role fit, required skills, seniority, location, work model, and avoided terms.`,
  };
}
