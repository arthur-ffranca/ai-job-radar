import type { DemoReportRequest, ParsedProfile, RankedOpportunity } from "@/lib/job-radar-types";

export function buildCareerGaps(
  profile: ParsedProfile,
  job: RankedOpportunity,
  request: DemoReportRequest
) {
  const gaps: Array<{
    title: string;
    severity: "High" | "Medium" | "Low";
    recommendation: string;
  }> = job.profileGaps.map((gap) => ({
    title: `${gap} evidence`,
    severity: "Medium",
    recommendation: `Add a concrete example showing ${gap.toLowerCase()} experience if it appears in your background.`,
  }));

  if (profile.limited) {
    gaps.unshift({
      title: "Limited CV evidence",
      severity: "High",
      recommendation:
        "Upload a readable resume or paste resume text so AI Job Radar can compare real experience against this target role.",
    });
  }

  if (request.avoidKeywords.length) {
    gaps.push({
      title: "Avoid keyword filter",
      severity: "Low",
      recommendation: `Review postings for avoided terms: ${request.avoidKeywords.join(", ")}.`,
    });
  }

  return gaps.slice(0, 4);
}

export function optimizeResumeDraft(
  profile: ParsedProfile,
  job: RankedOpportunity,
  request: DemoReportRequest
) {
  const strongestSignals = [...profile.skills, ...profile.tools].slice(0, 5);

  return [
    `Optimized resume direction for ${request.targetRole}:`,
    strongestSignals.length
      ? `Lead with evidence around ${strongestSignals.join(", ")} because those signals appear in the uploaded profile and/or target posting.`
      : "Lead with measurable achievements from the uploaded CV before adding role-specific language.",
    `Mirror the posting language for ${job.requiredSkills.join(", ")} only where it is truthful to the CV.`,
    "Do not add unsupported tools, industries, or responsibilities.",
  ].join(" ");
}
