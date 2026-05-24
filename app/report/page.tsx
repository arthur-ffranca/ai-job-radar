import { AppNav } from "@/components/app-nav";
import { PageBackground } from "@/components/page-background";
import { ReportView } from "@/components/report/report-view";
import type { DemoReportRequest, Seniority, WorkModel } from "@/lib/job-radar-types";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSeniority(value: string | undefined): Seniority {
  if (value === "Junior" || value === "Mid-level" || value === "Senior" || value === "Lead") {
    return value;
  }

  return "Any";
}

function normalizeWorkModel(value: string | undefined): WorkModel {
  if (value === "remote" || value === "hybrid" || value === "onsite") {
    return value;
  }

  return "any";
}

function splitKeywords(value: string | undefined): string[] {
  return (value || "")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export default async function ReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialRequest: DemoReportRequest = {
    resumeName: "Nenhum CV enviado",
    targetRole: firstParam(params.targetRole) || "Selected Role",
    location: firstParam(params.location) || "",
    workModel: normalizeWorkModel(firstParam(params.workModel)),
    seniority: normalizeSeniority(firstParam(params.seniority)),
    desiredIndustry: firstParam(params.desiredIndustry) || "",
    mustHaveKeywords: splitKeywords(firstParam(params.mustHaveKeywords)),
    avoidKeywords: splitKeywords(firstParam(params.avoidKeywords)),
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <PageBackground />
      <AppNav />
      <section className="relative px-5 pb-20 pt-28 sm:px-6 lg:px-8">
        <ReportView initialRequest={initialRequest} />
      </section>
    </main>
  );
}
