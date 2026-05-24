"use client";

import { motion } from "framer-motion";
import { BarChart3, BriefcaseBusiness, MapPin, Radar, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MarketSignal = {
  title: string;
  value: string;
};

type MarketPack = {
  summary: string;
  signals: MarketSignal[];
};

const roleSignals: Record<string, MarketPack> = {
  data_analyst: {
    summary: "Sinais de vagas de dados e BI alinhados ao cargo-alvo atual.",
    signals: [
      { title: "Skill recorrente", value: "SQL aparece com alta frequencia em vagas de Data Analyst." },
      { title: "Ferramentas", value: "Power BI, Tableau e Looker aparecem com recorrencia em posicoes analiticas." },
      { title: "Modelo de trabalho", value: "Vagas hibridas seguem fortes para analise de dados em capitais." },
      { title: "Foco da funcao", value: "Analise exploratoria, dashboards e comunicacao com stakeholders." },
    ],
  },
  bi_analyst: {
    summary: "Sinais de mercado para perfis de BI e analytics corporativo.",
    signals: [
      { title: "Skill recorrente", value: "SQL e modelagem de dados aparecem com frequencia em vagas de BI." },
      { title: "Ferramentas", value: "Power BI e Tableau sao citados em grande parte das descricoes." },
      { title: "Modelo de trabalho", value: "Hibrido e presencial predominam em funcoes de BI interno." },
      { title: "Foco da funcao", value: "Governanca de indicadores e suporte a decisoes de negocio." },
    ],
  },
  data_engineer: {
    summary: "Sinais de mercado para engenharia de dados e pipelines.",
    signals: [
      { title: "Skill recorrente", value: "Python e SQL aparecem com alta frequencia em vagas de Data Engineer." },
      { title: "Ferramentas", value: "Pipelines, ETL e cloud sao exigencias comuns." },
      { title: "Modelo de trabalho", value: "Hibrido segue comum em times de plataforma e dados." },
      { title: "Foco da funcao", value: "Construcao de pipelines, confiabilidade e qualidade de dados." },
    ],
  },
  finance: {
    summary: "Sinais de mercado para perfis financeiros e planejamento.",
    signals: [
      { title: "Skill recorrente", value: "Forecasting, orcamento e analise de variancia aparecem com frequencia." },
      { title: "Ferramentas", value: "Excel avancado e ferramentas de planejamento sao recorrentes." },
      { title: "Modelo de trabalho", value: "Hibrido e presencial predominam em funcoes de planejamento financeiro." },
      { title: "Foco da funcao", value: "Planejamento, performance financeira e suporte a decisao executiva." },
    ],
  },
};

function resolveMarketPack(targetRole: string) {
  const role = targetRole.toLowerCase().trim();

  if (/(data analyst|analista de dados|analytics analyst|product data analyst)/.test(role)) {
    return roleSignals.data_analyst;
  }
  if (/(bi analyst|business intelligence|analista de bi)/.test(role)) {
    return roleSignals.bi_analyst;
  }
  if (/(data engineer|engenheiro de dados|analytics engineer|etl)/.test(role)) {
    return roleSignals.data_engineer;
  }
  if (/(fp&a|financial analyst|finance|planejamento financeiro|analista financeiro)/.test(role)) {
    return roleSignals.finance;
  }

  return null;
}

export function GlobalMarketIntelligence({
  targetRole,
  location,
  workModel,
}: {
  targetRole: string;
  location?: string;
  workModel?: string;
}) {
  const marketPack = resolveMarketPack(targetRole);

  return (
    <section id="global-market-intelligence" className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
        className="overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(52,211,153,0.12),transparent_36%),rgba(2,6,23,0.84)] p-5 shadow-glow backdrop-blur sm:p-6"
      >
        <Badge variant="pulse">Sinais de mercado e vagas</Badge>
        <h2 className="mt-5 text-2xl font-semibold leading-tight text-white sm:text-3xl">
          Sinais de mercado para: {targetRole || "cargo-alvo atual"}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
          {location ? (
            <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.035] px-2 py-1">
              <MapPin className="size-3" /> {location}
            </span>
          ) : null}
          {workModel ? (
            <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.035] px-2 py-1">
              <BriefcaseBusiness className="size-3" /> {workModel}
            </span>
          ) : null}
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          {marketPack ? marketPack.summary : "Ainda nao ha sinais de mercado suficientes para este cargo."}
        </p>
      </motion.div>

      {marketPack ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {marketPack.signals.map((signal, index) => (
            <motion.div
              key={signal.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <Card className="h-full border-white/10 bg-white/[0.035] shadow-none transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/25 hover:bg-white/[0.055]">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm text-white">{signal.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm leading-6 text-slate-300">
                  {signal.value}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-white/10 bg-slate-900/82 shadow-none">
          <CardContent className="flex items-center gap-3 p-5 text-sm text-slate-400">
            <Radar className="size-4 text-sky-200" />
            Ainda nao ha sinais de mercado suficientes para este cargo.
          </CardContent>
        </Card>
      )}

      <Card className="border-white/10 bg-slate-900/82 shadow-none">
        <CardContent className="flex items-center gap-3 p-5 text-sm text-slate-400">
          <BarChart3 className="size-4 text-emerald-200" />
          <span>Vagas conectadas ao cargo atual sao atualizadas somente a partir do target role selecionado.</span>
          <Sparkles className="size-4 text-sky-200" />
        </CardContent>
      </Card>
    </section>
  );
}
