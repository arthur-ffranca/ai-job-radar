import type {
  ApplicationAnswer,
  CoverLetter,
  CvChange,
  CvReader,
  DemoReportRequest,
  JobFit,
  JobRadarReport,
  LearningRecommendation,
  ParsedProfile,
  RankedOpportunity,
  RecommendationDraft,
  RoleTargetAnalysis,
} from "@/lib/job-radar-types";
import { scoreJob, fitSignalFromScore } from "@/lib/job-scorer";
import { buildOpportunitySet } from "@/lib/job-search";
import { buildAdaptedCvDraft, buildCareerGaps, optimizeResumeDraft } from "@/lib/resume-optimizer";

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function includesTerm(values: string[], term: string) {
  const normalized = term.toLowerCase();
  return values.some((value) => value.toLowerCase() === normalized || value.toLowerCase().includes(normalized));
}

function profileTerms(profile: ParsedProfile) {
  return unique([
    ...profile.skills,
    ...profile.tools,
    ...profile.technicalSkills,
    ...profile.businessSkills,
    ...profile.keywords,
    ...profile.industries,
    ...profile.currentOrPreviousRoles,
  ]);
}

function markdownList(values: string[]) {
  return values.length ? values.map((value) => `- ${value}`).join("\n") : "- Nao detectado no CV original";
}

function fitLevel(score: number): JobFit["fitLevel"] {
  if (score >= 80) return "Forte";
  if (score >= 65) return "Bom";
  if (score >= 50) return "Medio";
  return "Baixo";
}

function firstAvailable(values: string[], fallback: string) {
  return values.find((value) => value.trim()) || fallback;
}

function buildCvReader(profile: ParsedProfile, request: DemoReportRequest, bestJob: RankedOpportunity | undefined): CvReader {
  const terms = profileTerms(profile);
  const compatibleRoles = unique([
    ...profile.targetRoleSuggestions,
    ...profile.currentOrPreviousRoles,
    request.targetRole,
  ]).slice(0, 5);
  const strongAreas = terms.slice(0, 8);
  const weaklyEvidencedAreas = (bestJob?.profileGaps || [])
    .filter((gap) => !includesTerm(terms, gap))
    .slice(0, 6);
  const profileIdentified = profile.professionalHeadline || profile.headline || profile.currentRole || compatibleRoles[0] || "Perfil profissional identificado pelo CV";
  const perceivedSeniority = [profile.seniorityLevel, profile.seniorityConfidence].filter(Boolean).join(" - ") || "Nao detectada";
  const professionalNarrative = profile.summary || [profile.currentRole, profile.currentCompany, strongAreas.slice(0, 4).join(", ")]
    .filter(Boolean)
    .join(" com evidencias em ") || "O CV apresenta sinais profissionais, mas a narrativa ainda precisa ser explicitada com mais contexto.";

  return {
    profileIdentified,
    perceivedSeniority,
    professionalNarrative,
    strongAreas,
    weaklyEvidencedAreas,
    toolsAndSkillsFound: terms.slice(0, 18),
    compatibleRoles,
    interpretationRisk: weaklyEvidencedAreas.length
      ? `O CV pode ser interpretado como menos aderente quando a vaga exige ${weaklyEvidencedAreas.slice(0, 3).join(", ")}, pois esses sinais nao aparecem com clareza.`
      : "O principal risco e o CV nao explicitar impacto, contexto e resultados mesmo quando as competencias aparecem.",
    recruiterFirstImpression: strongAreas.length
      ? `Perfil com sinais consistentes em ${strongAreas.slice(0, 4).join(", ")}, baseado apenas no CV enviado.`
      : "Perfil ainda pouco estruturado para uma leitura rapida de recrutamento.",
    likelyInterviewQuestions: [
      `Como voce explicaria sua experiencia para uma vaga de ${request.targetRole}?`,
      strongAreas[0] ? `Qual exemplo concreto do seu CV comprova experiencia com ${strongAreas[0]}?` : "Quais experiencias do seu CV melhor demonstram impacto?",
      weaklyEvidencedAreas[0] ? `Como voce lidaria com a exigencia de ${weaklyEvidencedAreas[0]}, que nao aparece claramente no CV?` : "Quais projetos voce destacaria primeiro em uma entrevista?",
    ],
    positioningSuggestions: [
      "Abrir o CV com uma narrativa profissional objetiva e conectada ao cargo-alvo.",
      strongAreas.length ? `Evidenciar ${strongAreas.slice(0, 3).join(", ")} nas primeiras secoes.` : "Trazer competencias detectadas para uma secao ATS-friendly.",
      "Separar claramente ferramentas, competencias de negocio e experiencia profissional.",
    ],
  };
}

function buildJobFit(profile: ParsedProfile, request: DemoReportRequest, bestJob: RankedOpportunity | undefined): JobFit {
  const terms = profileTerms(profile);
  const requiredSkills = unique([...(bestJob?.requiredSkills || []), ...request.mustHaveKeywords]);
  const foundKeywords = requiredSkills.filter((skill) => includesTerm(terms, skill));
  const missingKeywords = requiredSkills.filter((skill) => !includesTerm(terms, skill));
  const fitScore = bestJob?.matchScore || 0;
  const level = fitLevel(fitScore);
  const hasSummary = Boolean(profile.summary || profile.headline || profile.professionalHeadline);
  const hasExperience = profile.experience.length > 0 || profile.currentOrPreviousRoles.length > 0;
  const seniorityAligned = request.seniority === "Any" || request.seniority === profile.seniorityLevel;

  return {
    fitScore,
    fitLevel: level,
    recommendation: fitScore < 50 ? "Nao recomendo aplicar agora sem ajustes relevantes." : "Recomendo aplicar com ajustes no CV.",
    summary: fitScore < 50
      ? `O CV ainda tem baixa aderencia para ${request.targetRole}. Priorize gaps e evidencias antes de aplicar.`
      : `O CV apresenta aderencia ${level.toLowerCase()} para ${request.targetRole}, considerando competencias, senioridade e palavras-chave detectadas.`,
    strengths: foundKeywords.length ? foundKeywords : terms.slice(0, 5),
    gaps: unique([...(bestJob?.profileGaps || []), ...missingKeywords]).slice(0, 8),
    missingKeywords,
    foundKeywords,
    risks: [
      !hasSummary ? "Resumo profissional pouco evidente para leitura rapida." : "Resumo pode ser fortalecido com linguagem mais alinhada ao cargo.",
      missingKeywords.length ? `Palavras-chave ausentes: ${missingKeywords.slice(0, 4).join(", ")}.` : "Nenhuma palavra-chave obrigatoria ficou claramente ausente.",
      !seniorityAligned ? "Senioridade selecionada nao aparece totalmente alinhada ao CV." : "Senioridade parece coerente com os sinais do CV.",
    ],
    sectionScores: {
      professionalSummary: hasSummary ? clamp(70 + foundKeywords.length * 4) : 35,
      experience: hasExperience ? clamp(68 + foundKeywords.length * 5) : 30,
      skills: requiredSkills.length ? clamp((foundKeywords.length / requiredSkills.length) * 100) : 55,
      atsKeywords: requiredSkills.length ? clamp((foundKeywords.length / requiredSkills.length) * 100) : 50,
      seniority: seniorityAligned ? 82 : 48,
    },
  };
}

function buildCvChanges(profile: ParsedProfile, request: DemoReportRequest, jobFit: JobFit): CvChange[] {
  const beforeSummary = profile.summary || profile.headline || profile.professionalHeadline || "Resumo profissional nao detectado no CV original.";
  const afterSummary = `*${beforeSummary}*\n\n**Enfase sugerida para ${request.targetRole}:** ${jobFit.foundKeywords.slice(0, 4).join(", ") || "competencias comprovadas no CV"}.`;
  const beforeSkills = profileTerms(profile).slice(0, 10).join(", ") || "Competencias nao estruturadas no CV original.";
  const afterSkills = jobFit.foundKeywords.length
    ? jobFit.foundKeywords.map((skill) => `**${skill}**`).join(", ")
    : beforeSkills;

  return [
    {
      section: "Resumo Profissional",
      before: beforeSummary,
      after: afterSummary,
      reason: "Ajustado para posicionar a narrativa do CV ao cargo-alvo sem adicionar informacoes externas.",
    },
    {
      section: "Competencias Principais",
      before: beforeSkills,
      after: afterSkills,
      reason: "Reordenado para priorizar palavras-chave exigidas pela vaga que tambem aparecem no CV.",
    },
    {
      section: "Gaps",
      before: "Skills ausentes podem ficar misturadas com competencias reais.",
      after: markdownList(jobFit.missingKeywords),
      reason: "Skills exigidas pela vaga, mas ausentes do CV, foram separadas como gaps e nao inseridas como experiencia.",
    },
  ];
}

function buildCoverLetter(profile: ParsedProfile, request: DemoReportRequest, jobFit: JobFit): CoverLetter {
  const name = profile.name || "Candidato(a)";
  const current = [profile.currentRole, profile.currentCompany].filter(Boolean).join(" na ");
  const strengths = jobFit.foundKeywords.slice(0, 4).join(", ");

  return {
    language: "pt-BR",
    tone: "professional",
    content: [
      `# Carta de apresentacao - rascunho`,
      "",
      `Ola, equipe de recrutamento,`,
      "",
      `Meu nome e ${name} e tenho interesse na oportunidade de **${request.targetRole}**${request.desiredIndustry ? ` na area de **${request.desiredIndustry}**` : ""}.`,
      current ? `*Atualmente meu CV apresenta experiencia como ${current}.*` : "*Meu CV apresenta experiencias e competencias que podem ser conectadas a esta oportunidade.*",
      strengths ? `Vejo aderencia especialmente em **${strengths}**, pontos que aparecem no meu CV e dialogam com a vaga.` : "Vejo oportunidade de conectar melhor minha trajetoria aos requisitos da vaga a partir das evidencias do CV.",
      `Estou buscando uma conversa para entender melhor o desafio e explicar como minha experiencia pode contribuir de forma objetiva, sem extrapolar o que esta documentado no meu CV.`,
      "",
      `Atenciosamente,  `,
      name,
    ].join("\n\n"),
  };
}

function buildRecommendationDraft(profile: ParsedProfile, request: DemoReportRequest): RecommendationDraft {
  const name = profile.name || "a pessoa candidata";
  const role = profile.currentRole || firstAvailable(profile.currentOrPreviousRoles, "sua experiencia profissional");

  return {
    requestMessage: `Ola! Estou me candidatando para oportunidades de ${request.targetRole} e gostaria de saber se voce se sentiria confortavel em revisar ou escrever uma recomendacao sobre meu trabalho em ${role}. Posso te enviar um rascunho apenas como ponto de partida, e voce fica totalmente livre para ajustar, aprovar ou descartar.`,
    formalLetterDraft: [
      `# Rascunho de carta de recomendacao para revisao`,
      "",
      `Este texto e apenas um rascunho para a pessoa recomendadora revisar e aprovar.`,
      "",
      `Recomendo ${name} com base na experiencia profissional apresentada em seu CV, especialmente em ${role}.`,
      `Durante a convivencia profissional ou academica, a pessoa recomendadora deve substituir este trecho por exemplos reais que tenha presenciado diretamente.`,
      `Para a oportunidade de ${request.targetRole}, o CV destaca competencias como ${profileTerms(profile).slice(0, 5).join(", ") || "competencias descritas no CV"}.`,
      "",
      `Assinatura: ____________________`,
    ].join("\n\n"),
    linkedinRecommendationDraft: `Rascunho para revisao: ${name} apresenta uma trajetoria conectada a ${role}. Recomendo que a pessoa revisora ajuste este texto com exemplos reais que tenha observado diretamente antes de publicar.`,
    disclaimer: "Este e um rascunho para revisao e aprovacao da pessoa recomendadora. Nao foi escrito nem assinado por terceiros.",
  };
}

function buildApplicationAnswers(profile: ParsedProfile, request: DemoReportRequest, jobFit: JobFit): ApplicationAnswer[] {
  const strengths = jobFit.foundKeywords.slice(0, 4).join(", ") || "competencias descritas no meu CV";
  const salary = request.location ? `considerando mercado de ${request.location} e escopo da vaga` : "considerando escopo, senioridade e modelo da vaga";

  return [
    {
      question: "Por que voce quer trabalhar nesta empresa?",
      answer: request.desiredIndustry
        ? `Tenho interesse pela area de ${request.desiredIndustry} e pela oportunidade de aplicar minha experiencia em ${strengths} em desafios conectados ao cargo de ${request.targetRole}.`
        : `Tenho interesse na oportunidade porque ela parece conectar meu historico profissional com o cargo de ${request.targetRole}, especialmente em ${strengths}.`,
    },
    {
      question: "Conte sobre sua experiencia com SQL.",
      answer: includesTerm(profileTerms(profile), "SQL") ? "Meu CV indica experiencia com SQL. Eu destacaria um exemplo concreto do CV, explicando objetivo, contexto, consultas realizadas e impacto no negocio." : "SQL nao aparece claramente no meu CV. Eu responderia com transparencia e trataria como ponto de desenvolvimento, sem afirmar experiencia que nao esta documentada.",
    },
    {
      question: "Conte sobre sua experiencia com dashboards.",
      answer: includesTerm(profileTerms(profile), "Power BI") || includesTerm(profileTerms(profile), "Tableau") || includesTerm(profileTerms(profile), "dashboard") ? "Meu CV mostra sinais de experiencia com dashboards/ferramentas analiticas. Eu explicaria o publico atendido, indicadores acompanhados e decisoes apoiadas." : "Dashboards nao aparecem claramente no CV. Eu nao inventaria experiencia; destacaria competencias analiticas reais e trataria dashboards como gap se for requisito central.",
    },
    {
      question: "Qual sua expectativa salarial?",
      answer: `Prefiro alinhar expectativa apos entender escopo, responsabilidade e modelo de trabalho. Como referencia inicial, avaliaria uma faixa compativel com ${salary}.`,
    },
    {
      question: "Voce tem experiencia com a ferramenta X?",
      answer: "Se a ferramenta aparecer no meu CV, eu traria um exemplo especifico. Se nao aparecer, eu deixaria claro que nao tenho evidencia documentada e explicaria como aprenderia rapidamente se for essencial.",
    },
    {
      question: "Voce pode trabalhar em ingles?",
      answer: profile.languages.length ? `Meu CV informa idiomas: ${profile.languages.join(", ")}. Eu responderia com o nivel real de conforto em reunioes, escrita e leitura tecnica.` : "Meu CV nao deixa idioma claro. Eu informaria meu nivel real de ingles sem exagerar fluencia.",
    },
    {
      question: "Conte sobre um projeto relevante.",
      answer: profile.experience[0]?.bullets[0] ? `Eu destacaria este ponto do CV: ${profile.experience[0].bullets[0]}` : "Eu escolheria uma experiencia real do CV e estruturaria a resposta em contexto, acao e resultado, sem adicionar metricas nao documentadas.",
    },
    {
      question: "Por que voce e aderente a vaga?",
      answer: `A aderencia vem de ${strengths}. Os gaps principais sao ${jobFit.missingKeywords.slice(0, 3).join(", ") || "baixos ou nao evidentes"}, que eu trataria com ajustes e estudo antes da candidatura.`,
    },
  ];
}

function buildLearningRecommendations(jobFit: JobFit): LearningRecommendation[] {
  return jobFit.missingKeywords.slice(0, 6).map((gap, index) => ({
    gap,
    priority: index < 2 ? "Alta" : index < 4 ? "Media" : "Baixa",
    whyItMatters: `Aparece como requisito ou sinal relevante para a vaga analisada e nao foi encontrado no CV original.`,
    suggestedStudyPath: [
      `Entender conceitos basicos de ${gap}`,
      `Fazer um exercicio pratico pequeno relacionado a ${gap}`,
      `Documentar o aprendizado em um projeto ou exemplo real antes de incluir no CV`,
    ],
  }));
}

export function generateReport(request: DemoReportRequest): JobRadarReport {
  const targetRoles = unique((request.targetRoles?.length ? request.targetRoles : [request.targetRole]).filter(Boolean)).slice(0, 3);
  const normalizedRequest: DemoReportRequest = {
    ...request,
    targetRole: targetRoles[0] || request.targetRole,
    targetRoles,
    jobDescription: request.jobDescription?.trim() || "",
    location: request.location?.trim() || "",
    desiredIndustry: request.desiredIndustry?.trim() || "",
    mustHaveKeywords: request.mustHaveKeywords || [],
    avoidKeywords: request.avoidKeywords || [],
  };
  const profile = normalizedRequest.parsedProfile;

  if (!profile) {
    throw new Error("Perfil extraido do CV ausente. Envie e processe um CV antes da analise.");
  }

  const roleAnalyses = targetRoles.map((targetRole) => buildRoleAnalysis(profile, {
    ...normalizedRequest,
    targetRole,
  }));
  const primaryAnalysis = roleAnalyses[0];
  const bestJob = primaryAnalysis?.rankedOpportunities[0];
  const matchScore = primaryAnalysis?.matchScore || 0;
  const reportId = normalizedRequest.analysisId || crypto.randomUUID();
  const cvReader = buildCvReader(profile, normalizedRequest, bestJob);
  const jobFit = buildJobFit(profile, normalizedRequest, bestJob);
  const cvChanges = buildCvChanges(profile, normalizedRequest, jobFit);

  return {
    id: reportId,
    analysisId: reportId,
    sourceFileName: normalizedRequest.resumeName,
    createdAt: new Date().toISOString(),
    generatedAt: new Date().toISOString(),
    request: normalizedRequest,
    parsedProfile: profile,
    cvReader,
    jobFit,
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
      company: bestJob?.company || normalizedRequest.desiredIndustry || "Empresa nao informada",
      workModel: bestJob?.workModel || normalizedRequest.workModel,
      location: bestJob?.location || normalizedRequest.location || "Localidade nao informada",
      estimatedSalary: bestJob?.estimatedSalary || "Nao divulgado",
      keySkills: bestJob?.requiredSkills || [],
    },
    rankedOpportunities: primaryAnalysis?.rankedOpportunities || [],
    keySkills: primaryAnalysis?.keySkills || [],
    careerGaps: primaryAnalysis?.careerGaps || [],
    optimizedResume: primaryAnalysis?.optimizedResume || "",
    adaptedCvDraft: primaryAnalysis?.adaptedCvDraft || "",
    cvChanges,
    coverLetter: buildCoverLetter(profile, normalizedRequest, jobFit),
    recommendationDraft: buildRecommendationDraft(profile, normalizedRequest),
    applicationAnswers: buildApplicationAnswers(profile, normalizedRequest, jobFit),
    learningRecommendations: buildLearningRecommendations(jobFit),
    reportSummary: primaryAnalysis?.reportSummary || "",
    roleAnalyses,
  };
}

function buildRoleAnalysis(
  profile: JobRadarReport["parsedProfile"],
  request: DemoReportRequest
): RoleTargetAnalysis {
  const rankedOpportunities = buildOpportunitySet(request)
    .map((job) => scoreJob(job, profile, request))
    .sort((a, b) => b.matchScore - a.matchScore);
  const bestJob = rankedOpportunities[0];
  const matchScore = bestJob?.matchScore || 0;
  const careerGaps = bestJob ? buildCareerGaps(profile, bestJob, request) : [];
  const terms = profileTerms(profile);
  const keySkills = (bestJob?.requiredSkills || request.mustHaveKeywords).map((skill) => ({
    name: skill,
    coverage: includesTerm(terms, skill) ? 88 : 42,
    demand: "Important" as const,
  }));

  return {
    targetRole: request.targetRole,
    matchScore,
    fitSignal: fitSignalFromScore(matchScore),
    rankedOpportunities,
    careerGaps,
    keySkills,
    optimizedResume: bestJob ? optimizeResumeDraft(profile, bestJob, request) : "",
    adaptedCvDraft: buildAdaptedCvDraft(profile, bestJob, request),
    reportSummary:
      matchScore < 45
        ? `O AI Job Radar encontrou alinhamento limitado entre o CV disponivel e ${request.targetRole}. O relatorio foca em gaps e proximos passos.`
        : `O AI Job Radar avaliou o perfil enviado contra oportunidades de ${request.targetRole} por fit, competencias exigidas, senioridade, localidade, modelo de trabalho e termos evitados.`,
  };
}
