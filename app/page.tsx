"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  FileText,
  Gauge,
  Layers3,
  ListFilter,
  Radar,
  SearchCheck,
  Target,
  TrendingUp,
  Upload,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { JobIntelligenceSnapshot } from "@/components/landing/job-intelligence-snapshot";
import { SectionIntro } from "@/components/landing/section-intro";
import { UploadReportFlow } from "@/components/upload-report-flow";
import { useAuthPrompt } from "@/components/auth/auth-prompt-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type IconItem = {
  icon: LucideIcon;
  title: string;
  copy: string;
};

const motionCard = {
  hidden: { opacity: 0.92, y: 12 },
  show: { opacity: 1, y: 0 },
};

const workflow: IconItem[] = [
  {
    icon: Upload,
    title: "Envie seu CV",
    copy: "Use seu curriculo atual como base privada do perfil profissional.",
  },
  {
    icon: Target,
    title: "Escolha cargos-alvo",
    copy: "Defina cargo, localidade, senioridade e preferencias de oportunidade.",
  },
  {
    icon: SearchCheck,
    title: "A IA escaneia o mercado",
    copy: "Analise vagas, sinais das empresas e demanda recorrente de habilidades.",
  },
  {
    icon: Gauge,
    title: "Receba scores de match",
    copy: "Priorize vagas por fit, cobertura de palavras-chave e gaps realistas.",
  },
  {
    icon: FileText,
    title: "Baixe CV otimizado e relatorio",
    copy: "Transforme o score em materiais claros para candidatura.",
  },
];

const features: IconItem[] = [
  {
    icon: Gauge,
    title: "Score de match com IA",
    copy: "Um score claro baseado em habilidades, senioridade, salario, palavras-chave e qualidade da vaga.",
  },
  {
    icon: WandSparkles,
    title: "Otimizacao de CV",
    copy: "Sugestoes de reescrita que preservam suas evidencias e alinham o CV a cada cargo.",
  },
  {
    icon: TrendingUp,
    title: "Deteccao de habilidades do mercado",
    copy: "Identifique ferramentas, stacks e habilidades de negocio mais citadas nas vagas.",
  },
  {
    icon: ListFilter,
    title: "Oportunidades ranqueadas",
    copy: "Veja quais vagas merecem atencao antes de gastar tempo na candidatura.",
  },
  {
    icon: Layers3,
    title: "Gaps de carreira",
    copy: "Identifique provas e habilidades ausentes antes de um recrutador perceber.",
  },
  {
    icon: FileSearch,
    title: "Relatorio de inteligencia da vaga",
    copy: "Gere um relatorio com logica de fit, riscos, palavras-chave e proximas acoes.",
  },
];

const insights = [
  ["Requisitos especificos do cargo", 83],
  ["Ferramentas exigidas", 71],
  ["Contexto da industria", 42],
  ["Sinal de senioridade", 58],
] as const;

const problemPoints = [
  "Portais de vaga otimizam volume, nao fit.",
  "Curriculos sao enviados antes da estrategia ficar clara.",
  "Candidatos raramente enxergam quais habilidades o mercado esta valorizando.",
];

function ProblemSection() {
  return (
    <section className="relative border-b border-white/10 bg-slate-900/35 px-5 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            variants={motionCard}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="text-sm font-medium text-sky-200">O problema</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              Centenas de candidaturas. Pouca clareza. Nenhuma estrategia.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              O AI Job Radar transforma a busca por vagas em um fluxo estruturado de inteligencia.
            </p>
          </motion.div>

          <div className="grid gap-3">
            {problemPoints.map((point, index) => (
              <motion.div
                key={point}
                variants={motionCard}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="rounded-lg border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/25 hover:bg-white/[0.055]"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-300/15 text-emerald-200">
                    <Check className="size-3.5" />
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{point}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="border-b border-white/10 px-5 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Fluxo"
          title="Do envio do CV a uma candidatura mais forte."
          copy="Cada etapa foi pensada para conectar depois a uma API completa de relatorios sem refazer a interface."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-5">
          {workflow.map(({ icon: Icon, title, copy }, index) => (
            <motion.div
              key={title}
              variants={motionCard}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className="relative"
            >
              {index < workflow.length - 1 ? (
                <div className="absolute left-[calc(50%+32px)] top-9 hidden h-px w-[calc(100%-48px)] bg-white/10 md:block" />
              ) : null}
              <Card className="relative h-full border-white/10 bg-white/[0.035] shadow-none transition duration-300 hover:-translate-y-1 hover:border-sky-300/25 hover:bg-white/[0.055]">
                <CardHeader className="p-5">
                  <div className="mb-5 flex size-10 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg leading-6">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-sm leading-6 text-slate-400">{copy}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-hidden border-b border-white/10 bg-slate-900/35 px-5 py-24 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 fine-grid opacity-35" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Recursos"
          title="Superficies reais de produto para uma busca mais inteligente."
          copy="Ferramentas objetivas para decidir onde aplicar, como se posicionar e o que melhorar."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, copy }, index) => (
            <motion.div
              key={title}
              variants={motionCard}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
            >
              <Card className="h-full border-white/10 bg-slate-900/78 shadow-none backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-emerald-300/25 hover:bg-white/[0.05]">
                <CardHeader className="p-5">
                  <div className="mb-5 flex size-10 items-center justify-center rounded-md border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-xl leading-7">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-sm leading-6 text-slate-400">{copy}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={motionCard}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-6"
        >
          <UploadReportFlow />
        </motion.div>
      </div>
    </section>
  );
}

function InsightsSection() {
  return (
    <section
      id="insights"
      className="relative overflow-hidden border-b border-white/10 px-5 py-24 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(56,189,248,0.045),transparent_48%,rgba(16,185,129,0.06))]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          variants={motionCard}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="pulse">Inteligencia de mercado</Badge>
          <h2 className="mt-6 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
            Saiba quais habilidades o mercado esta pedindo.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">
            O AI Job Radar transforma descricoes de vaga em sinais de habilidades e compara essa demanda com seu perfil.
          </p>
        </motion.div>

        <motion.div
          variants={motionCard}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="rounded-lg border border-white/10 bg-slate-900/88 p-5 shadow-panel"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm text-slate-500">Cargos analisados</p>
              <h3 className="mt-1 text-xl font-semibold text-white">
                Frequencia de habilidades
              </h3>
            </div>
            <BarChart3 className="size-5 text-sky-200" />
          </div>

          <div className="mt-6 space-y-5">
            {insights.map(([skill, value], index) => (
              <div key={skill}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">
                    {skill} aparece em {value}% dos cargos analisados
                  </span>
                  <span className="font-medium text-white">{value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <motion.div
                    initial={false}
                    whileInView={{ width: `${value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.85, delay: index * 0.06 }}
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(56,189,248,0.9),rgba(52,211,153,0.9))]"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PrivacySection() {
  const privacyItems = [
    "Seu CV e usado apenas para gerar analise e materiais de candidatura.",
    "Nao vendemos seus dados.",
    "Nao compartilhamos seu CV com empresas.",
    "Voce pode excluir sua analise.",
    "O sistema nao inventa experiencias profissionais.",
  ];

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-slate-900/35 px-5 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Privacidade e confianca"
          title="Seu CV continua seu."
          copy="O AI Job Radar foi desenhado para apoiar estrategia de carreira, nao para expor seu perfil ou criar narrativas falsas."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {privacyItems.map((item, index) => (
            <motion.div
              key={item}
              variants={motionCard}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
              className="rounded-lg border border-white/10 bg-white/[0.035] p-5"
            >
              <BadgeCheck className="mb-4 size-5 text-emerald-200" />
              <p className="text-sm leading-6 text-slate-300">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { openAuthPrompt } = useAuthPrompt();

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-900/72 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <a href="#product" className="flex items-center gap-3 text-sm font-semibold text-white">
            <span className="flex size-8 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
              <Radar className="size-4" />
            </span>
            AI Job Radar
          </a>
          <div className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
            <a className="transition hover:text-white" href="#product">
              Produto
            </a>
            <a className="transition hover:text-white" href="#workflow">
              Fluxo
            </a>
            <a className="transition hover:text-white" href="#features">
              Recursos
            </a>
            <a className="transition hover:text-white" href="#insights">
              Inteligencia
            </a>
            <a className="transition hover:text-white" href="/demo">
              Analisar perfil
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/sign-in">Entrar</Link>
            </Button>
            <Button asChild size="sm" variant="accent">
              <Link href="/demo">
                Analisar perfil
                <ChevronRight />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <section
        id="product"
        className="relative overflow-hidden border-b border-white/10 px-5 pb-20 pt-28 sm:px-6 lg:px-8"
      >
        <div className="absolute inset-0 radar-grid opacity-55" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(56,189,248,0.12),rgba(2,6,23,0))]" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(0deg,hsl(var(--background)),rgba(2,6,23,0))]" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="mx-auto max-w-4xl text-center"
          >
            <Badge variant="pulse">Inteligencia de carreira com IA</Badge>
            <h1 className="mt-7 text-balance text-5xl font-semibold leading-[0.98] text-white sm:text-6xl lg:text-7xl">
              Pare de se candidatar no escuro.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              O AI Job Radar le seu CV, mostra como o mercado interpreta seu perfil e gera materiais adaptados para cada oportunidade.
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-400">
              Entenda seus pontos fortes, descubra gaps, compare seu CV com vagas reais e gere rascunhos de CV, cartas e respostas de candidatura sem inventar experiencias.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={openAuthPrompt}>
                Analisar meu perfil
                <ArrowRight />
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="/demo">
                  Ver demo
                  <BriefcaseBusiness />
                </a>
              </Button>
            </div>
          </motion.div>

          <JobIntelligenceSnapshot />
          <DashboardPreview />
        </div>
      </section>

      <ProblemSection />
      <WorkflowSection />
      <FeaturesSection />
      <PrivacySection />
      <InsightsSection />
    </main>
  );
}
