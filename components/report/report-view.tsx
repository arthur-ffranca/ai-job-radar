"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  Check,
  Code2,
  Download,
  FileText,
  Gauge,
  MapPin,
  Radar,
  ShieldAlert,
  SignalHigh,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BetaFeedbackCard } from "@/components/feedback/beta-feedback-card";
import { GlobalMarketIntelligence } from "@/components/report/global-market-intelligence";
import { readStoredDemoReport } from "@/lib/job-radar-client";
import type { DemoReportRequest, JobRadarReport, RoleTargetAnalysis } from "@/lib/job-radar-types";

function downloadTextFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadHtmlFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "role";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function listItems(values: string[]) {
  return values.length
    ? values.map((value) => `<li>${escapeHtml(value)}</li>`).join("")
    : "<li>Not detected</li>";
}

function roleReportText(report: JobRadarReport, analysis: RoleTargetAnalysis) {
  return [
    `Relatorio por cargo AI Job Radar: ${analysis.targetRole}`,
    `Gerado em: ${new Date(report.generatedAt).toLocaleString()}`,
    `Resume: ${report.request.resumeName}`,
    `Match score: ${analysis.matchScore}`,
    `Fit signal: ${analysis.fitSignal}`,
    "",
    analysis.reportSummary,
    "",
    "Oportunidades priorizadas:",
    ...analysis.rankedOpportunities.map(
      (job) => `- ${job.company}: ${job.matchScore} match (${job.requiredSkills.join(", ")})`
    ),
    "",
    "Gaps de carreira:",
    ...analysis.careerGaps.map(
      (gap) => `- ${gap.title} (${gap.severity}): ${gap.recommendation}`
    ),
  ].join("\n");
}

function resumeRewriteBlocks(report: JobRadarReport, analysis: RoleTargetAnalysis) {
  const profile = report.parsedProfile;
  const strongestSignals = [
    ...profile.tools,
    ...profile.technicalSkills,
    ...profile.businessSkills,
    ...profile.keywords,
  ].filter(Boolean).slice(0, 8);
  const topJob = analysis.rankedOpportunities[0];
  const requiredSkills = topJob?.requiredSkills || [];
  const missingSkills = topJob?.profileGaps || [];

  return {
    original:
      profile.professionalHeadline ||
      profile.currentRole ||
      "O CV atual ainda nao deixa claro o posicionamento profissional.",
    optimized: [
      profile.currentRole || analysis.targetRole,
      strongestSignals.length ? `com evidencias em ${strongestSignals.slice(0, 4).join(", ")}` : "com impacto profissional mensuravel",
      `posicionado para ${analysis.targetRole}`,
    ].filter(Boolean).join(" "),
    why: report.request.jobDescription
      ? "Esta reescrita prioriza a vaga colada e usa o CV para manter cada afirmacao baseada na experiencia real da pessoa."
      : "Esta reescrita usa o cargo-alvo e sinais gerais de mercado porque nenhuma vaga especifica foi colada.",
    bullets: [
      strongestSignals.length
        ? `Abrir o CV com provas ligadas a ${strongestSignals.slice(0, 3).join(", ")}.`
        : "Adicionar um resumo inicial mais forte com resultados mensuraveis do CV.",
      requiredSkills.length
        ? `Espelhar linguagem verdadeira da vaga: ${requiredSkills.slice(0, 4).join(", ")}.`
        : "Espelhar apenas requisitos que tenham suporte no CV.",
      missingSkills.length
        ? `Adicionar ou reforcar evidencias para: ${missingSkills.slice(0, 3).join(", ")}.`
        : "Manter o CV focado; nenhum gap critico apareceu nesta analise demonstrativa.",
    ],
  };
}

function insightsHtml(report: JobRadarReport, roleAnalyses: RoleTargetAnalysis[]) {
  const profile = report.parsedProfile;
  const candidateName = profile.name || "Candidate";
  const headline = profile.headline || profile.professionalHeadline || profile.currentRole || "Career profile";
  const strongestRole = [...roleAnalyses].sort((a, b) => b.matchScore - a.matchScore)[0];
  const generatedAt = new Date(report.generatedAt).toLocaleString();
  const profileTools = profile.tools.slice(0, 14);
  const profileSkills = [...profile.technicalSkills, ...profile.businessSkills, ...profile.keywords].slice(0, 18);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Job Radar Insights - ${escapeHtml(candidateName)}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #020617;
      --panel: rgba(15, 23, 42, 0.78);
      --panel-strong: rgba(2, 6, 23, 0.92);
      --line: rgba(148, 163, 184, 0.18);
      --text: #f8fafc;
      --muted: #94a3b8;
      --soft: #cbd5e1;
      --sky: #38bdf8;
      --emerald: #34d399;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at 18% 0%, rgba(56,189,248,0.16), transparent 34%),
        radial-gradient(circle at 88% 12%, rgba(52,211,153,0.12), transparent 30%),
        linear-gradient(180deg, #020617 0%, #030712 100%);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    body:before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px);
      background-size: 42px 42px;
      mask-image: linear-gradient(to bottom, black, transparent 78%);
    }
    main { position: relative; max-width: 1120px; margin: 0 auto; padding: 56px 24px 72px; }
    .badge {
      display: inline-flex;
      border: 1px solid rgba(56,189,248,0.28);
      background: rgba(56,189,248,0.10);
      color: #bae6fd;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    h1 { margin: 22px 0 0; font-size: clamp(38px, 6vw, 68px); line-height: 0.98; letter-spacing: 0; }
    h2 { margin: 0 0 14px; font-size: 22px; }
    h3 { margin: 0; font-size: 18px; }
    p { color: var(--muted); margin: 0; }
    .lead { max-width: 780px; margin-top: 20px; color: #cbd5e1; font-size: 18px; }
    .meta { margin-top: 24px; display: flex; flex-wrap: wrap; gap: 10px; }
    .pill {
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.04);
      border-radius: 8px;
      color: #dbeafe;
      padding: 8px 10px;
      font-size: 13px;
    }
    .grid { display: grid; gap: 16px; }
    .two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    section { margin-top: 34px; }
    .card {
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(15,23,42,0.86), rgba(2,6,23,0.72));
      border-radius: 14px;
      padding: 20px;
      box-shadow: 0 22px 80px rgba(0,0,0,0.28);
    }
    .score {
      font-size: 44px;
      line-height: 1;
      font-weight: 800;
      color: #bbf7d0;
    }
    .bar { height: 8px; margin-top: 14px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,0.09); }
    .bar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--sky), var(--emerald)); }
    .muted-label { color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.04em; }
    ul { margin: 12px 0 0; padding-left: 18px; color: #cbd5e1; }
    li { margin: 6px 0; }
    .role-card { display: flex; flex-direction: column; gap: 14px; }
    .role-top { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
    .opportunity {
      margin-top: 10px;
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(255,255,255,0.035);
      border-radius: 10px;
      padding: 12px;
    }
    .tag-wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .tag {
      border: 1px solid rgba(148,163,184,0.18);
      background: rgba(255,255,255,0.04);
      color: #dbeafe;
      border-radius: 7px;
      padding: 6px 8px;
      font-size: 12px;
    }
    .callout {
      border-color: rgba(52,211,153,0.24);
      background: linear-gradient(135deg, rgba(52,211,153,0.12), rgba(56,189,248,0.08));
    }
    @media (max-width: 820px) {
      main { padding: 36px 16px 48px; }
      .two, .three { grid-template-columns: 1fr; }
      .role-top { flex-direction: column; }
    }
  </style>
</head>
<body>
  <main>
    <span class="badge">AI Job Radar Insights Export</span>
    <h1>${escapeHtml(candidateName)} career intelligence snapshot.</h1>
    <p class="lead">${escapeHtml(headline)} analyzed across ${roleAnalyses.length} target role${roleAnalyses.length === 1 ? "" : "s"}. This export is personalized from the uploaded CV, extracted profile, selected role strategy, and AI Job Radar fit logic.</p>
    <div class="meta">
      <span class="pill">Generated: ${escapeHtml(generatedAt)}</span>
      <span class="pill">Resume: ${escapeHtml(report.request.resumeName)}</span>
      <span class="pill">Strongest path: ${escapeHtml(strongestRole?.targetRole || report.snapshot.targetRole)}</span>
    </div>

    <section class="grid three">
      <div class="card">
        <p class="muted-label">Current role</p>
        <h3>${escapeHtml(profile.currentRole || "Not detected")}</h3>
        <p>${escapeHtml(profile.currentCompany || "Company not detected")}</p>
      </div>
      <div class="card">
        <p class="muted-label">Seniority signal</p>
        <h3>${escapeHtml([profile.seniorityLevel, profile.seniorityConfidence].filter(Boolean).join(" - ") || "Not detected")}</h3>
        <p>Inferred only from CV titles, dates, and context.</p>
      </div>
      <div class="card">
        <p class="muted-label">Best match</p>
        <h3>${escapeHtml(strongestRole?.targetRole || "Not available")}</h3>
        <p>${strongestRole ? `${strongestRole.matchScore} match - ${escapeHtml(strongestRole.fitSignal)}` : "No role analysis available"}</p>
      </div>
    </section>

    <section class="card callout">
      <h2>Executive insight</h2>
      <p>${escapeHtml(strongestRole?.reportSummary || report.reportSummary)}</p>
    </section>

    <section>
      <h2>Target role comparison</h2>
      <div class="grid three">
        ${roleAnalyses.map((analysis, index) => `
          <article class="card role-card">
            <div class="role-top">
              <div>
                <p class="muted-label">Target role ${index + 1}</p>
                <h3>${escapeHtml(analysis.targetRole)}</h3>
                <p>${escapeHtml(analysis.fitSignal)}</p>
              </div>
              <div class="score">${analysis.matchScore}</div>
            </div>
            <div class="bar"><span style="width:${analysis.matchScore}%"></span></div>
            <p>${escapeHtml(analysis.reportSummary)}</p>
            <div class="opportunity">
              <p class="muted-label">Top opportunity</p>
              <h3>${escapeHtml(analysis.rankedOpportunities[0]?.company || "Not available")}</h3>
              <p>${escapeHtml(analysis.rankedOpportunities[0]?.role || analysis.targetRole)}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="grid two">
      <div class="card">
        <h2>Profile strengths detected</h2>
        <div class="tag-wrap">
          ${[...profileTools, ...profileSkills].slice(0, 24).map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("") || `<span class="tag">Not detected</span>`}
        </div>
      </div>
      <div class="card">
        <h2>Education, certifications, languages</h2>
        <p class="muted-label">Education</p>
        <ul>${listItems(profile.education.slice(0, 5))}</ul>
        <p class="muted-label" style="margin-top:16px">Certifications</p>
        <ul>${listItems(profile.certifications.slice(0, 5))}</ul>
        <p class="muted-label" style="margin-top:16px">Languages</p>
        <ul>${listItems(profile.languages.slice(0, 5))}</ul>
      </div>
    </section>

    <section>
      <h2>Role-specific gaps and resume moves</h2>
      <div class="grid">
        ${roleAnalyses.map((analysis) => `
          <article class="card">
            <h3>${escapeHtml(analysis.targetRole)}</h3>
            <p style="margin-top:8px">${escapeHtml(analysis.optimizedResume)}</p>
            <div class="grid two" style="margin-top:16px">
              <div>
                <p class="muted-label">Career gaps</p>
                <ul>${analysis.careerGaps.length ? analysis.careerGaps.map((gap) => `<li><strong>${escapeHtml(gap.title)}</strong> (${escapeHtml(gap.severity)}): ${escapeHtml(gap.recommendation)}</li>`).join("") : "<li>No major gaps detected in this mock analysis.</li>"}</ul>
              </div>
              <div>
                <p class="muted-label">Key skills for this role</p>
                <ul>${analysis.keySkills.length ? analysis.keySkills.map((skill) => `<li>${escapeHtml(skill.name)} - ${skill.coverage}% coverage</li>`).join("") : "<li>Not detected</li>"}</ul>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  </main>
</body>
</html>`;
}

export function ReportView({
  initialRequest,
}: {
  initialRequest?: DemoReportRequest;
}) {
  const router = useRouter();
  const [report] = useState<JobRadarReport | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return readStoredDemoReport();
  });

  const requestedRole = initialRequest?.targetRole || "your target role";
  const roleAnalyses = report?.roleAnalyses?.length
    ? report.roleAnalyses
    : report
      ? [{
          targetRole: report.snapshot.targetRole,
          matchScore: report.matchScore,
          fitSignal: report.fitSignal,
          reportSummary: report.reportSummary,
          optimizedResume: report.optimizedResume,
          rankedOpportunities: report.rankedOpportunities,
          careerGaps: report.careerGaps,
          keySkills: report.keySkills,
        }]
      : [];
  const insightsExportHtml = report ? insightsHtml(report, roleAnalyses) : "";

  const reportText = useMemo(() => {
    if (!report) {
      return "";
    }

    return [
      "AI Job Radar Report",
      `Generated: ${new Date(report.generatedAt).toLocaleString()}`,
      `Target role: ${report.snapshot.targetRole}`,
      `Company: ${report.snapshot.company}`,
      `Match score: ${report.matchScore}`,
      `Fit signal: ${report.fitSignal}`,
      "",
      report.reportSummary,
      report.limitedAnalysisNote ? `\n${report.limitedAnalysisNote}` : "",
      "",
      "Career gaps:",
      ...report.careerGaps.map(
        (gap) => `- ${gap.title} (${gap.severity}): ${gap.recommendation}`
      ),
    ].join("\n");
  }, [report]);

  const snapshot = [
    {
      icon: BriefcaseBusiness,
      label: "Target Role",
      value: report?.snapshot.targetRole || "",
    },
    {
      icon: Building2,
      label: "Company",
      value: report?.snapshot.company || "",
    },
    {
      icon: MapPin,
      label: "Work Model",
      value: report ? `${report.snapshot.workModel} - ${report.snapshot.location}` : "",
    },
    {
      icon: BadgeDollarSign,
      label: "Estimated Salary",
      value: report?.snapshot.estimatedSalary || "",
    },
    {
      icon: Code2,
      label: "Key Skills",
      value: report?.snapshot.keySkills.join(", ") || "",
    },
    {
      icon: SignalHigh,
      label: "Fit Signal",
      value: report?.fitSignal || "",
    },
  ];

  if (!report) {
    return (
      <div className="mx-auto max-w-5xl">
        <Card className="border-sky-300/20 bg-slate-950/82 shadow-panel backdrop-blur">
          <CardContent className="p-8 sm:p-10">
            <div className="flex size-12 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
              <Upload className="size-6" />
            </div>
            <Badge variant="pulse" className="mt-6">
              CV required
            </Badge>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              No processed resume was found for this report.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
              This page was opened for {requestedRole}, but AI Job Radar did not receive a parsed CV from the upload flow. Upload the resume first so the report can use the real profile, skills, education, languages, and experience.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-[auto_auto] sm:justify-start">
              <Button size="lg" onClick={() => router.push("/demo")}>
                <Upload />
                Upload CV
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/")}>
                Back to product
              </Button>
            </div>
            <div className="mt-8 rounded-md border border-white/10 bg-white/[0.035] p-4">
              <p className="text-sm font-medium text-white">Debug note</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Reports are now blocked unless a parsed resume exists in browser storage. Query parameters alone no longer create a fake fallback report.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-10 grid gap-6 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
        <motion.div
          initial={{ opacity: 0.96, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <Badge variant="pulse">Relatorio de inteligencia de carreira</Badge>
          <h1 className="mt-7 text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Seu relatorio de inteligencia esta pronto.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Uma visao estrategica do seu fit, melhores oportunidades, provas ausentes e revisoes de CV por cargo. Cada cargo-alvo recebe uma direcao propria de curriculo e relatorio para download.
          </p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Button
            size="lg"
            onClick={() =>
              downloadTextFile("ai-job-radar-optimized-resume.txt", report.optimizedResume)
            }
          >
            <Download />
            Baixar CV principal
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              downloadHtmlFile("ai-job-radar-insights.html", insightsExportHtml)
            }
          >
            <Radar />
            Baixar insights
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => downloadTextFile("ai-job-radar-report.txt", reportText)}
          >
            <FileText />
            Baixar relatorio
          </Button>
        </div>
      </div>

      <GlobalMarketIntelligence />

      <div className="mb-6 mt-12">
        <Badge variant="pulse">Insights pessoais de carreira</Badge>
        <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
          Seu fit privado e sua estrategia de candidatura.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          Estes insights usam o CV enviado, os cargos escolhidos e o relatorio gerado. Eles ficam separados da camada global de mercado acima.
        </p>
      </div>

      <Card className="mb-6 border-white/10 bg-slate-950/82 shadow-panel backdrop-blur">
        <CardHeader className="p-5">
          <div className="flex items-center gap-3">
            <BriefcaseBusiness className="size-5 text-sky-200" />
            <CardTitle className="text-xl">Comparacao de estrategia por cargo</CardTitle>
          </div>
          <p className="text-sm leading-6 text-slate-400">
            O AI Job Radar cria uma revisao de CV separada para cada cargo-alvo, assim a pessoa compara caminhos e baixa materiais especificos em vez de usar um curriculo generico.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 p-5 pt-0 lg:grid-cols-3">
          {roleAnalyses.map((analysis, index) => (
            <div
              key={analysis.targetRole}
              className="rounded-lg border border-white/10 bg-white/[0.035] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/25"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">Cargo-alvo {index + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {analysis.targetRole}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-semibold text-emerald-100">
                    {analysis.matchScore}
                  </p>
                  <p className="text-xs text-slate-500">match</p>
                </div>
              </div>
              <Badge variant={index === 0 ? "pulse" : "outline"} className="mt-4">
                {index === 0 ? "Recomendacao principal" : analysis.fitSignal}
              </Badge>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                {analysis.reportSummary}
              </p>
              <div className="mt-5 grid gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    downloadTextFile(
                      `ai-job-radar-${slugify(analysis.targetRole)}-optimized-resume.txt`,
                      analysis.optimizedResume
                    )
                  }
                >
                  <Download />
                  Baixar CV do cargo
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadTextFile(
                      `ai-job-radar-${slugify(analysis.targetRole)}-report.txt`,
                      roleReportText(report, analysis)
                    )
                  }
                >
                  <FileText />
                  Baixar relatorio do cargo
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-6 border-white/10 bg-slate-950/82 shadow-panel backdrop-blur">
        <CardHeader className="p-5">
          <div className="flex items-center gap-3">
            <FileText className="size-5 text-emerald-200" />
            <CardTitle className="text-xl">Estudio de reescrita do CV</CardTitle>
          </div>
          <p className="text-sm leading-6 text-slate-400">
            Cada bloco mostra como reposicionar o mesmo CV para um cargo ou vaga especifica. A logica nao inventa experiencia: ela muda enfase, ordem das provas e linguagem.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 p-5 pt-0 lg:grid-cols-3">
          {roleAnalyses.map((analysis) => {
            const rewrite = resumeRewriteBlocks(report, analysis);

            return (
              <div
                key={`rewrite-${analysis.targetRole}`}
                className="rounded-lg border border-white/10 bg-white/[0.035] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/25"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Cargo-alvo</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">
                      {analysis.targetRole}
                    </h3>
                  </div>
                  {report.request.jobDescription ? (
                    <Badge variant="pulse">Vaga colada</Badge>
                  ) : (
                    <Badge variant="outline">Mercado</Badge>
                  )}
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-md border border-white/10 bg-slate-950/55 p-3">
                    <p className="text-xs text-slate-500">Posicionamento atual</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {rewrite.original}
                    </p>
                  </div>
                  <div className="rounded-md border border-emerald-300/20 bg-emerald-300/10 p-3">
                    <p className="text-xs text-emerald-100/70">Posicionamento otimizado</p>
                    <p className="mt-2 text-sm font-medium leading-6 text-white">
                      {rewrite.optimized}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-400">
                  {rewrite.why}
                </p>
                <div className="mt-4 space-y-2">
                  {rewrite.bullets.map((bullet) => (
                    <div key={bullet} className="flex gap-2 text-sm leading-6 text-slate-300">
                      <Check className="mt-1 size-4 shrink-0 text-emerald-200" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          {report.relevanceWarning || report.limitedAnalysisNote ? (
            <Card className="border-sky-300/20 bg-sky-300/10 shadow-none">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-white">
                  {report.relevanceWarning || "Limited profile analysis"}
                </p>
                {report.limitedAnalysisNote ? (
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {report.limitedAnalysisNote}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-emerald-300/20 bg-emerald-300/10 shadow-glow">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-100/75">Match Score</p>
                  <CardTitle className="mt-3 text-7xl leading-none text-white">
                    {report.matchScore}
                  </CardTitle>
                </div>
                <Gauge className="size-7 text-emerald-100" />
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="h-2 rounded-full bg-white/10">
                <motion.div
                  initial={false}
                  animate={{ width: `${report.matchScore}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(56,189,248,0.92),rgba(52,211,153,0.96))]"
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {report.reportSummary}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/82 shadow-none">
            <CardHeader className="p-5">
              <div className="flex items-center gap-3">
                <Radar className="size-5 text-sky-200" />
                <CardTitle className="text-xl">Request details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-5 pt-0">
              {[
                ["Resume", report.request.resumeName],
                ["Target roles", (report.request.targetRoles?.length ? report.request.targetRoles : [report.request.targetRole]).join(", ")],
                ["Location", report.request.location || "Any location"],
                ["Work model", report.request.workModel],
                ["Seniority", report.request.seniority],
                ["Industry", report.request.desiredIndustry || "Any industry"],
                ["Vaga colada", report.request.jobDescription ? "Usada na analise" : "Nao informada"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2"
                >
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-sm font-medium text-slate-200">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/82 shadow-none">
            <CardHeader className="p-5">
              <CardTitle className="text-xl">Parsed CV profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5 pt-0">
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="mt-1 text-sm font-medium leading-5 text-white">
                  {report.parsedProfile.name || "Not detected"}
                </p>
              </div>
              {[
                ["Email", report.parsedProfile.email],
                ["Phone", report.parsedProfile.phone],
                ["Location", report.parsedProfile.location],
                ["Current company", report.parsedProfile.currentCompany],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-300">
                    {value || "Not detected"}
                  </p>
                </div>
              ))}
              <div>
                <p className="text-xs text-slate-500">Headline</p>
                <p className="mt-1 text-sm font-medium leading-5 text-white">
                  {report.parsedProfile.headline || report.parsedProfile.professionalHeadline || "Not detected"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Summary</p>
                <p className="mt-1 text-sm leading-5 text-slate-300">
                  {report.parsedProfile.summary || "Not detected"}
                </p>
              </div>
              {[
                ["Current role", report.parsedProfile.currentRole ? [report.parsedProfile.currentRole] : []],
                ["Previous roles", report.parsedProfile.previousRoles],
                ["Industries", report.parsedProfile.industries],
                ["Tools", report.parsedProfile.tools],
                ["Technical skills", report.parsedProfile.technicalSkills],
                ["Business skills", report.parsedProfile.businessSkills],
                ["Keywords", report.parsedProfile.keywords],
                ["Target suggestions", report.parsedProfile.targetRoleSuggestions],
                ["Education", report.parsedProfile.education],
                ["Certifications", report.parsedProfile.certifications],
                ["Languages", report.parsedProfile.languages],
                ["Seniority", [report.parsedProfile.seniorityLevel, report.parsedProfile.seniorityConfidence].filter(Boolean)],
              ].map(([label, values]) => (
                <div key={label as string}>
                  <p className="text-xs text-slate-500">{label as string}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-300">
                    {(values as string[]).length ? (values as string[]).join(", ") : "Not detected"}
                  </p>
                </div>
              ))}
              {report.parsedProfile.experience.length ? (
                <div>
                  <p className="text-xs text-slate-500">Experience</p>
                  <div className="mt-2 space-y-2">
                    {report.parsedProfile.experience.slice(0, 4).map((item) => (
                      <div
                        key={`${item.company}-${item.role}-${item.period}`}
                        className="rounded-md border border-white/10 bg-white/[0.035] p-3"
                      >
                        <p className="text-sm font-medium text-white">
                          {[item.role, item.company].filter(Boolean).join(" at ") || "Experience"}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {[item.period, item.location].filter(Boolean).join(" - ")}
                        </p>
                        {item.toolsDetected.length || item.domainSkillsDetected.length ? (
                          <p className="mt-2 text-xs leading-5 text-slate-400">
                            {[...item.toolsDetected, ...item.domainSkillsDetected].join(", ")}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-slate-950/82 shadow-panel backdrop-blur">
            <CardHeader className="p-5">
              <CardTitle className="text-xl">Job Intelligence Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 p-5 pt-0 sm:grid-cols-2 xl:grid-cols-3">
              {snapshot.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-md border border-white/10 bg-white/[0.04] p-3 transition duration-300 hover:border-sky-300/25 hover:bg-white/[0.06]"
                >
                  <Icon className="mb-3 size-4 text-sky-200" />
                  <p className="text-[11px] uppercase tracking-normal text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-medium leading-5 text-white">
                    {value}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-white/10 bg-white/[0.035] shadow-none">
              <CardHeader className="p-5">
                <CardTitle className="text-xl">Top ranked opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5 pt-0">
                {report.rankedOpportunities.map((opportunity, index) => (
                  <div
                    key={opportunity.company}
                    className="rounded-lg border border-white/10 bg-slate-950/55 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/25"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">
                          {opportunity.company}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {opportunity.role} · {opportunity.workModel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-emerald-100">
                          {opportunity.matchScore}
                        </p>
                        <p className="text-xs text-slate-500">match</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">
                      {opportunity.location} · {opportunity.estimatedSalary}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {opportunity.requiredSkills.map((skill) => (
                        <span
                          key={`${opportunity.company}-${skill}`}
                          className="rounded border border-white/10 bg-white/[0.035] px-2 py-1 text-[11px] text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    {opportunity.profileGaps.length ? (
                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        Gaps: {opportunity.profileGaps.join(", ")}
                      </p>
                    ) : null}
                    {index === 0 ? (
                      <Badge variant="pulse" className="mt-3">
                        Best fit
                      </Badge>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.035] shadow-none">
              <CardHeader className="p-5">
                <CardTitle className="text-xl">Key skills detected</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5 pt-0">
                {report.keySkills.map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-300">{skill.name}</span>
                      <span className="text-slate-500">{skill.demand}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <motion.div
                        initial={false}
                        animate={{ width: `${skill.coverage}%` }}
                        transition={{ duration: 0.7 }}
                        className="h-full rounded-full bg-[linear-gradient(90deg,rgba(56,189,248,0.9),rgba(52,211,153,0.9))]"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-white/10 bg-slate-950/82 shadow-none">
            <CardHeader className="p-5">
              <CardTitle className="text-xl">Career gaps</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 pt-0 md:grid-cols-3">
              {report.careerGaps.map((gap) => (
                <div
                  key={gap.title}
                  className="rounded-lg border border-white/10 bg-white/[0.035] p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <ShieldAlert className="size-5 text-sky-200" />
                    <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-400">
                      {gap.severity}
                    </span>
                  </div>
                  <p className="font-medium text-white">{gap.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {gap.recommendation}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <BetaFeedbackCard />
      </div>
    </div>
  );
}
