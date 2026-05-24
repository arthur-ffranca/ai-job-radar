"use client";

import { useState } from "react";
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

function downloadHtmlFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function openPrintablePdf(contents: string) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");

  if (!printWindow) {
    downloadHtmlFile("ai-job-radar-relatorio.html", contents);
    return;
  }

  printWindow.document.open();
  printWindow.document.write(contents);
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => {
    printWindow.print();
  }, 450);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "role";
}

function workModelLabel(value: string) {
  const labels: Record<string, string> = {
    any: "Qualquer",
    remote: "Remoto",
    hybrid: "Hibrido",
    onsite: "Presencial",
  };

  return labels[value] || value;
}

function seniorityLabel(value: string) {
  const labels: Record<string, string> = {
    Any: "Qualquer",
    Junior: "Junior",
    "Mid-level": "Pleno",
    Senior: "Senior",
    Lead: "Lideranca",
  };

  return labels[value] || value;
}

function demandLabel(value: string) {
  const labels: Record<string, string> = {
    Core: "Essencial",
    Important: "Importante",
    Emerging: "Emergente",
  };

  return labels[value] || value;
}

function severityLabel(value: string) {
  const labels: Record<string, string> = {
    High: "Alta",
    Medium: "Media",
    Low: "Baixa",
  };

  return labels[value] || value;
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
    : "<li>Nao detectado</li>";
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

function resumeBeforeAfterHtml(report: JobRadarReport, analysis: RoleTargetAnalysis) {
  const profile = report.parsedProfile;
  const rewrite = resumeRewriteBlocks(report, analysis);
  const strongestSignals = [
    ...profile.tools,
    ...profile.technicalSkills,
    ...profile.businessSkills,
    ...profile.keywords,
  ].filter(Boolean).slice(0, 12);
  const topJob = analysis.rankedOpportunities[0];
  const requiredSkills = topJob?.requiredSkills || [];
  const gaps = analysis.careerGaps.slice(0, 4);
  const generatedAt = new Date(report.generatedAt).toLocaleString("pt-BR");
  const candidateName = profile.name || "Candidato";
  const currentRole = profile.currentRole || "Cargo atual nao detectado";
  const currentCompany = profile.currentCompany || "Empresa atual nao detectada";

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Job Radar - CV De-Para - ${escapeHtml(candidateName)}</title>
  <style>
    :root {
      --bg: #f8fafc;
      --ink: #0f172a;
      --muted: #475569;
      --soft: #64748b;
      --line: #dbe3ef;
      --panel: #ffffff;
      --sky: #0284c7;
      --emerald: #059669;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.45;
    }
    main { max-width: 1040px; margin: 0 auto; padding: 42px 28px 64px; }
    .hero {
      border: 1px solid var(--line);
      background:
        radial-gradient(circle at 10% 0%, rgba(2,132,199,0.12), transparent 34%),
        radial-gradient(circle at 92% 10%, rgba(5,150,105,0.10), transparent 32%),
        #fff;
      border-radius: 18px;
      padding: 28px;
      box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      border: 1px solid rgba(2,132,199,0.22);
      background: rgba(2,132,199,0.08);
      color: #075985;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
    }
    h1 { margin: 18px 0 0; font-size: 38px; line-height: 1.02; letter-spacing: -0.01em; }
    h2 { margin: 0 0 14px; font-size: 21px; }
    h3 { margin: 0; font-size: 16px; }
    p { margin: 0; color: var(--muted); }
    .meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
    .pill { border: 1px solid var(--line); background: #f8fafc; border-radius: 8px; padding: 7px 10px; font-size: 12px; color: #334155; }
    section { margin-top: 20px; }
    .grid { display: grid; gap: 14px; }
    .two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .card { border: 1px solid var(--line); border-radius: 14px; background: var(--panel); padding: 18px; }
    .label { color: var(--soft); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
    .score { font-size: 48px; line-height: 1; color: var(--emerald); font-weight: 850; }
    .depara { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .before { border-color: #cbd5e1; background: #f8fafc; }
    .after { border-color: rgba(5,150,105,0.28); background: linear-gradient(180deg, rgba(5,150,105,0.08), #ffffff); }
    ul { margin: 10px 0 0; padding-left: 18px; color: #334155; }
    li { margin: 6px 0; }
    .tag-wrap { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
    .tag { border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 7px; padding: 5px 8px; font-size: 12px; color: #334155; }
    .print-note { margin-top: 18px; font-size: 12px; color: var(--soft); }
    @media print {
      body { background: white; }
      main { padding: 0; max-width: none; }
      .hero, .card { box-shadow: none; break-inside: avoid; }
      .print-note { display: none; }
    }
    @media (max-width: 760px) {
      main { padding: 24px 14px 42px; }
      .two, .three, .depara { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <div class="hero">
      <span class="badge">AI Job Radar - CV De-Para</span>
      <h1>${escapeHtml(candidateName)}: revisao de CV para ${escapeHtml(analysis.targetRole)}.</h1>
      <p style="margin-top:14px; max-width:760px;">Este documento mostra como reposicionar o CV para o cargo-alvo sem inventar experiencias. Use o comando de impressao do navegador e escolha "Salvar como PDF".</p>
      <div class="meta">
        <span class="pill">Gerado em: ${escapeHtml(generatedAt)}</span>
        <span class="pill">CV: ${escapeHtml(report.request.resumeName)}</span>
        <span class="pill">Score: ${analysis.matchScore}</span>
        <span class="pill">Sinal: ${escapeHtml(analysis.fitSignal)}</span>
      </div>
    </div>

    <section class="grid three">
      <div class="card">
        <p class="label">Perfil atual</p>
        <h3>${escapeHtml(currentRole)}</h3>
        <p>${escapeHtml(currentCompany)}</p>
      </div>
      <div class="card">
        <p class="label">Cargo-alvo</p>
        <h3>${escapeHtml(analysis.targetRole)}</h3>
        <p>${escapeHtml(report.request.desiredIndustry || "Industria nao informada")}</p>
      </div>
      <div class="card">
        <p class="label">Match</p>
        <div class="score">${analysis.matchScore}</div>
      </div>
    </section>

    <section class="depara">
      <div class="card before">
        <p class="label">DE - posicionamento atual</p>
        <h2>${escapeHtml(rewrite.original)}</h2>
        <p>O CV atual pode estar correto, mas ainda nao deixa a proposta de valor suficientemente orientada ao cargo selecionado.</p>
      </div>
      <div class="card after">
        <p class="label">PARA - posicionamento recomendado</p>
        <h2>${escapeHtml(rewrite.optimized)}</h2>
        <p>${escapeHtml(rewrite.why)}</p>
      </div>
    </section>

    <section class="grid two">
      <div class="card">
        <h2>Movimentos recomendados no CV</h2>
        <ul>${rewrite.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
      <div class="card">
        <h2>Palavras e evidencias para reforcar</h2>
        <div class="tag-wrap">
          ${[...requiredSkills, ...strongestSignals].slice(0, 18).map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("") || `<span class="tag">Nao detectado</span>`}
        </div>
      </div>
    </section>

    <section class="grid two">
      <div class="card">
        <h2>Gaps identificados</h2>
        <ul>${gaps.length ? gaps.map((gap) => `<li><strong>${escapeHtml(gap.title)}</strong>: ${escapeHtml(gap.recommendation)}</li>`).join("") : "<li>Nenhum gap critico detectado nesta analise demonstrativa.</li>"}</ul>
      </div>
      <div class="card">
        <h2>Resumo otimizado</h2>
        <p>${escapeHtml(analysis.optimizedResume)}</p>
      </div>
    </section>

    <section class="card">
      <h2>Oportunidades priorizadas para este cargo</h2>
      <ul>
        ${analysis.rankedOpportunities.slice(0, 5).map((job) => `<li><strong>${escapeHtml(job.company)}</strong> - ${escapeHtml(job.role)} - ${job.matchScore} de match - ${escapeHtml(job.requiredSkills.join(", "))}</li>`).join("")}
      </ul>
    </section>

    <p class="print-note">Dica: na janela de impressao, escolha "Salvar como PDF" para gerar o arquivo final.</p>
  </main>
</body>
</html>`;
}

function insightsHtml(report: JobRadarReport, roleAnalyses: RoleTargetAnalysis[]) {
  const profile = report.parsedProfile;
  const candidateName = profile.name || "Candidate";
  const headline = profile.headline || profile.professionalHeadline || profile.currentRole || "Perfil de carreira";
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
    <span class="badge">Exportacao de insights AI Job Radar</span>
    <h1>${escapeHtml(candidateName)} career intelligence snapshot.</h1>
    <p class="lead">${escapeHtml(headline)} analyzed across ${roleAnalyses.length} target role${roleAnalyses.length === 1 ? "" : "s"}. This export is personalized from the uploaded CV, extracted profile, selected role strategy, and AI Job Radar fit logic.</p>
    <div class="meta">
      <span class="pill">Gerado em: ${escapeHtml(generatedAt)}</span>
      <span class="pill">CV: ${escapeHtml(report.request.resumeName)}</span>
      <span class="pill">Caminho mais forte: ${escapeHtml(strongestRole?.targetRole || report.snapshot.targetRole)}</span>
    </div>

    <section class="grid three">
      <div class="card">
        <p class="muted-label">Current role</p>
        <h3>${escapeHtml(profile.currentRole || "Nao detectado")}</h3>
        <p>${escapeHtml(profile.currentCompany || "Empresa nao detectada")}</p>
      </div>
      <div class="card">
        <p class="muted-label">Sinal de senioridade</p>
        <h3>${escapeHtml([seniorityLabel(profile.seniorityLevel), profile.seniorityConfidence].filter(Boolean).join(" - ") || "Nao detectado")}</h3>
        <p>Inferred only from CV titles, dates, and context.</p>
      </div>
      <div class="card">
        <p class="muted-label">Best match</p>
        <h3>${escapeHtml(strongestRole?.targetRole || "Nao disponivel")}</h3>
        <p>${strongestRole ? `${strongestRole.matchScore} match - ${escapeHtml(strongestRole.fitSignal)}` : "Nenhuma analise de cargo disponivel"}</p>
      </div>
    </section>

    <section class="card callout">
      <h2>Executive insight</h2>
      <p>${escapeHtml(strongestRole?.reportSummary || report.reportSummary)}</p>
    </section>

    <section>
      <h2>Comparacao por cargo-alvo</h2>
      <div class="grid three">
        ${roleAnalyses.map((analysis, index) => `
          <article class="card role-card">
            <div class="role-top">
              <div>
                <p class="muted-label">Cargo-alvo ${index + 1}</p>
                <h3>${escapeHtml(analysis.targetRole)}</h3>
                <p>${escapeHtml(analysis.fitSignal)}</p>
              </div>
              <div class="score">${analysis.matchScore}</div>
            </div>
            <div class="bar"><span style="width:${analysis.matchScore}%"></span></div>
            <p>${escapeHtml(analysis.reportSummary)}</p>
            <div class="opportunity">
              <p class="muted-label">Top opportunity</p>
              <h3>${escapeHtml(analysis.rankedOpportunities[0]?.company || "Nao disponivel")}</h3>
              <p>${escapeHtml(analysis.rankedOpportunities[0]?.role || analysis.targetRole)}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="grid two">
      <div class="card">
        <h2>Forcas detectadas no perfil</h2>
        <div class="tag-wrap">
          ${[...profileTools, ...profileSkills].slice(0, 24).map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("") || `<span class="tag">Nao detectado</span>`}
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
      <h2>Gaps e ajustes de CV por cargo</h2>
      <div class="grid">
        ${roleAnalyses.map((analysis) => `
          <article class="card">
            <h3>${escapeHtml(analysis.targetRole)}</h3>
            <p style="margin-top:8px">${escapeHtml(analysis.optimizedResume)}</p>
            <div class="grid two" style="margin-top:16px">
              <div>
                <p class="muted-label">Gaps de carreira</p>
                <ul>${analysis.careerGaps.length ? analysis.careerGaps.map((gap) => `<li><strong>${escapeHtml(gap.title)}</strong> (${escapeHtml(severityLabel(gap.severity))}): ${escapeHtml(gap.recommendation)}</li>`).join("") : "<li>Nenhum gap relevante detectado nesta analise.</li>"}</ul>
              </div>
              <div>
                <p class="muted-label">Competencias-chave para este cargo</p>
                <ul>${analysis.keySkills.length ? analysis.keySkills.map((skill) => `<li>${escapeHtml(skill.name)} - ${skill.coverage}% de cobertura</li>`).join("") : "<li>Nao detectado</li>"}</ul>
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

  const requestedRole = initialRequest?.targetRole || "seu cargo-alvo";
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

  const snapshot = [
    {
      icon: BriefcaseBusiness,
      label: "Cargo-alvo",
      value: report?.snapshot.targetRole || "",
    },
    {
      icon: Building2,
      label: "Empresa",
      value: report?.snapshot.company || "",
    },
    {
      icon: MapPin,
      label: "Modelo",
      value: report ? `${workModelLabel(report.snapshot.workModel)} - ${report.snapshot.location}` : "",
    },
    {
      icon: BadgeDollarSign,
      label: "Salario estimado",
      value: report?.snapshot.estimatedSalary || "",
    },
    {
      icon: Code2,
      label: "Competencias-chave",
      value: report?.snapshot.keySkills.join(", ") || "",
    },
    {
      icon: SignalHigh,
      label: "Sinal de fit",
      value: report?.fitSignal || "",
    },
  ];

  if (!report) {
    return (
      <div className="mx-auto max-w-5xl">
        <Card className="border-sky-300/20 bg-slate-900/82 shadow-panel backdrop-blur">
          <CardContent className="p-8 sm:p-10">
            <div className="flex size-12 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
              <Upload className="size-6" />
            </div>
            <Badge variant="pulse" className="mt-6">
              CV obrigatorio
            </Badge>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Nenhum CV processado foi encontrado para este relatorio.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
              Esta pagina foi aberta para {requestedRole}, mas o AI Job Radar nao recebeu um CV lido pelo fluxo de upload. Envie o curriculo primeiro para o relatorio usar perfil, competencias, formacao, idiomas e experiencia reais.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-[auto_auto] sm:justify-start">
              <Button size="lg" onClick={() => router.push("/demo")}>
                <Upload />
                Enviar CV
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/")}>
                Voltar ao produto
              </Button>
            </div>
            <div className="mt-8 rounded-md border border-white/10 bg-white/[0.035] p-4">
              <p className="text-sm font-medium text-white">Nota de debug</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Relatorios ficam bloqueados quando nao existe um CV processado no armazenamento do navegador. Parametros da URL sozinhos nao criam mais relatorios falsos.
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
              openPrintablePdf(resumeBeforeAfterHtml(report, roleAnalyses[0]))
            }
          >
            <Download />
            Gerar PDF do CV
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              openPrintablePdf(insightsExportHtml)
            }
          >
            <Radar />
            PDF de insights
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => openPrintablePdf(insightsExportHtml)}
          >
            <FileText />
            PDF do relatorio
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

      <Card className="mb-6 border-white/10 bg-slate-900/82 shadow-panel backdrop-blur">
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
                    openPrintablePdf(resumeBeforeAfterHtml(report, analysis))
                  }
                >
                  <Download />
                  Gerar PDF DE-PARA
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    openPrintablePdf(resumeBeforeAfterHtml(report, analysis))
                  }
                >
                  <FileText />
                  Abrir versao PDF
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-6 border-white/10 bg-slate-900/82 shadow-panel backdrop-blur">
        <CardHeader className="p-5">
          <div className="flex items-center gap-3">
            <FileText className="size-5 text-emerald-200" />
            <CardTitle className="text-xl">Laboratorio de reescrita do CV</CardTitle>
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
                  <div className="rounded-md border border-white/10 bg-slate-900/65 p-3">
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
                  {report.relevanceWarning || "Analise limitada do perfil"}
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
                  <p className="text-sm text-emerald-100/75">Score de match</p>
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

          <Card className="border-white/10 bg-slate-900/82 shadow-none">
            <CardHeader className="p-5">
              <div className="flex items-center gap-3">
                <Radar className="size-5 text-sky-200" />
                <CardTitle className="text-xl">Detalhes da solicitacao</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-5 pt-0">
              {[
                ["CV", report.request.resumeName],
                ["Cargos-alvo", (report.request.targetRoles?.length ? report.request.targetRoles : [report.request.targetRole]).join(", ")],
                ["Localidade", report.request.location || "Qualquer localidade"],
                ["Modelo de trabalho", workModelLabel(report.request.workModel)],
                ["Senioridade", seniorityLabel(report.request.seniority)],
                ["Industria", report.request.desiredIndustry || "Qualquer industria"],
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

          <Card className="border-white/10 bg-slate-900/82 shadow-none">
            <CardHeader className="p-5">
              <CardTitle className="text-xl">Perfil extraido do CV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5 pt-0">
              <div>
                <p className="text-xs text-slate-500">Nome</p>
                <p className="mt-1 text-sm font-medium leading-5 text-white">
                  {report.parsedProfile.name || "Nao detectado"}
                </p>
              </div>
              {[
                ["Email", report.parsedProfile.email],
                ["Telefone", report.parsedProfile.phone],
                ["Localidade", report.parsedProfile.location],
                ["Empresa atual", report.parsedProfile.currentCompany],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-300">
                    {value || "Nao detectado"}
                  </p>
                </div>
              ))}
              <div>
                <p className="text-xs text-slate-500">Headline</p>
                <p className="mt-1 text-sm font-medium leading-5 text-white">
                  {report.parsedProfile.headline || report.parsedProfile.professionalHeadline || "Nao detectado"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Resumo</p>
                <p className="mt-1 text-sm leading-5 text-slate-300">
                  {report.parsedProfile.summary || "Nao detectado"}
                </p>
              </div>
              {[
                ["Cargo atual", report.parsedProfile.currentRole ? [report.parsedProfile.currentRole] : []],
                ["Cargos anteriores", report.parsedProfile.previousRoles],
                ["Industrias", report.parsedProfile.industries],
                ["Ferramentas", report.parsedProfile.tools],
                ["Competencias tecnicas", report.parsedProfile.technicalSkills],
                ["Competencias de negocio", report.parsedProfile.businessSkills],
                ["Palavras-chave", report.parsedProfile.keywords],
                ["Sugestoes de alvo", report.parsedProfile.targetRoleSuggestions],
                ["Formacao", report.parsedProfile.education],
                ["Certificacoes", report.parsedProfile.certifications],
                ["Idiomas", report.parsedProfile.languages],
                ["Senioridade", [seniorityLabel(report.parsedProfile.seniorityLevel), report.parsedProfile.seniorityConfidence].filter(Boolean)],
              ].map(([label, values]) => (
                <div key={label as string}>
                  <p className="text-xs text-slate-500">{label as string}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-300">
                    {(values as string[]).length ? (values as string[]).join(", ") : "Nao detectado"}
                  </p>
                </div>
              ))}
              {report.parsedProfile.experience.length ? (
                <div>
                  <p className="text-xs text-slate-500">Experiencia</p>
                  <div className="mt-2 space-y-2">
                    {report.parsedProfile.experience.slice(0, 4).map((item) => (
                      <div
                        key={`${item.company}-${item.role}-${item.period}`}
                        className="rounded-md border border-white/10 bg-white/[0.035] p-3"
                      >
                        <p className="text-sm font-medium text-white">
                          {[item.role, item.company].filter(Boolean).join(" em ") || "Experiencia"}
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
          <Card className="border-white/10 bg-slate-900/82 shadow-panel backdrop-blur">
            <CardHeader className="p-5">
              <CardTitle className="text-xl">Snapshot de inteligencia da vaga</CardTitle>
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
                <CardTitle className="text-xl">Oportunidades mais bem ranqueadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5 pt-0">
                {report.rankedOpportunities.map((opportunity, index) => (
                  <div
                    key={opportunity.company}
                    className="rounded-lg border border-white/10 bg-slate-900/65 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/25"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">
                          {opportunity.company}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {opportunity.role} - {workModelLabel(opportunity.workModel)}
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
                      {opportunity.location} - {opportunity.estimatedSalary}
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
                        Melhor fit
                      </Badge>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.035] shadow-none">
              <CardHeader className="p-5">
                <CardTitle className="text-xl">Competencias-chave detectadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5 pt-0">
                {report.keySkills.map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-300">{skill.name}</span>
                      <span className="text-slate-500">{demandLabel(skill.demand)}</span>
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

          <Card className="border-white/10 bg-slate-900/82 shadow-none">
            <CardHeader className="p-5">
              <CardTitle className="text-xl">Gaps de carreira</CardTitle>
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
                      {severityLabel(gap.severity)}
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

