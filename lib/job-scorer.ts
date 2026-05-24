import type { DemoReportRequest, ParsedProfile, RankedOpportunity } from "@/lib/job-radar-types";

function normalize(values: string[]) {
  return values.map((value) => value.toLowerCase().trim()).filter(Boolean);
}

function overlapScore(profileTerms: string[], jobTerms: string[]) {
  const profile = new Set(normalize(profileTerms));
  const jobs = normalize(jobTerms);

  if (!jobs.length) {
    return 0;
  }

  const matches = jobs.filter((term) => profile.has(term));
  return Math.round((matches.length / jobs.length) * 100);
}

export function scoreJob(
  job: RankedOpportunity,
  profile: ParsedProfile,
  request: DemoReportRequest
): RankedOpportunity {
  const profileTerms = [
    ...profile.skills,
    ...profile.tools,
    ...profile.currentOrPreviousRoles,
    ...profile.industries,
    ...request.mustHaveKeywords,
  ];
  const skillScore = overlapScore(profileTerms, job.requiredSkills);
  const roleScore = profile.currentOrPreviousRoles.some((role) =>
    role.toLowerCase().includes(request.targetRole.toLowerCase())
  )
    ? 20
    : 8;
  const seniorityScore =
    request.seniority === "Any" || profile.seniorityLevel === request.seniority ? 12 : 5;
  const workModelScore =
    request.workModel === "any" || job.workModel.toLowerCase() === request.workModel ? 8 : 3;
  const avoidPenalty = request.avoidKeywords.some((keyword) =>
    job.description.toLowerCase().includes(keyword.toLowerCase())
  )
    ? 18
    : 0;
  const limitedPenalty = profile.limited ? 10 : 0;
  const matchScore = Math.max(
    18,
    Math.min(96, Math.round(skillScore * 0.55 + roleScore + seniorityScore + workModelScore - avoidPenalty - limitedPenalty))
  );
  const profileGaps = job.requiredSkills
    .filter((skill) => !normalize(profileTerms).includes(skill.toLowerCase()))
    .slice(0, 3);

  return {
    ...job,
    matchScore,
    profileGaps,
  };
}

export function fitSignalFromScore(score: number) {
  if (score >= 80) return "Forte aderencia";
  if (score >= 60) return "Boa aderencia";
  if (score >= 45) return "Aderencia parcial";
  return "Baixa aderencia";
}
