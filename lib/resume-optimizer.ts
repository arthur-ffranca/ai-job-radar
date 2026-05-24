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
    title: `Evidencia de ${gap}`,
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

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function markdownList(values: string[]) {
  return values.length
    ? values.map((value) => `- ${value}`).join("\n")
    : "- Nao detectado no CV original";
}

export function buildAdaptedCvDraft(
  profile: ParsedProfile,
  job: RankedOpportunity | undefined,
  request: DemoReportRequest
) {
  const profileTerms = unique([
    ...profile.skills,
    ...profile.tools,
    ...profile.technicalSkills,
    ...profile.businessSkills,
    ...profile.keywords,
  ]);
  const normalizedProfileTerms = new Set(profileTerms.map((term) => term.toLowerCase()));
  const requiredSkills = job?.requiredSkills || request.mustHaveKeywords;
  const supportedSkills = requiredSkills.filter((skill) =>
    normalizedProfileTerms.has(skill.toLowerCase())
  );
  const gaps = requiredSkills.filter((skill) => !normalizedProfileTerms.has(skill.toLowerCase()));
  const roleLine = profile.currentRole || profile.professionalHeadline || profile.headline;
  const companyLine = profile.currentCompany ? ` na ${profile.currentCompany}` : "";
  const headline = roleLine
    ? `**${roleLine}${companyLine}**`
    : "**Perfil profissional extraido do CV**";
  const summaryParts = [
    profile.summary,
    profile.headline,
    profile.professionalHeadline,
  ].filter(Boolean);
  const rewrittenSummary = summaryParts[0]
    ? `*${summaryParts[0]}*`
    : "*Resumo nao detectado no CV original; manter uma abertura objetiva baseada nas experiencias listadas abaixo.*";
  const experiences = profile.experience.slice(0, 4).map((item) => {
    const title = [item.role, item.company].filter(Boolean).join(" - ") || "Experiencia profissional";
    const period = [item.period, item.location].filter(Boolean).join(" - ");
    const bullets = item.bullets.length
      ? item.bullets.slice(0, 4).map((bullet) => `  - *${bullet}*`).join("\n")
      : "  - *Reorganizar esta experiencia com foco nas responsabilidades ja presentes no CV original.*";
    const detected = unique([...item.toolsDetected, ...item.domainSkillsDetected]);

    return [
      `### ${title}`,
      period ? `_${period}_` : "",
      bullets,
      detected.length ? `  - **Evidencias enfatizadas:** ${detected.join(", ")}` : "",
    ].filter(Boolean).join("\n");
  });

  return [
    `# CV adaptado - rascunho sugerido`,
    "",
    `Cargo-alvo: **${request.targetRole || "Cargo-alvo nao informado"}**`,
    `Arquivo analisado: **${request.resumeName}**`,
    "",
    "## Posicionamento",
    headline,
    "",
    "## Resumo profissional sugerido",
    rewrittenSummary,
    "",
    "## Competencias do CV que podem ser enfatizadas",
    markdownList(supportedSkills.map((skill) => `**${skill}**`)),
    "",
    "## Experiencia reorganizada",
    experiences.length ? experiences.join("\n\n") : "- Nao foi possivel extrair experiencias estruturadas do CV original.",
    "",
    "## Formacao e certificacoes extraidas",
    markdownList([...profile.education, ...profile.certifications]),
    "",
    "## Gaps que nao devem entrar no CV sem evidencia",
    gaps.length
      ? gaps.map((gap) => `- ${gap}`).join("\n")
      : "- Nenhum gap de competencia obrigatoria foi identificado nesta analise.",
    "",
    "> Regra aplicada: este rascunho reorganiza e melhora a redacao usando apenas informacoes extraidas do CV original. Competencias exigidas pela vaga que nao aparecem no CV foram listadas como gap.",
  ].join("\n");
}
