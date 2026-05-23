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
import { readStoredDemoReport } from "@/lib/job-radar-client";
import type { DemoReportRequest, JobRadarReport } from "@/lib/job-radar-types";

function downloadTextFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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
          <Badge variant="pulse">Career Intelligence Report</Badge>
          <h1 className="mt-7 text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Your job intelligence report is ready.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            A strategic view of your fit, strongest opportunities, missing proof points, and next application moves.
          </p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            size="lg"
            onClick={() =>
              downloadTextFile("ai-job-radar-optimized-resume.txt", report.optimizedResume)
            }
          >
            <Download />
            Download Resume
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => downloadTextFile("ai-job-radar-report.txt", reportText)}
          >
            <FileText />
            Download Report
          </Button>
        </div>
      </div>

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
                ["Role", report.request.targetRole],
                ["Location", report.request.location || "Any location"],
                ["Work model", report.request.workModel],
                ["Seniority", report.request.seniority],
                ["Industry", report.request.desiredIndustry || "Any industry"],
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
    </div>
  );
}
