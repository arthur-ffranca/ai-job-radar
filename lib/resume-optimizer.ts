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
    recommendation: `Inclua um exemplo concreto mostrando experiencia com ${gap.toLowerCase()}, se isso existir na sua trajetoria.`,
  }));

  if (profile.limited) {
    gaps.unshift({
      title: "Evidencia limitada no CV",
      severity: "High",
      recommendation:
        "Envie um CV legivel ou cole o texto do curriculo para o AI Job Radar comparar sua experiencia real com este cargo-alvo.",
    });
  }

  if (request.avoidKeywords.length) {
    gaps.push({
      title: "Filtro de palavras a evitar",
      severity: "Low",
      recommendation: `Revise vagas que contenham termos evitados: ${request.avoidKeywords.join(", ")}.`,
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
    `Direcao otimizada de CV para ${request.targetRole}:`,
    strongestSignals.length
      ? `Abra com evidencias sobre ${strongestSignals.join(", ")} porque esses sinais aparecem no perfil enviado e/ou na vaga-alvo.`
      : "Abra com conquistas mensuraveis do CV enviado antes de adicionar linguagem especifica do cargo.",
    `Espelhe a linguagem da vaga para ${job.requiredSkills.join(", ")} apenas quando isso for verdadeiro no CV.`,
    request.jobDescription
      ? "Como uma vaga especifica foi informada, priorize os requisitos e a linguagem dessa oportunidade antes de palavras mais gerais do mercado."
      : "Como nenhuma vaga especifica foi informada, esta reescrita usa inteligencia de mercado do cargo e o perfil-alvo selecionado.",
    "Nao adicione ferramentas, industrias ou responsabilidades que nao estejam sustentadas pelo CV.",
  ].join(" ");
}
