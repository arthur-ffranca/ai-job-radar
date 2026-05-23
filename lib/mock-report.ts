import type { DemoReportRequest, JobRadarReport } from "@/lib/job-radar-types";
import { generateReport } from "@/lib/report-generator";

export function buildMockReport(
  request?: Partial<DemoReportRequest>
): JobRadarReport {
  return generateReport(request);
}
