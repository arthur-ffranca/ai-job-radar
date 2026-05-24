import type { DemoReportRequest, JobRadarReport, RoleTargetAnalysis } from "@/lib/job-radar-types";
import { scoreJob, fitSignalFromScore } from "@/lib/job-scorer";
import { searchMockJobs } from "@/lib/job-search";
import { parseProfileFromResume } from "@/lib/profile-parser";
import { buildAdaptedCvDraft, buildCareerGaps, optimizeResumeDraft } from "@/lib/resume-optimizer";

const fallbackRequest: DemoReportRequest = {
  resumeName: "Nenhum CV enviado",
  targetRole: "Cargo selecionado",
  jobDescription: "",
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
    jobDescription: request.jobDescription?.trim() || "",
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
  const reportId = normalizedRequest.analysisId || `analysis-${Date.now()}`;

  return {
    id: reportId,
    analysisId: reportId,
    generatedAt: new Date().toISOString(),
    request: normalizedRequest,
    parsedProfile: profile,
    matchScore,
    fitSignal: primaryAnalysis?.fitSignal || fitSignalFromScore(matchScore),
    relevanceWarning:
      matchScore < 45
        ? "Seu CV atual tem alinhamento limitado com este cargo-alvo. Veja os gaps abaixo."
        : undefined,
    limitedAnalysisNote: profile.limited
      ? "Nenhum CV legivel foi enviado, entao esta e uma analise limitada por cargo-alvo, nao um match completo de perfil."
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
    optimizedResume: primaryAnalysis?.optimizedResume || "Envie um CV e selecione um cargo-alvo para gerar orientacoes de curriculo especificas.",
    adaptedCvDraft: primaryAnalysis?.adaptedCvDraft || "",
    reportSummary: primaryAnalysis?.reportSummary || "Envie um CV e selecione um cargo-alvo para gerar orientacoes de curriculo especificas.",
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
      : "Envie um CV e selecione um cargo-alvo para gerar orientacoes de curriculo especificas.",
    adaptedCvDraft: buildAdaptedCvDraft(profile, bestJob, request),
    reportSummary:
      matchScore < 45
        ? `O AI Job Radar encontrou alinhamento limitado entre o CV disponivel e ${request.targetRole}. O relatorio foca em gaps e proximos passos.`
        : `O AI Job Radar avaliou o perfil enviado contra oportunidades de ${request.targetRole} e ranqueou os melhores matches por fit, competencias exigidas, senioridade, localidade, modelo de trabalho e termos evitados.`,
  };
}
