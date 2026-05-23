"use client";

import { FormEvent, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    title: "Upload your resume",
    copy: "Add your current CV as the private career profile baseline.",
  },
  {
    icon: Target,
    title: "Choose your target role",
    copy: "Set the role, location, seniority, and salary range you care about.",
  },
  {
    icon: SearchCheck,
    title: "AI scans the market",
    copy: "Analyze job posts, company signals, and recurring skill demand.",
  },
  {
    icon: Gauge,
    title: "Get match scores",
    copy: "Prioritize roles by fit, keyword coverage, and realistic gaps.",
  },
  {
    icon: FileText,
    title: "Download an optimized resume and report",
    copy: "Turn the score into focused application assets.",
  },
];

const features: IconItem[] = [
  {
    icon: Gauge,
    title: "AI Match Score",
    copy: "A clear fit score based on skills, seniority, salary, keywords, and role quality.",
  },
  {
    icon: WandSparkles,
    title: "Resume Optimization",
    copy: "Rewrite suggestions that keep your evidence intact and align it to each role.",
  },
  {
    icon: TrendingUp,
    title: "Market Skill Detection",
    copy: "Identify which tools, stacks, and business skills are showing up most often.",
  },
  {
    icon: ListFilter,
    title: "Ranked Opportunities",
    copy: "See which jobs deserve attention before spending time on the application.",
  },
  {
    icon: Layers3,
    title: "Career Gaps",
    copy: "Spot missing proof points and skills before a recruiter does.",
  },
  {
    icon: FileSearch,
    title: "Job Intelligence Report",
    copy: "Generate a concise report with fit logic, risks, keywords, and next actions.",
  },
];

const insights = [
  ["Role-specific requirements", 83],
  ["Tool proficiency", 71],
  ["Industry context", 42],
  ["Seniority signal", 58],
] as const;

const problemPoints = [
  "Job boards optimize for volume, not fit.",
  "Resumes are sent before the strategy is clear.",
  "Candidates rarely see which skills the market is actually rewarding.",
];

function ProblemSection() {
  return (
    <section className="relative border-b border-white/10 bg-slate-950/35 px-5 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            variants={motionCard}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="text-sm font-medium text-sky-200">The problem</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              Hundreds of applications. Little clarity. No strategy.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              AI Job Radar turns the search from a volume game into a structured intelligence workflow.
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
          eyebrow="Workflow"
          title="From resume upload to a sharper application."
          copy="Each step is designed to support a future report API without changing the frontend structure."
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
      className="relative overflow-hidden border-b border-white/10 bg-slate-950/35 px-5 py-24 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 fine-grid opacity-35" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Features"
          title="Real product surfaces for a smarter job search."
          copy="Concise tools for deciding where to apply, how to position, and what to improve."
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
              <Card className="h-full border-white/10 bg-slate-950/78 shadow-none backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-emerald-300/25 hover:bg-white/[0.05]">
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
          <Badge variant="pulse">Market intelligence</Badge>
          <h2 className="mt-6 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
            Know which skills the market is asking for.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">
            AI Job Radar turns job descriptions into a skills signal, then compares that demand against your profile.
          </p>
        </motion.div>

        <motion.div
          variants={motionCard}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="rounded-lg border border-white/10 bg-slate-950/88 p-5 shadow-panel"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm text-slate-500">Analyzed roles</p>
              <h3 className="mt-1 text-xl font-semibold text-white">
                Sample skill frequency
              </h3>
            </div>
            <BarChart3 className="size-5 text-sky-200" />
          </div>

          <div className="mt-6 space-y-5">
            {insights.map(([skill, value], index) => (
              <div key={skill}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">
                    {skill} detected in {value}% of analyzed roles
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

function BetaCTA() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section
      id="beta"
      className="relative overflow-hidden px-5 py-24 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 fine-grid opacity-35" aria-hidden="true" />
      <div className="relative mx-auto max-w-5xl rounded-lg border border-white/10 bg-slate-950/92 p-8 text-center shadow-panel sm:p-12">
        <Badge variant="outline" className="border-emerald-300/20 text-emerald-100">
          Private beta
        </Badge>
        <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
          Be among the first to use AI Job Radar.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          Join early access and help shape the career intelligence workflow before public launch.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-9 grid max-w-xl gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 sm:grid-cols-[1fr_auto]"
        >
          <Input
            required
            type="email"
            placeholder="you@email.com"
            aria-label="Email address"
            className="h-11 border-white/10 bg-slate-950/70"
          />
          <Button type="submit" className="h-11">
            {submitted ? "Joined" : "Join Beta"}
            {submitted ? <Check /> : <ArrowRight />}
          </Button>
        </form>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <a href="#product" className="flex items-center gap-3 text-sm font-semibold text-white">
            <span className="flex size-8 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
              <Radar className="size-4" />
            </span>
            AI Job Radar
          </a>
          <div className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
            <a className="transition hover:text-white" href="#product">
              Product
            </a>
            <a className="transition hover:text-white" href="#workflow">
              Workflow
            </a>
            <a className="transition hover:text-white" href="#features">
              Features
            </a>
            <a className="transition hover:text-white" href="#insights">
              Insights
            </a>
            <a className="transition hover:text-white" href="#beta">
              Join Beta
            </a>
          </div>
          <Button asChild size="sm" variant="accent">
            <a href="#beta">
              Join Beta
              <ChevronRight />
            </a>
          </Button>
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
            <Badge variant="pulse">Career Intelligence powered by AI</Badge>
            <h1 className="mt-7 text-balance text-5xl font-semibold leading-[0.98] text-white sm:text-6xl lg:text-7xl">
              Find the opportunities that truly match your profile.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              AI Job Radar analyzes job postings, detects market skills, scores your fit, and helps you optimize your resume for the best opportunities.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="/demo">
                  Analyze My Profile
                  <ArrowRight />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="/demo">
                  View Demo
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
      <InsightsSection />
      <BetaCTA />
    </main>
  );
}
