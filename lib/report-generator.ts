import type { DemoReportRequest, JobRadarReport } from "@/lib/job-radar-types";
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
  const normalizedRequest: DemoReportRequest = {
    ...fallbackRequest,
    ...request,
    targetRole: request.targetRole?.trim() || fallbackRequest.targetRole,
    location: request.location?.trim() || fallbackRequest.location,
    desiredIndustry: request.desiredIndustry?.trim() || "",
    mustHaveKeywords: request.mustHaveKeywords || [],
    avoidKeywords: request.avoidKeywords || [],
  };
  const profile = normalizedRequest.parsedProfile ?? parseProfileFromResume(normalizedRequest);
  const rankedOpportunities = searchMockJobs(normalizedRequest)
    .map((job) => scoreJob(job, profile, normalizedRequest))
    .sort((a, b) => b.matchScore - a.matchScore);
  const bestJob = rankedOpportunities[0];
  const matchScore = bestJob?.matchScore || 0;
  const fitSignal = fitSignalFromScore(matchScore);
  const careerGaps = bestJob ? buildCareerGaps(profile, bestJob, normalizedRequest) : [];
  const keySkills = (bestJob?.requiredSkills || normalizedRequest.mustHaveKeywords).map((skill) => ({
    name: skill,
    coverage: profile.skills.concat(profile.tools).some((term) => term.toLowerCase() === skill.toLowerCase()) ? 88 : 42,
    demand: "Important" as const,
  }));

  return {
    id: `demo-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    request: normalizedRequest,
    parsedProfile: profile,
    matchScore,
    fitSignal,
    relevanceWarning:
      matchScore < 45
        ? "Your current CV has limited alignment with this target role. Here are the gaps."
        : undefined,
    limitedAnalysisNote: profile.limited
      ? "No readable CV was uploaded, so this is a limited target-role analysis rather than a full profile match."
      : undefined,
    snapshot: {
      targetRole: normalizedRequest.targetRole,
      company: bestJob?.company || "{company}",
      workModel: bestJob?.workModel || normalizedRequest.workModel,
      location: bestJob?.location || normalizedRequest.location || "{location}",
      estimatedSalary: bestJob?.estimatedSalary || "{salary_if_available}",
      keySkills: bestJob?.requiredSkills || [],
    },
    rankedOpportunities,
    keySkills,
    careerGaps,
    optimizedResume: bestJob
      ? optimizeResumeDraft(profile, bestJob, normalizedRequest)
      : "Upload a CV and select a target role to generate role-specific resume guidance.",
    reportSummary:
      matchScore < 45
        ? "AI Job Radar found limited alignment between the available CV context and the selected target role. The report focuses on gaps and next steps."
        : `AI Job Radar evaluated the uploaded profile against ${normalizedRequest.targetRole} opportunities and ranked the strongest matches by role fit, required skills, seniority, location, work model, and avoided terms.`,
  };
}
