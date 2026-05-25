import type { DemoReportRequest, JobRadarReport } from "@/lib/job-radar-types";

export type AnalyzeReportRequest = DemoReportRequest & {
  cvFile?: File | null;
  anonId?: string;
};

let currentAnalysisReport: JobRadarReport | null = null;

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return "null";
  }
}

function assertBrowserRuntime() {
  if (typeof window === "undefined") {
    throw new Error("Este fluxo so pode rodar no navegador.");
  }
}

export async function analyzeDemoReport(
  request: AnalyzeReportRequest,
  analysisId: string
): Promise<JobRadarReport> {
  assertBrowserRuntime();
  currentAnalysisReport = null;

  const formData = new FormData();
  formData.append("analysisId", analysisId);
  formData.append("anonId", request.anonId || "");
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
  currentAnalysisReport = report;
  return report;
}

export function readStoredDemoReport(expectedAnalysisId?: string): JobRadarReport | null {
  if (!currentAnalysisReport) {
    return null;
  }

  if (expectedAnalysisId && currentAnalysisReport.analysisId !== expectedAnalysisId) {
    return null;
  }

  return currentAnalysisReport;
}

export function clearStoredDemoReport() {
  currentAnalysisReport = null;
}
