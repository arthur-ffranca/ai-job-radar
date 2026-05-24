import type { DemoReportRequest, RankedOpportunity } from "@/lib/job-radar-types";

const roleSkillMap: Record<string, string[]> = {
  marketing: ["Gestao de campanhas", "Pesquisa de mercado", "CRM", "Estrategia de marca"],
  sales: ["Geracao de leads", "CRM", "Negociacao", "Aceleracao de vendas"],
  finance: ["Orcamento", "Forecasting", "Analise de risco", "Excel"],
  product: ["Descoberta de produto", "Roadmap", "Pesquisa com clientes", "Gestao de stakeholders"],
  engineering: ["Arquitetura de sistemas", "Qualidade de codigo", "Automacao", "Plataformas cloud"],
  operations: ["Melhoria de processos", "Gestao de projetos", "Forecasting", "Gestao de stakeholders"],
  hr: ["Recrutamento", "Operacoes de pessoas", "Experiencia do colaborador", "Gestao de stakeholders"],
  supply: ["Planejamento de demanda", "Planejamento de suprimentos", "Operacoes", "Forecasting"],
};

const industryCompanies: Record<string, string[]> = {
  finance: ["Nubank", "XP", "Stone"],
  fintech: ["Nubank", "Stripe", "Brex"],
  retail: ["Mercado Livre", "Magazine Luiza", "Amazon"],
  ecommerce: ["Mercado Livre", "Shopify", "Amazon"],
  healthcare: ["Alice", "Dasa", "Dr. Consulta"],
  logistics: ["Loggi", "Rappi", "DHL"],
  technology: ["Vercel", "OpenAI", "Linear"],
  saas: ["HubSpot", "Salesforce", "Notion"],
};

const marketSkillTerms = [
  "SQL",
  "Python",
  "Excel",
  "Power BI",
  "Tableau",
  "Forecasting",
  "Budgeting",
  "P&L",
  "Anaplan",
  "SAP",
  "CRM",
  "Salesforce",
  "HubSpot",
  "Roadmap",
  "Descoberta de produto",
  "Gestao de stakeholders",
  "Planejamento de demanda",
  "Planejamento de suprimentos",
  "Compras",
  "Logistica",
  "JavaScript",
  "React",
  "Node.js",
  "AWS",
  "Plataformas cloud",
  "Recrutamento",
  "Operacoes de pessoas",
];

const roleFamilyLabels: Record<string, string> = {
  marketing: "Marketing",
  sales: "Vendas",
  finance: "Financas",
  product: "Produto",
  engineering: "Engenharia",
  operations: "Operacoes",
  hr: "Recursos humanos",
  supply: "Supply chain",
  general: "Geral",
};

function roleFamily(role: string) {
  const lower = role.toLowerCase();

  if (/(marketing|growth|brand|content|crm|performance)/.test(lower)) return "marketing";
  if (/(sales|account|business development|revenue)/.test(lower)) return "sales";
  if (/(finance|financial|fp&a|accounting|controller)/.test(lower)) return "finance";
  if (/(product|pm|owner|growth product)/.test(lower)) return "product";
  if (/(engineer|developer|software|frontend|backend|platform)/.test(lower)) return "engineering";
  if (/(operations|ops|process|program)/.test(lower)) return "operations";
  if (/(hr|people|talent|recruit)/.test(lower)) return "hr";
  if (/(supply|procurement|logistics|planning)/.test(lower)) return "supply";

  return "general";
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function extractJobDescriptionSkills(description = "") {
  const lower = description.toLowerCase();

  return marketSkillTerms.filter((term) => lower.includes(term.toLowerCase()));
}

export function buildJobSearchTerms(targetRole: string): string[] {
  const role = targetRole.toLowerCase().trim();

  if (/(data analyst|analista de dados|analytics analyst)/.test(role)) {
    return [
      "Data Analyst",
      "Analista de Dados",
      "Business Intelligence Analyst",
      "BI Analyst",
      "Analytics Analyst",
      "Product Data Analyst",
    ];
  }

  if (/(bi analyst|business intelligence|analista de bi)/.test(role)) {
    return [
      "BI Analyst",
      "Business Intelligence Analyst",
      "Analista de BI",
      "Power BI Analyst",
      "Data Visualization Analyst",
      "Analytics Analyst",
    ];
  }

  if (/(data engineer|engenheiro de dados|analytics engineer|etl)/.test(role)) {
    return [
      "Data Engineer",
      "Engenheiro de Dados",
      "Analytics Engineer",
      "Data Pipeline Engineer",
      "Big Data Engineer",
      "ETL Developer",
    ];
  }

  if (/(fp&a|financial analyst|finance|planejamento financeiro|analista financeiro)/.test(role)) {
    return [
      "FP&A Analyst",
      "Financial Analyst",
      "Analista Financeiro",
      "Planejamento Financeiro",
      "Finance Business Partner",
    ];
  }

  return targetRole ? [targetRole] : [];
}

export function buildOpportunitySet(request: DemoReportRequest): RankedOpportunity[] {
  const targetRole = request.targetRole.trim() || "Cargo selecionado";
  const roleTerms = buildJobSearchTerms(targetRole);
  const primaryRoleTerm = roleTerms[0] || targetRole;
  const family = roleFamily(targetRole);
  const industryKey = request.desiredIndustry.toLowerCase();
  const companies = industryCompanies[industryKey] || industryCompanies[family] || [
    "Aster Labs",
    "Northstar Co.",
    "Atlas Group",
  ];
  const baseSkills = roleSkillMap[family] || ["Gestao de stakeholders", "Gestao de projetos", "Comunicacao", "Execucao"];
  const postingSkills = extractJobDescriptionSkills(request.jobDescription);
  const requiredSkills = Array.from(new Set([...request.mustHaveKeywords, ...postingSkills, ...baseSkills])).slice(0, 6);
  const location = request.location.trim() || "Qualquer localidade";
  const workModel =
    request.workModel === "any"
      ? "Flexivel"
      : ({ remote: "Remoto", hybrid: "Hibrido", onsite: "Presencial" }[request.workModel] || request.workModel);

  return companies.slice(0, 3).map((company, index) => ({
    company,
    role: index === 0 ? primaryRoleTerm : `${roleFamilyLabels[family] || titleCase(family)} ${index === 1 ? "Especialista" : "Gerente"}`,
    location,
    workModel,
    estimatedSalary: index === 0 ? "Salario disponivel apos triagem" : "Nao divulgado",
    matchScore: 0,
    requiredSkills,
    profileGaps: [],
    description: request.jobDescription
      ? `Inteligencia da vaga ${company} para ${targetRole}: ${request.jobDescription.slice(0, 520)}`
      : `${company} esta contratando para ${targetRole} com enfase em ${requiredSkills.join(", ")}. A vaga espera autonomia compativel com ${request.seniority === "Any" ? "o cargo" : request.seniority.toLowerCase()} e colaboracao em modelo ${workModel.toLowerCase()}.`,
  }));
}
