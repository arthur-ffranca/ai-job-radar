import type { DemoReportRequest, JobRadarReport } from "@/lib/job-radar-types";
import { buildMockReport } from "@/lib/mock-report";

const REPORT_STORAGE_KEY = "ai-job-radar:last-report";

export async function generateDemoReport(
  request: DemoReportRequest
): Promise<JobRadarReport> {
  // Swap this timeout for a FastAPI POST when the backend is ready.
  await new Promise((resolve) => window.setTimeout(resolve, 3000));

  const report = buildMockReport(request);

  window.sessionStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(report));
  window.localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(report));
  return report;
}

export function readStoredDemoReport(): JobRadarReport | null {
  const stored =
    window.sessionStorage.getItem(REPORT_STORAGE_KEY) ||
    window.localStorage.getItem(REPORT_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as JobRadarReport;
  } catch {
    return null;
  }
}

export function getStoredDemoReport(
  fallbackRequest?: DemoReportRequest
): JobRadarReport {
  return readStoredDemoReport() ?? buildMockReport(fallbackRequest);
}

export function clearStoredDemoReport() {
  window.sessionStorage.removeItem(REPORT_STORAGE_KEY);
  window.localStorage.removeItem(REPORT_STORAGE_KEY);
}
