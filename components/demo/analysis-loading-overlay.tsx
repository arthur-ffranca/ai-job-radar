"use client";

import { motion } from "framer-motion";
import { FileSearch, Radar, SearchCheck, Sparkles } from "lucide-react";

const analysisSteps = [
  {
    icon: FileSearch,
    label: "Lendo seu CV...",
  },
  {
    icon: SearchCheck,
    label: "Identificando sua narrativa profissional...",
  },
  {
    icon: Sparkles,
    label: "Comparando com a vaga...",
  },
  {
    icon: FileSearch,
    label: "Gerando rascunho de CV adaptado...",
  },
  {
    icon: Sparkles,
    label: "Preparando cartas e recomendacoes...",
  },
];

export function AnalysisLoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/88 px-5 backdrop-blur-xl"
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 radar-grid opacity-35" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(56,189,248,0.14),rgba(2,6,23,0))]"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0.96, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-slate-900/90 p-6 text-center shadow-panel"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(56,189,248,0.08),transparent_44%,rgba(52,211,153,0.08))]"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="mx-auto flex size-14 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200 shadow-glow">
            <Radar className="size-7" />
          </div>

          <p className="mt-6 text-sm font-medium text-emerald-100">
            Gerando relatorio AI Job Radar
          </p>
          <h2 className="mx-auto mt-3 max-w-xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Gerando uma nova analise para este arquivo.
          </h2>

          <div className="mx-auto mt-8 h-2 max-w-md overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: "8%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(56,189,248,0.95),rgba(52,211,153,0.95))]"
            />
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-5">
            {analysisSteps.map(({ icon: Icon, label }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0.72, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.18 + index * 0.18,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 1.2,
                }}
                className="rounded-md border border-white/10 bg-white/[0.045] p-4 text-left"
              >
                <Icon className="mb-3 size-4 text-sky-200" />
                <p className="text-sm font-medium leading-5 text-slate-200">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
