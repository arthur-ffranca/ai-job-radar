import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { checkAnalysisAccess, registerAnalysisUsage } from "@/lib/billing";
import { generateReport } from "@/lib/report-generator";
import type { DemoReportRequest, ParsedProfile, Seniority, WorkModel } from "@/lib/job-radar-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

function parseJsonArray(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.map((item) => String(item).trim()).filter(Boolean)
      : [];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function parseProfile(value: FormDataEntryValue | null): ParsedProfile | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as ParsedProfile | null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeWorkModel(value: FormDataEntryValue | null): WorkModel {
  return value === "remote" || value === "hybrid" || value === "onsite" ? value : "any";
}

function normalizeSeniority(value: FormDataEntryValue | null): Seniority {
  return value === "Junior" || value === "Mid-level" || value === "Senior" || value === "Lead"
    ? value
    : "Any";
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const analysisId = getText(formData, "analysisId");
    const resumeName = getText(formData, "resumeName");
    const resumeText = getText(formData, "resumeText");
    const parsedProfile = parseProfile(formData.get("parsedProfile"));
    const targetRole = getText(formData, "targetRole");
    const targetRoles = parseJsonArray(formData.get("targetRoles"));
    const mustHaveKeywords = parseJsonArray(formData.get("mustHaveKeywords"));
    const avoidKeywords = parseJsonArray(formData.get("avoidKeywords"));
    const anonId = getText(formData, "anonId");
    const { userId } = await auth();

    if (!analysisId) {
      return jsonResponse({ error: "analysisId ausente." }, 400);
    }

    if (!parsedProfile || !resumeText) {
      return jsonResponse(
        {
          analysisId,
          error: "Nenhum CV processado foi recebido. Envie e processe o arquivo antes de gerar a analise.",
        },
        422
      );
    }

    if (!targetRole && !targetRoles.length) {
      return jsonResponse(
        {
          analysisId,
          error: "Escolha pelo menos um cargo-alvo antes de gerar a analise.",
        },
        422
      );
    }

    const access = await checkAnalysisAccess({
      userId: userId || null,
      anonId: anonId || null,
    });

    if (!access.allowed) {
      return jsonResponse(
        {
          analysisId,
          error: access.reason,
          access: {
            plan: "free",
            analysesUsed: access.analysesUsed,
            remaining: access.remaining,
            upgradeUrl: "/pricing",
          },
        },
        402
      );
    }

    const reportRequest: DemoReportRequest = {
      analysisId,
      resumeName: resumeName || "CV enviado",
      resumeText,
      parsedProfile,
      targetRole: targetRole || targetRoles[0],
      targetRoles: targetRoles.length ? targetRoles : [targetRole].filter(Boolean),
      jobDescription: getText(formData, "jobDescription"),
      location: getText(formData, "location"),
      workModel: normalizeWorkModel(formData.get("workModel")),
      seniority: normalizeSeniority(formData.get("seniority")),
      desiredIndustry: getText(formData, "desiredIndustry"),
      mustHaveKeywords,
      avoidKeywords,
    };

    const report = generateReport(reportRequest);

    if (access.plan === "free") {
      report.adaptedCvDraft = "";
      report.cvChanges = [];
      report.roleAnalyses = report.roleAnalyses.map((roleAnalysis) => ({
        ...roleAnalysis,
        adaptedCvDraft: "",
      }));
    }

    await registerAnalysisUsage({
      userId: userId || null,
      anonId: anonId || null,
    });

    return jsonResponse({
      ...report,
      id: analysisId,
      analysisId,
      plan: access.plan,
    });
  } catch (error) {
    console.error("[AI Job Radar] /api/analyze failed", error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Erro inesperado ao gerar a analise.",
      },
      500
    );
  }
}
