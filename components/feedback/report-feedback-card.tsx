"use client";

import { FormEvent, useState } from "react";
import { MessageSquare, Send, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateAnonId } from "@/lib/client-id";
import { trackEvent } from "@/lib/telemetry";

type ReportFeedback = {
  rating: number;
  comment: string;
  useCase: string;
  createdAt: string;
  analysisId?: string;
  targetRole?: string;
  matchScore?: number;
  anonId?: string;
};

type ReportFeedbackCardProps = {
  analysisId?: string;
  targetRole?: string;
  matchScore?: number;
};

export function ReportFeedbackCard({
  analysisId,
  targetRole,
  matchScore,
}: ReportFeedbackCardProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [useCase, setUseCase] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload: ReportFeedback = {
      rating,
      comment: comment.trim(),
      useCase: useCase.trim(),
      createdAt: new Date().toISOString(),
      anonId: getOrCreateAnonId(),
      analysisId,
      targetRole,
      matchScore,
    };

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(typeof body.error === "string" ? body.error : "Erro ao enviar feedback.");
      }

      trackEvent("report_feedback_submitted", payload);
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao enviar feedback.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-sky-300/20 bg-slate-900/82 shadow-panel backdrop-blur">
      <CardHeader className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-100">
            <MessageSquare className="size-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Avalie esta experiencia</CardTitle>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Seu feedback ajuda a melhorar a experiencia e priorizar os proximos ajustes do produto.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {submitted ? (
          <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4">
            <p className="text-sm font-medium text-emerald-100">Feedback registrado.</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Obrigado. Sua resposta foi enviada de forma privada para melhoria do produto.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="mb-2 text-sm text-slate-300">Nota do relatorio</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="flex size-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.035] text-slate-500 transition hover:border-emerald-300/30 hover:text-emerald-100"
                    aria-label={`Nota ${value}`}
                  >
                    <Star
                      className={rating >= value ? "size-4 fill-emerald-200 text-emerald-200" : "size-4"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">
                O que ficou mais util para voce?
              </span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Ex.: gostei da comparacao por cargo, mas queria sugestoes mais diretas para o resumo profissional."
                className="min-h-28 w-full resize-y rounded-md border border-white/10 bg-slate-900/65 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">
                Qual seria seu principal caso de uso?
              </span>
              <input
                value={useCase}
                onChange={(event) => setUseCase(event.target.value)}
                placeholder="Ex.: transicao de carreira, recolocacao, promocao, vaga internacional"
                className="h-11 w-full rounded-md border border-white/10 bg-slate-900/65 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            {error ? (
              <p className="rounded-md border border-red-300/20 bg-red-300/10 p-3 text-sm text-red-100">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || (!rating && !comment.trim())}
            >
              <Send />
              {isSubmitting ? "Enviando..." : "Enviar feedback privado"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
