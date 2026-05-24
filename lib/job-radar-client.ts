import type { DemoReportRequest, JobRadarReport } from "@/lib/job-radar-types";

const REPORT_STORAGE_KEY = "ai-job-radar:last-report";
const ACTIVE_ANALYSIS_KEY = "ai-job-radar:active-analysis-id";

export type AnalyzeReportRequest = DemoReportRequest & {
  cvFile?: File | null;
};

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return "null";
  }
}

function assertBrowserStorage() {
  if (typeof window === "undefined") {
    throw new Error("Este fluxo so pode rodar no navegador.");
  }
}

export async function analyzeDemoReport(
  request: AnalyzeReportRequest,
  analysisId: string
): Promise<JobRadarReport> {
  assertBrowserStorage();

  const formData = new FormData();
  formData.append("analysisId", analysisId);
  formData.append("resumeName", request.resumeName);
  formData.append("resumeText", request.resumeText || "");
  formData.append("parsedProfile", safeJson(request.parsedProfile));
  formData.append("targetRole", request.targetRole);
  formData.append("targetRoles", safeJson(request.targetRoles || []));
  formData.append("jobDescription", request.jobDescription || "");
  formData.append("location", request.location || "");
  formData.append("workModel", request.workModel);
  formData.append("seniority", request.seniority);
  formData.append("desiredIndustry", request.desiredIndustry || "");
  formData.append("mustHaveKeywords", safeJson(request.mustHaveKeywords || []));
  formData.append("avoidKeywords", safeJson(request.avoidKeywords || []));

  if (request.cvFile) {
    formData.append("file", request.cvFile);
  }

  window.sessionStorage.setItem(ACTIVE_ANALYSIS_KEY, analysisId);
  window.sessionStorage.removeItem(REPORT_STORAGE_KEY);
  window.localStorage.removeItem(REPORT_STORAGE_KEY);

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error || "Nao foi possivel gerar a analise.");
  }

  if (result.analysisId !== analysisId) {
    throw new Error("A analise retornada nao corresponde a solicitacao ativa.");
  }

  const report = result as JobRadarReport;
  window.sessionStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(report));
  window.sessionStorage.setItem(ACTIVE_ANALYSIS_KEY, report.analysisId);
  window.localStorage.removeItem(REPORT_STORAGE_KEY);

  return report;
}

export function readStoredDemoReport(expectedAnalysisId?: string): JobRadarReport | null {
  if (typeof window === "undefined") {
    return null;
  }

  const activeAnalysisId = window.sessionStorage.getItem(ACTIVE_ANALYSIS_KEY);
  const stored = window.sessionStorage.getItem(REPORT_STORAGE_KEY);
  window.localStorage.removeItem(REPORT_STORAGE_KEY);

  if (!stored || !activeAnalysisId) {
    return null;
  }

  try {
    const report = JSON.parse(stored) as JobRadarReport;
    const matchesActiveAnalysis = report.analysisId === activeAnalysisId;
    const matchesRequestedAnalysis = expectedAnalysisId
      ? report.analysisId === expectedAnalysisId
      : true;

    return matchesActiveAnalysis && matchesRequestedAnalysis ? report : null;
  } catch {
    return null;
  }
}

export function clearStoredDemoReport() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(REPORT_STORAGE_KEY);
  window.sessionStorage.removeItem(ACTIVE_ANALYSIS_KEY);
  window.localStorage.removeItem(REPORT_STORAGE_KEY);
}
