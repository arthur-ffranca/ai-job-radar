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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { analyzeDemoReport, clearStoredDemoReport } from "@/lib/job-radar-client";
import type { ParsedProfile, Seniority, WorkModel } from "@/lib/job-radar-types";
import { getOrCreateAnonId } from "@/lib/client-id";
import { ParseResumeDebugError, parseResumeFile } from "@/lib/resume-parser-client";
import { trackEvent } from "@/lib/telemetry";
import { cn } from "@/lib/utils";

const seniorityOptions: Seniority[] = ["Any", "Junior", "Mid-level", "Senior", "Lead"];
const seniorityLabels: Record<Seniority, string> = {
  Any: "Qualquer",
  Junior: "Junior",
  "Mid-level": "Pleno",
  Senior: "Senior",
  Lead: "Lideranca",
};
const workModelOptions: { label: string; value: WorkModel }[] = [
  { label: "Qualquer", value: "any" },
  { label: "Remoto", value: "remote" },
  { label: "Hibrido", value: "hybrid" },
  { label: "Presencial", value: "onsite" },
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
  jobDescription: string;
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
  jobDescription: "",
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

function sanitizeFlowMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("verificando sua sessao") || normalized.includes("verificando sua sessão")) {
    return "O leitor de CV esta inicializando. Tente novamente em alguns segundos.";
  }

  return message;
}

export function DemoForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeAnalysisIdRef = useRef<string | null>(null);
  const activeParseIdRef = useRef<string | null>(null);
  const [formData, setFormData] = useState<UploadFormData>(initialFormData);
  const [isParsing, setIsParsing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    trackEvent("demo_opened");
  }, []);

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
        jobDescription: prev.jobDescription || params.get("jobDescription") || "",
        location: prev.location || params.get("location") || "",
        workModel: prev.workModel !== "any" ? prev.workModel : normalizeWorkModel(params.get("workModel")),
        seniority: prev.seniority !== "Any" ? prev.seniority : normalizeSeniority(params.get("seniority")),
        desiredIndustry: prev.desiredIndustry || params.get("desiredIndustry") || "",
        mustHaveKeywords: prev.mustHaveKeywords || params.get("mustHaveKeywords") || "",
        avoidKeywords: prev.avoidKeywords || params.get("avoidKeywords") || "",
        uploadStatus: resumeName ? "error" : prev.uploadStatus,
        uploadMessage: resumeName
          ? `O arquivo anterior "${resumeName}" nao pode ser restaurado pela URL. Selecione o CV novamente para leitura.`
          : prev.uploadMessage,
      }));

      window.history.replaceState(null, "", "/demo");
    }, 0);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (isLoading || isParsing) {
      return;
    }

    if (!formData.parsedProfile) {
      setFormData((prev) => ({
        ...prev,
        uploadStatus: "error",
        uploadMessage: formData.cvFile
          ? "A leitura do CV ainda nao terminou. Aguarde o leitor antes de gerar o relatorio."
          : "Envie e processe um CV antes de gerar o relatorio.",
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
        uploadMessage: "Escolha pelo menos um cargo-alvo antes de gerar o relatorio.",
      }));
      return;
    }

    const analysisId = crypto.randomUUID();
    activeAnalysisIdRef.current = analysisId;
    clearStoredDemoReport();
    setIsLoading(true);
    trackEvent("analysis_started", {
      analysisId,
      targetRole: selectedTargetRoles[0],
      targetRolesCount: selectedTargetRoles.length,
      location: formData.location.trim() || "not_provided",
      workModel: formData.workModel,
      seniority: formData.seniority,
      hasJobDescription: Boolean(formData.jobDescription.trim()),
      hasCvFile: Boolean(formData.cvFileName),
    });

    const payload = {
      analysisId,
      anonId: getOrCreateAnonId(),
      resumeName: formData.cvFileName || "Nenhum CV enviado",
      resumeText: formData.rawCvText,
      parsedProfile: formData.parsedProfile,
      cvFile: formData.cvFile,
      targetRole: selectedTargetRoles[0],
      targetRoles: selectedTargetRoles,
      jobDescription: formData.jobDescription.trim(),
      location: formData.location.trim(),
      workModel: formData.workModel,
      seniority: formData.seniority,
      desiredIndustry: formData.desiredIndustry.trim(),
      mustHaveKeywords: parseKeywords(formData.mustHaveKeywords),
      avoidKeywords: parseKeywords(formData.avoidKeywords),
    };

    console.log("[AI Job Radar] submit payload", payload);

    try {
      const report = await analyzeDemoReport(payload, analysisId);

      if (activeAnalysisIdRef.current !== analysisId || report.analysisId !== analysisId) {
        console.warn("[AI Job Radar] stale analysis ignored", {
          activeAnalysisId: activeAnalysisIdRef.current,
          returnedAnalysisId: report.analysisId,
        });
        trackEvent("analysis_ignored_stale", {
          analysisId,
          returnedAnalysisId: report.analysisId,
        });
        return;
      }

      trackEvent("analysis_success", {
        analysisId,
        targetRole: report.request.targetRole,
        matchScore: report.matchScore,
      });
      router.push(`/report?analysisId=${encodeURIComponent(analysisId)}`);
    } catch (error) {
      const message = sanitizeFlowMessage(
        error instanceof Error ? error.message : "Erro ao gerar a analise."
      );
      trackEvent("analysis_failed", {
        analysisId,
        message,
      });
      setFormData((prev) => ({
        ...prev,
        uploadStatus: "error",
        uploadMessage: message,
      }));
    } finally {
      if (activeAnalysisIdRef.current === analysisId) {
        setIsLoading(false);
      }
    }
  }, [formData, isLoading, isParsing, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleGenerate();
  }

  function updateFormField<K extends keyof UploadFormData>(
    field: K,
    value: UploadFormData[K]
  ) {
    if (
      field === "targetRole" ||
      field === "targetRoles" ||
      field === "jobDescription" ||
      field === "location" ||
      field === "workModel" ||
      field === "seniority" ||
      field === "desiredIndustry" ||
      field === "mustHaveKeywords" ||
      field === "avoidKeywords"
    ) {
      activeAnalysisIdRef.current = null;
      clearStoredDemoReport();
      setIsLoading(false);
    }

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
    activeAnalysisIdRef.current = null;
    activeParseIdRef.current = null;
    clearStoredDemoReport();
    setIsLoading(false);

    if (!file) {
      trackEvent("cv_upload_missing_file");
      setFormData((prev) => ({
        ...prev,
        uploadStatus: "error",
        uploadMessage: "Selecione um arquivo de CV antes da leitura.",
      }));
      return;
    }

    if (!/\.(pdf|docx)$/i.test(file.name)) {
      trackEvent("cv_upload_invalid_type", { fileName: file.name });
      activeParseIdRef.current = null;
      setFormData((prev) => ({
        ...prev,
        cvFile: null,
        cvFileName: "",
        rawCvText: "",
        parsedProfile: null,
        parserDebug: null,
        uploadStatus: "error",
        uploadMessage: "Apenas arquivos PDF e DOCX sao suportados.",
      }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const parseId = crypto.randomUUID();
    activeParseIdRef.current = parseId;
    trackEvent("cv_upload_started", {
      parseId,
      fileName: file.name,
      fileSize: file.size,
    });

    setFormData((prev) => ({
      ...prev,
      cvFile: file,
      cvFileName: file.name,
      rawCvText: "",
      parserDebug: null,
      uploadStatus: "parsing",
      uploadMessage: "Lendo CV...",
    }));

    setIsParsing(true);
    console.log("[AI Job Radar] parsing started", file.name);

    try {
      const { response, parsedProfile } = await parseResumeFile(file);

      console.log("[AI Job Radar] parsing completed", parsedProfile);

      if (activeParseIdRef.current !== parseId) {
        console.warn("[AI Job Radar] stale CV parsing ignored", {
          activeParseId: activeParseIdRef.current,
          completedParseId: parseId,
        });
        trackEvent("cv_upload_stale_parse_ignored", { parseId });
        return;
      }

      setFormData((prev) => {
        console.log("[AI Job Radar] form state before merge", prev);

        const next: UploadFormData = {
          ...prev,
          cvFile: file,
          cvFileName: file.name,
          rawCvText: response.raw_text,
          uploadStatus: "success",
          uploadMessage: "CV lido com sucesso",
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
      trackEvent("cv_upload_success", {
        parseId,
        fileName: file.name,
        rawTextLength: response.raw_text.length,
      });
    } catch (error) {
      const message = sanitizeFlowMessage(
        error instanceof Error ? error.message : "Erro ao ler o CV."
      );
      const parserDebug = error instanceof ParseResumeDebugError ? error.debugResult : null;
      console.log("[AI Job Radar] parsing failed", {
        message,
        parserDebug,
        error,
      });
      if (activeParseIdRef.current !== parseId) {
        return;
      }
      trackEvent("cv_upload_failed", {
        parseId,
        fileName: file.name,
        message,
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
      if (activeParseIdRef.current === parseId) {
        setIsParsing(false);
      }
    }
  }

  function handleRemoveFile() {
    console.log("[AI Job Radar] file removed");
    trackEvent("cv_file_removed", { fileName: formData.cvFileName || "" });
    activeAnalysisIdRef.current = null;
    activeParseIdRef.current = null;
    clearStoredDemoReport();
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
      <Card className="border-white/10 bg-slate-900/82 shadow-panel backdrop-blur">
        <CardHeader className="p-6 sm:p-8">
          <div className="mb-5 flex size-11 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
            <Sparkles className="size-5" />
          </div>
          <CardTitle className="text-3xl leading-tight text-white">
            Gerar relatorio de inteligencia
          </CardTitle>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            Envie seu CV, escolha seus cargos-alvo e veja como o AI Job Radar transforma vagas soltas em uma estrategia clara.
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
          <form noValidate onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                <Upload className="size-4 text-emerald-200" />
                Envio do CV
              </span>
              <input
                ref={fileInputRef}
                name="resume"
                type="file"
                accept=".pdf,.docx"
                disabled={isLoading || isParsing}
                onChange={(event) => void handleFileChange(event.currentTarget.files?.[0])}
                className="block w-full cursor-pointer rounded-lg border border-dashed border-white/15 bg-slate-900/65 p-4 text-sm text-slate-400 file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-950 hover:border-sky-300/25 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-slate-500">
                Apenas PDF ou DOCX. O arquivo e enviado como multipart/form-data para o leitor de curriculos.
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
                    Remover arquivo
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
                  Cargos-alvo
                </span>
                <Input
                  name="targetRole"
                  disabled={isLoading}
                  value={formData.targetRole}
                  placeholder="Digite um cargo e adicione. Ate 3 cargos."
                  onChange={(event) =>
                    updateFormField("targetRole", event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTargetRole();
                    }
                  }}
                  className="h-11 border-white/10 bg-slate-900/65"
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
                      Adicionar cargo
                    </Button>
                  ) : null}
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  O AI Job Radar compara cada cargo e gera uma revisao de CV separada para download.
                </p>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <MapPin className="size-4 text-sky-200" />
                  Localidade
                </span>
                <Input
                  name="location"
                  disabled={isLoading}
                  value={formData.location}
                  placeholder="Ex.: Sao Paulo, remoto, Rio de Janeiro"
                  onChange={(event) =>
                    updateFormField("location", event.target.value)
                  }
                  className="h-11 border-white/10 bg-slate-900/65"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <UserRound className="size-4 text-emerald-200" />
                  Senioridade
                </span>
                <select
                  name="seniority"
                  disabled={isLoading}
                  value={formData.seniority}
                  onChange={(event) =>
                    updateFormField("seniority", event.target.value as Seniority)
                  }
                  className="h-11 w-full rounded-md border border-white/10 bg-slate-900/65 px-3 text-sm text-white outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {seniorityOptions.map((option) => (
                    <option key={option} value={option}>
                      {seniorityLabels[option]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <MapPin className="size-4 text-emerald-200" />
                  Modelo de trabalho
                </span>
                <select
                  name="workModel"
                  disabled={isLoading}
                  value={formData.workModel}
                  onChange={(event) =>
                    updateFormField("workModel", event.target.value as WorkModel)
                  }
                  className="h-11 w-full rounded-md border border-white/10 bg-slate-900/65 px-3 text-sm text-white outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
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
                Industria desejada
              </span>
              <Input
                name="desiredIndustry"
                disabled={isLoading}
                value={formData.desiredIndustry}
                placeholder="Ex.: SaaS, Saude, Varejo, Financeiro"
                onChange={(event) =>
                  updateFormField("desiredIndustry", event.target.value)
                }
                className="h-11 border-white/10 bg-slate-900/65"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                <FileText className="size-4 text-emerald-200" />
                Cole uma vaga especifica
              </span>
              <textarea
                name="jobDescription"
                disabled={isLoading}
                value={formData.jobDescription}
                placeholder="Cole a descricao da vaga aqui. O AI Job Radar extrai requisitos especificos e usa isso para gerar score, gaps e sugestoes de reescrita mais precisas."
                onChange={(event) =>
                  updateFormField("jobDescription", event.target.value)
                }
                className="min-h-32 w-full resize-y rounded-md border border-white/10 bg-slate-900/65 px-3 py-3 text-sm leading-6 text-white outline-none ring-offset-background transition placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Opcional, mas recomendado. Quando voce cola uma vaga, o relatorio fica especifico para aquela oportunidade em vez de usar apenas sinais gerais de mercado.
              </p>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <Sparkles className="size-4 text-emerald-200" />
                  Palavras obrigatorias
                </span>
                <Input
                  name="mustHaveKeywords"
                  disabled={isLoading}
                  value={formData.mustHaveKeywords}
                  placeholder="CRM, recrutamento, forecasting"
                  onChange={(event) =>
                    updateFormField("mustHaveKeywords", event.target.value)
                  }
                  className="h-11 border-white/10 bg-slate-900/65"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                  <CircleSlash className="size-4 text-sky-200" />
                  Palavras a evitar
                </span>
                <Input
                  name="avoidKeywords"
                  disabled={isLoading}
                  value={formData.avoidKeywords}
                  placeholder="estagio, comissao, PJ"
                  onChange={(event) =>
                    updateFormField("avoidKeywords", event.target.value)
                  }
                  className="h-11 border-white/10 bg-slate-900/65"
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
                  Lendo CV
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Gerando relatorio
                </>
              ) : (
                <>
                  Gerar relatorio
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
                  ? "Lendo curriculo"
                  : formData.uploadStatus === "success"
                    ? "Curriculo lido"
                    : "Leitor pronto"}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-400">
                {formData.uploadMessage ||
                  "Envie um PDF ou DOCX para extrair sinais do perfil antes de gerar o relatorio."}
              </p>
            </div>
          </div>
        </div>

        {(formData.parserDebug || formData.uploadStatus === "error" || profileIncomplete || llmParsingFailed) ? (
        <Card className="border-sky-300/20 bg-sky-300/10 shadow-none">
          <CardHeader className="p-5">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-sky-100" />
              <CardTitle className="text-xl">Saida de debug do leitor</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0">
            {formData.uploadStatus === "error" ? (
              <div className="rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100">
                {rawTextLength === 0
                  ? "Nenhum texto extraido"
                  : formData.uploadMessage || "Falha na leitura por IA"}
              </div>
            ) : null}
            {profileIncomplete ? (
              <div className="rounded-md border border-amber-300/20 bg-amber-400/10 p-3 text-sm text-amber-100">
                Extracao do perfil incompleta
              </div>
            ) : null}
            {llmParsingFailed ? (
              <div className="rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100">
                Falha na leitura por IA: {String(debugEnvelope?.parser_error)}
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["tamanho do texto extraido", String(rawTextLength)],
                ["nome detectado", formData.parsedProfile?.name || "Nao detectado"],
                ["competencias detectadas", formData.parsedProfile?.skills.join(", ") || "Nao detectado"],
                ["formacao detectada", formData.parsedProfile?.education.join(", ") || "Nao detectado"],
                ["idiomas detectados", formData.parsedProfile?.languages.join(", ") || "Nao detectado"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md border border-white/10 bg-slate-900/65 p-3"
                >
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 break-words text-sm leading-5 text-slate-200">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-2 text-xs text-slate-500">JSON do perfil extraido</p>
              <pre className="max-h-72 overflow-auto rounded-md border border-white/10 bg-slate-950/70 p-3 text-xs leading-5 text-slate-300">
                {JSON.stringify(formData.parsedProfile, null, 2)}
              </pre>
            </div>
            <div>
              <p className="mb-2 text-xs text-slate-500">JSON de debug da API</p>
              <pre className="max-h-72 overflow-auto rounded-md border border-white/10 bg-slate-950/70 p-3 text-xs leading-5 text-slate-300">
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
              <CardTitle className="text-xl">Perfil extraido do CV</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 pt-0 sm:grid-cols-2">
            {[
              ["Nome", formData.parsedProfile.name],
              ["Headline", formData.parsedProfile.headline],
              ["Cargo atual", formData.parsedProfile.currentRole],
              ["Empresa atual", formData.parsedProfile.currentCompany],
              ["Email", formData.parsedProfile.email],
              ["Telefone", formData.parsedProfile.phone],
              ["Localidade", formData.parsedProfile.location],
              [
                "Senioridade",
                [formData.parsedProfile.seniorityLevel, formData.parsedProfile.seniorityConfidence]
                  .filter(Boolean)
                  .join(" - "),
              ],
              ["Ferramentas", formData.parsedProfile.tools.join(", ")],
              ["Competencias tecnicas", formData.parsedProfile.technicalSkills.join(", ")],
              ["Competencias de negocio", formData.parsedProfile.businessSkills.join(", ")],
              ["Idiomas", formData.parsedProfile.languages.join(", ")],
              ["Formacao", formData.parsedProfile.education.join(", ")],
              ["Certificacoes", formData.parsedProfile.certifications.join(", ")],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-md border border-white/10 bg-slate-900/65 p-3"
              >
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-sm leading-5 text-slate-200">
                  {value || "Nao detectado"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        ) : null}

        {[
          ["Leitura do CV", "Extrai experiencia, ferramentas, conquistas e sinais de senioridade."],
          ["Analise de mercado", "Compara o perfil com cargos ranqueados e demanda por competencias."],
          ["Geracao do relatorio", "Retorna score, gaps, oportunidades e materiais otimizados."],
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
