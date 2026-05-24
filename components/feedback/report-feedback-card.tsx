"use client";

import { FormEvent, useState } from "react";
import { MessageSquare, Send, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReportFeedback = {
  rating: number;
  comment: string;
  useCase: string;
  createdAt: string;
};

export function ReportFeedbackCard() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [useCase, setUseCase] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: ReportFeedback = {
      rating,
      comment: comment.trim(),
      useCase: useCase.trim(),
      createdAt: new Date().toISOString(),
    };

    console.log("[AI Job Radar] feedback do relatorio", payload);

    setSubmitted(true);
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
              Por enquanto ele fica salvo localmente. A estrutura ja esta pronta para enviar para a API quando conectarmos o banco.
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

            <Button type="submit" className="w-full" disabled={!rating && !comment.trim()}>
              <Send />
              Enviar feedback
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
