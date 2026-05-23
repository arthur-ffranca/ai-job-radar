"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CircleSlash,
  FileText,
  Loader2,
  MapPin,
  Sparkles,
  Upload,
  UserRound,
} from "lucide-react";

import { AnalysisLoadingOverlay } from "@/components/demo/analysis-loading-overlay";
import { useAuthPrompt } from "@/components/auth/auth-prompt-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateDemoReport } from "@/lib/job-radar-client";
import type { ParsedProfile, Seniority, WorkModel } from "@/lib/job-radar-types";
import { ParseResumeDebugError, parseResumeFile } from "@/lib/resume-parser-client";
import { cn } from "@/lib/utils";

const seniorityOptions: Seniority[] = ["Any", "Junior", "Mid-level", "Senior", "Lead"];
const workModelOptions: { label: string; value: WorkModel }[] = [
  { label: "Any", value: "any" },
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Onsite", value: "onsite" },
];

function parseKeywords(value: string) {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

type UploadFormData = {
  cvFile: File | null;
  cvFileName: string;
  rawCvText: string;
  uploadStatus: "idle" | "parsing" | "success" | "error";
  uploadMessage: string;
  parserDebug: unknown;
  targetRole: string;
  targetRoles: string[];
  location: string;
  workModel: WorkModel;
  seniority: Seniority;
  desiredIndustry: string;
  mustHaveKeywords: string;
  avoidKeywords: string;
  parsedProfile: ParsedProfile | null;
};

const initialFormData: UploadFormData = {
  cvFile: null,
  cvFileName: "",
  rawCvText: "",
  uploadStatus: "idle",
  uploadMessage: "",
  parserDebug: null,
  targetRole: "",
  targetRoles: [],
  location: "",
  workModel: "any",
  seniority: "Any",
  desiredIndustry: "",
  mustHaveKeywords: "",
  avoidKeywords: "",
  parsedProfile: null,
};

function normalizeSeniority(value: string | null): Seniority {
  if (value === "Junior" || value === "Mid-level" || value === "Senior" || value === "Lead") {
    return value;
  }

  return "Any";
}

function normalizeWorkModel(value: string | null): WorkModel {
  if (value === "remote" || value === "hybrid" || value === "onsite") {
    return value;
  }

  return "any";
}

export function DemoForm() {
  const router = useRouter();
  const { isAuthLoaded, requireAuth } = useAuthPrompt();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<UploadFormData>(initialFormData);
  const [isParsing, setIsParsing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const resumeName = params.get("resume");

      if (!params.toString()) {
        return;
      }

      setFormData((prev) => ({
        ...prev,
        targetRole: prev.targetRole || params.get("targetRole") || "",
        targetRoles: prev.targetRoles.length
          ? prev.targetRoles
          : parseKeywords(params.get("targetRole") || "").slice(0, 3),
        location: prev.location || params.get("location") || "",
        workModel: prev.workModel !== "any" ? prev.workModel : normalizeWorkModel(params.get("workModel")),
        seniority: prev.seniority !== "Any" ? prev.seniority : normalizeSeniority(params.get("seniority")),
        desiredIndustry: prev.desiredIndustry || params.get("desiredIndustry") || "",
        mustHaveKeywords: prev.mustHaveKeywords || params.get("mustHaveKeywords") || "",
        avoidKeywords: prev.avoidKeywords || params.get("avoidKeywords") || "",
        uploadStatus: resumeName ? "error" : prev.uploadStatus,
        uploadMessage: resumeName
          ? `The previous file "${resumeName}" cannot be restored from the URL. Select the CV again to parse it.`
          : prev.uploadMessage,
      }));

      window.history.replaceState(null, "", "/demo");
    }, 0);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!isAuthLoaded) {
      setFormData((prev) => ({
        ...prev,
        uploadStatus: "idle",
        uploadMessage: "Checking your account session. Try again in a moment.",
      }));
      return;
    }

    if (!requireAuth()) {
      return;
    }

    if (isLoading || isParsing) {
      return;
    }

    if (!formData.parsedProfile) {
      setFormData((prev) => ({
        ...prev,
        uploadStatus: "error",
        uploadMessage: formData.cvFile
          ? "CV parsing has not completed. Wait for the parser result before generating the report."
          : "Upload and parse a CV before generating the report.",
      }));
      return;
    }

    const selectedTargetRoles = Array.from(
      new Set([...(formData.targetRoles || []), formData.targetRole].map((role) => role.trim()).filter(Boolean))
    ).slice(0, 3);

    if (!selectedTargetRoles.length) {
      setFormData((prev) => ({
        ...prev,
        uploadStatus: "error",
        uploadMessage: "Choose at least one target role before generating the report.",
      }));
      return;
    }

    setIsLoading(true);

    const payload = {
      resumeName: formData.cvFileName || "No CV uploaded",
      resumeText: formData.rawCvText,
      parsedProfile: formData.parsedProfile,
      targetRole: selectedTargetRoles[0],
      targetRoles: selectedTargetRoles,
      location: formData.location.trim(),
      workModel: formData.workModel,
      seniority: formData.seniority,
      desiredIndustry: formData.desiredIndustry.trim(),
      mustHaveKeywords: parseKeywords(formData.mustHaveKeywords),
      avoidKeywords: parseKeywords(formData.avoidKeywords),
    };

    console.log("[AI Job Radar] submit payload", payload);

    await generateDemoReport({
      ...payload,
    });

    router.push("/report");
  }, [formData, isAuthLoaded, isLoading, isParsing, requireAuth, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleGenerate();
  }

  function updateFormField<K extends keyof UploadFormData>(
    field: K,
    value: UploadFormData[K]
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function addTargetRole() {
    const role = formData.targetRole.trim();

    if (!role) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      targetRole: "",
      targetRoles: Array.from(new Set([...prev.targetRoles, role])).slice(0, 3),
    }));
  }

  function removeTargetRole(role: string) {
    setFormData((prev) => ({
      ...prev,
      targetRoles: prev.targetRoles.filter((item) => item !== role),
    }));
  }

  async function handleFileChange(file: File | undefined) {
    console.log("[AI Job Radar] selected file", file);

    if (!file) {
      setFormData((prev) => ({
        ...prev,
        uploadStatus: "error",
        uploadMessage: "Select a CV file before parsing.",
      }));
      return;
    }

    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setFormData((prev) => ({
        ...prev,
        cvFile: null,
        cvFileName: "",
        rawCvText: "",
        parsedProfile: null,
        parserDebug: null,
        uploadStatus: "error",
        uploadMessage: "Only PDF and DOCX files are supported.",
      }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      cvFile: file,
      cvFileName: file.name,
      rawCvText: "",
      parserDebug: null,
      uploadStatus: "parsing",
      uploadMessage: "Parsing CV...",
    }));

    setIsParsing(true);
    console.log("[AI Job Radar] parsing started", file.name);

    try {
      const { response, parsedProfile } = await parseResumeFile(file);

      console.log("[AI Job Radar] parsing completed", parsedProfile);

      setFormData((prev) => {
        console.log("[AI Job Radar] form state before merge", prev);

        const next: UploadFormData = {
          ...prev,
          cvFile: file,
          cvFileName: file.name,
          rawCvText: response.raw_text,
          uploadStatus: "success",
          uploadMessage: "CV parsed successfully",
          parsedProfile,
          parserDebug: response,
          targetRole:
            prev.targetRole || (prev.targetRoles.length ? "" : parsedProfile.currentRole || parsedProfile.currentOrPreviousRoles[0] || ""),
          location: prev.location,
          seniority:
            prev.seniority !== "Any"
              ? prev.seniority
              : parsedProfile.seniorityLevel || "Any",
          desiredIndustry:
            prev.desiredIndustry || parsedProfile.industries[0] || "",
        };

        console.log("[AI Job Radar] form state after merge", next);
        return next;
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error parsing CV.";
      const parserDebug = error instanceof ParseResumeDebugError ? error.debugResult : null;
      console.log("[AI Job Radar] parsing failed", {
        message,
        parserDebug,
        error,
      });
      setFormData((prev) => ({
        ...prev,
        cvFile: file,
        cvFileName: file.name,
        rawCvText:
          parserDebug &&
          typeof parserDebug === "object" &&
          "raw_text" in parserDebug &&
          typeof parserDebug.raw_text === "string"
            ? parserDebug.raw_text
            : "",
        parsedProfile: null,
        parserDebug,
        uploadStatus: "error",
        uploadMessage: message,
      }));
    } finally {
      setIsParsing(false);
    }
  }

  function handleRemoveFile() {
    console.log("[AI Job Radar] file removed");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setFormData((prev) => ({
      ...prev,
      cvFile: null,
      cvFileName: "",
      rawCvText: "",
      uploadStatus: "idle",
      uploadMessage: "",
      parsedProfile: null,
      parserDebug: null,
    }));
  }

  const rawTextLength =
    formData.parserDebug &&
    typeof formData.parserDebug === "object" &&
    "raw_text_length" in formData.parserDebug &&
    typeof formData.parserDebug.raw_text_length === "number"
      ? formData.parserDebug.raw_text_length
      : formData.rawCvText.length;
  const debugEnvelope =
    formData.parserDebug &&
    typeof formData.parserDebug === "object" &&
    "debug" in formData.parserDebug &&
    formData.parserDebug.debug &&
    typeof formData.parserDebug.debug === "object"
      ? formData.parserDebug.debug
      : null;
  const llmParsingFailed =
    debugEnvelope &&
    "parser_error" in debugEnvelope &&
    typeof debugEnvelope.parser_error === "string" &&
    debugEnvelope.parser_error.length > 0;
  const profileIncomplete =
    formData.uploadStatus === "success" &&
    formData.parsedProfile &&
    !formData.parsedProfile.name &&
    !formData.parsedProfile.skills.length &&
    !formData.parsedProfile.education.length &&
    !formData.parsedProfile.languages.length;

  return (
    <motion.div
      initial={{ opacity: 0.96, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]"
    >
      <Card className="border-white/10 bg-slate-950/82 shadow-panel backdrop-blur">
        <CardHeader className="p-6 sm:p-8">
          <div className="mb-5 flex size-11 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
            <Sparkles className="size-5" />
          </div>
          <CardTitle className="text-3xl leading-tight text-white">
            Generate an AI Job Report
          </CardTitle>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            Upload a resume, choose your target, and preview how AI Job Radar turns job search noise into a focused strategy.
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
          <form noValidate onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                <Upload className="size-4 text-emerald-200" />
                Resume upload
              </span>
              <input
                ref={fileInputRef}
                name="resume"
                type="file"
                accept=".pdf,.docx"
                disabled={isLoading || isParsing}
                onChange={(event) => void handleFileChange(event.currentTarget.files?.[0])}
                className="block w-full cursor-pointer rounded-lg border border-dashed border-white/15 bg-slate-950/55 p-4 text-sm text-slate-400 file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-950 hover:border-sky-300/25 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-slate-500">
                PDF or DOCX only. Files are sent as multipart/form-data to the resume parser.
              </p>
              {formData.cvFileName ? (
                <div className="mt-3 flex flex-col gap-2 rounded-md border border-white/10 bg-white/[0.035] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {formData.cvFileName}
                    </p>
                    {formData.uploadMessage ? (
                      <p
                        className={cn(
                          "mt-1 text-xs",
                          formData.uploadStatus === "error"
                            ? "text-red-300"
                            : "text-emerald-200/80"
                        )}
                      >
                        {formData.uploadMessage}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isLoading || isParsing}
                    onClick={handleRemoveFile}
                  >
                    Remove file
                  </Button>
                </div>
              ) : formData.uploadMessage ? (
                <p
                  className={cn(
                    "mt-2 text-xs",
                    formData.uploadStatus === "error"
                      ? "text-red-300"
                      : "text-emerald-200/80"
                  )}
                >
                  {formData.uploadMessage}
                </p>
              ) : null}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <BriefcaseBusiness className="size-4 text-sky-200" />
                  Target roles
                </span>
                <Input
                  name="targetRole"
                  disabled={isLoading}
                  value={formData.targetRole}
                  placeholder="Type a role, then add it. Up to 3 roles."
                  onChange={(event) =>
                    updateFormField("targetRole", event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTargetRole();
                    }
                  }}
                  className="h-11 border-white/10 bg-slate-950/55"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.targetRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => removeTargetRole(role)}
                      className="rounded-md border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-xs font-medium text-sky-100 transition hover:border-sky-200/40"
                    >
                      {role} x
                    </button>
                  ))}
                  {formData.targetRoles.length < 3 ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isLoading || !formData.targetRole.trim()}
                      onClick={addTargetRole}
                    >
                      Add role
                    </Button>
                  ) : null}
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  AI Job Radar will compare each target role and generate a separate resume review and download for each one.
                </p>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <MapPin className="size-4 text-sky-200" />
                  Location
                </span>
                <Input
                  name="location"
                  disabled={isLoading}
                  value={formData.location}
                  placeholder="e.g. São Paulo, London, Remote"
                  onChange={(event) =>
                    updateFormField("location", event.target.value)
                  }
                  className="h-11 border-white/10 bg-slate-950/55"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <UserRound className="size-4 text-emerald-200" />
                  Seniority
                </span>
                <select
                  name="seniority"
                  disabled={isLoading}
                  value={formData.seniority}
                  onChange={(event) =>
                    updateFormField("seniority", event.target.value as Seniority)
                  }
                  className="h-11 w-full rounded-md border border-white/10 bg-slate-950/55 px-3 text-sm text-white outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {seniorityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <MapPin className="size-4 text-emerald-200" />
                  Work model
                </span>
                <select
                  name="workModel"
                  disabled={isLoading}
                  value={formData.workModel}
                  onChange={(event) =>
                    updateFormField("workModel", event.target.value as WorkModel)
                  }
                  className="h-11 w-full rounded-md border border-white/10 bg-slate-950/55 px-3 text-sm text-white outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {workModelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                <Building2 className="size-4 text-sky-200" />
                Desired industry
              </span>
              <Input
                name="desiredIndustry"
                disabled={isLoading}
                value={formData.desiredIndustry}
                placeholder="e.g. SaaS, Healthcare, Retail, Finance"
                onChange={(event) =>
                  updateFormField("desiredIndustry", event.target.value)
                }
                className="h-11 border-white/10 bg-slate-950/55"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <Sparkles className="size-4 text-emerald-200" />
                  Must-have keywords
                </span>
                <Input
                  name="mustHaveKeywords"
                  disabled={isLoading}
                  value={formData.mustHaveKeywords}
                  placeholder="CRM, hiring, forecasting"
                  onChange={(event) =>
                    updateFormField("mustHaveKeywords", event.target.value)
                  }
                  className="h-11 border-white/10 bg-slate-950/55"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <CircleSlash className="size-4 text-sky-200" />
                  Avoid keywords
                </span>
                <Input
                  name="avoidKeywords"
                  disabled={isLoading}
                  value={formData.avoidKeywords}
                  placeholder="internship, commission-only"
                  onChange={(event) =>
                    updateFormField("avoidKeywords", event.target.value)
                  }
                  className="h-11 border-white/10 bg-slate-950/55"
                />
              </label>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading || isParsing}
              className="h-12 w-full"
            >
              {isParsing ? (
                <>
                  <Loader2 className="animate-spin" />
                  Parsing CV
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Generating AI Job Report
                </>
              ) : (
                <>
                  Generate AI Job Report
                  <ArrowRight />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="min-h-[88px] rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
              {isParsing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : formData.uploadStatus === "success" ? (
                <Sparkles className="size-4" />
              ) : (
                <FileText className="size-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {isParsing
                  ? "Reading resume"
                  : formData.uploadStatus === "success"
                    ? "Resume parsed"
                    : "Resume parser ready"}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-400">
                {formData.uploadMessage ||
                  "Upload a PDF or DOCX to extract profile signals before generating the report."}
              </p>
            </div>
          </div>
        </div>

        {(formData.parserDebug || formData.uploadStatus === "error" || profileIncomplete || llmParsingFailed) ? (
        <Card className="border-sky-300/20 bg-sky-300/10 shadow-none">
          <CardHeader className="p-5">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-sky-100" />
              <CardTitle className="text-xl">Parser debug output</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0">
            {formData.uploadStatus === "error" ? (
              <div className="rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100">
                {rawTextLength === 0
                  ? "No text extracted"
                  : formData.uploadMessage || "LLM parsing failed"}
              </div>
            ) : null}
            {profileIncomplete ? (
              <div className="rounded-md border border-amber-300/20 bg-amber-400/10 p-3 text-sm text-amber-100">
                Profile extraction incomplete
              </div>
            ) : null}
            {llmParsingFailed ? (
              <div className="rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100">
                LLM parsing failed: {String(debugEnvelope?.parser_error)}
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["raw_text_length", String(rawTextLength)],
                ["detected name", formData.parsedProfile?.name || "Not detected"],
                ["detected skills", formData.parsedProfile?.skills.join(", ") || "Not detected"],
                ["detected education", formData.parsedProfile?.education.join(", ") || "Not detected"],
                ["detected languages", formData.parsedProfile?.languages.join(", ") || "Not detected"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md border border-white/10 bg-slate-950/55 p-3"
                >
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 break-words text-sm leading-5 text-slate-200">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-2 text-xs text-slate-500">parsedProfile JSON</p>
              <pre className="max-h-72 overflow-auto rounded-md border border-white/10 bg-black/40 p-3 text-xs leading-5 text-slate-300">
                {JSON.stringify(formData.parsedProfile, null, 2)}
              </pre>
            </div>
            <div>
              <p className="mb-2 text-xs text-slate-500">API response debug JSON</p>
              <pre className="max-h-72 overflow-auto rounded-md border border-white/10 bg-black/40 p-3 text-xs leading-5 text-slate-300">
                {JSON.stringify(formData.parserDebug, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
        ) : null}

        {formData.parsedProfile ? (
        <Card className="border-emerald-300/20 bg-emerald-300/10 shadow-none">
          <CardHeader className="p-5">
            <div className="flex items-center gap-3">
              <UserRound className="size-5 text-emerald-100" />
              <CardTitle className="text-xl">Extracted CV profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 pt-0 sm:grid-cols-2">
            {[
              ["Name", formData.parsedProfile.name],
              ["Headline", formData.parsedProfile.headline],
              ["Current role", formData.parsedProfile.currentRole],
              ["Current company", formData.parsedProfile.currentCompany],
              ["Email", formData.parsedProfile.email],
              ["Phone", formData.parsedProfile.phone],
              ["Location", formData.parsedProfile.location],
              [
                "Seniority",
                [formData.parsedProfile.seniorityLevel, formData.parsedProfile.seniorityConfidence]
                  .filter(Boolean)
                  .join(" - "),
              ],
              ["Tools", formData.parsedProfile.tools.join(", ")],
              ["Technical skills", formData.parsedProfile.technicalSkills.join(", ")],
              ["Business skills", formData.parsedProfile.businessSkills.join(", ")],
              ["Languages", formData.parsedProfile.languages.join(", ")],
              ["Education", formData.parsedProfile.education.join(", ")],
              ["Certifications", formData.parsedProfile.certifications.join(", ")],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-md border border-white/10 bg-slate-950/55 p-3"
              >
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-sm leading-5 text-slate-200">
                  {value || "Not detected"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        ) : null}

        {[
          ["Resume parsing", "Extracts experience, tools, achievements, and seniority signals."],
          ["Market scan", "Compares the profile against ranked roles and skill demand."],
          ["Report generation", "Returns match score, gaps, opportunities, and optimized assets."],
        ].map(([title, copy], index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0.95, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className={cn(
              "rounded-lg border border-white/10 bg-white/[0.035] p-5 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/25",
              index === 1 && "border-emerald-300/20 bg-emerald-300/10"
            )}
          >
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="font-medium text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {isLoading ? <AnalysisLoadingOverlay /> : null}
    </motion.div>
  );
}
