"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  BriefcaseBusiness,
  Check,
  Gauge,
  Layers3,
  LockKeyhole,
  MapPin,
  Radar,
  SearchCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

const skills = ["{required_skill_1}", "{required_skill_2}", "{required_skill_3}", "{required_skill_4}"];

const targetProfile = [
  ["Company", "{company}"],
  ["Role", "{target_role}"],
  ["Location", "{location}"],
  ["Work model", "{work_model}"],
  ["Salary signal", "{salary_if_available}"],
];

const intelligenceCards = [
  {
    label: "Keyword coverage",
    value: "{coverage}%",
    detail: "Calculated from role-specific requirements",
  },
  {
    label: "Salary fit",
    value: "{salary_fit}",
    detail: "Compares available salary signal with user target",
  },
  {
    label: "Profile gaps",
    value: "{gap_count}",
    detail: "Missing evidence from CV versus job description",
  },
];

const opportunities = [
  {
    company: "{company}",
    role: "{target_role}",
    location: "{location}",
    workModel: "{work_model}",
    salary: "{salary_if_available}",
    score: 91,
    gap: "{profile_gap}",
    skills: ["{skill_1}", "{skill_2}", "{skill_3}"],
  },
  {
    company: "{ranked_company_2}",
    role: "{related_role_2}",
    location: "{location}",
    workModel: "{work_model}",
    salary: "{salary_if_available}",
    score: 87,
    gap: "{profile_gap}",
    skills: ["{skill_1}", "{skill_2}", "{skill_3}"],
  },
  {
    company: "{ranked_company_3}",
    role: "{related_role_3}",
    location: "{location}",
    workModel: "{work_model}",
    salary: "{salary_if_available}",
    score: 84,
    gap: "{profile_gap}",
    skills: ["{skill_1}", "{skill_2}", "{skill_3}"],
  },
];

export function DashboardPreview() {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative mx-auto mt-14 max-w-6xl"
    >
      <div className="absolute -inset-px rounded-lg bg-[linear-gradient(135deg,rgba(56,189,248,0.28),rgba(15,23,42,0),rgba(52,211,153,0.24))] opacity-80 blur-[1px]" />
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-slate-950/92 shadow-panel backdrop-blur">
        <div className="flex h-12 items-center justify-between border-b border-white/10 bg-white/[0.035] px-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-slate-500" />
            <span className="size-2 rounded-full bg-slate-600" />
            <span className="size-2 rounded-full bg-emerald-300/70" />
          </div>
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300">
            <LockKeyhole className="size-3.5 text-emerald-200" />
            Private career profile
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[290px_1fr]">
          <aside className="border-b border-white/10 bg-slate-950/75 p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
                <Radar className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">AI Job Radar</p>
                <p className="text-xs text-slate-500">Extracted job intelligence</p>
              </div>
            </div>

            <div className="mt-7 space-y-2">
              {targetProfile.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-normal text-slate-500">
                        {label}
                      </p>
                      <p className="mt-1 text-sm text-slate-200">{value}</p>
                    </div>
                    <Check className="size-4 shrink-0 text-emerald-200" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Requirement density</p>
                <BriefcaseBusiness className="size-4 text-sky-200" />
              </div>
              <div className="mt-4 flex h-20 items-end gap-1.5">
                {[34, 48, 42, 58, 72, 64, 82, 76, 90, 84, 96, 88].map(
                  (height, index) => (
                    <motion.span
                      key={index}
                      initial={false}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: index * 0.035 }}
                      className="flex-1 rounded-sm bg-[linear-gradient(180deg,rgba(125,211,252,0.9),rgba(16,185,129,0.28))]"
                      style={{ height: `${height}%` }}
                    />
                  )
                )}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                AI extracts required skills, business context, compensation hints, and gaps from each posting.
              </p>
            </div>
          </aside>

          <div className="p-5 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
              <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-5 shadow-glow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-emerald-100/75">Match Score</p>
                    <p className="mt-3 text-6xl font-semibold leading-none text-white">
                      91
                    </p>
                  </div>
                  <Gauge className="size-6 text-emerald-100" />
                </div>
                <div className="mt-5 h-2 rounded-full bg-white/10">
                  <motion.div
                    initial={false}
                    whileInView={{ width: "91%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(56,189,248,0.92),rgba(52,211,153,0.96))]"
                    style={{ width: "91%" }}
                  />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Scores each posting against the uploaded CV profile, selected target role, required skills, salary signal, and detected gaps.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Top skills</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">
                      Required skills extracted from the posting
                    </h3>
                  </div>
                  <BarChart3 className="size-5 text-sky-200" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-sm font-medium text-sky-50 transition hover:border-sky-200/40 hover:bg-sky-300/15"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {intelligenceCards.map(({ label, value, detail }) => (
                    <div
                      key={label}
                      className="rounded-lg border border-white/10 bg-slate-950/55 p-3"
                    >
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {value}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Ranked opportunities</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">
                    Prioritized by match score, role context, salary signal, and profile gaps
                  </h3>
                </div>
                <SearchCheck className="size-5 text-sky-200" />
              </div>
              <div className="space-y-3">
                {opportunities.map((opportunity, index) => (
                  <div
                    key={opportunity.company}
                    className={cn(
                      "grid gap-4 rounded-lg border p-4 transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/30 lg:grid-cols-[1fr_auto] lg:items-center",
                      index === 0
                        ? "border-sky-300/25 bg-sky-300/10"
                        : "border-white/10 bg-slate-950/55"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-white">
                          {opportunity.company}
                        </p>
                        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-400">
                          {opportunity.role}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-sky-200" />
                          {opportunity.location} · {opportunity.workModel}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Gauge className="size-3.5 text-emerald-200" />
                          {opportunity.salary}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Layers3 className="size-3.5 text-sky-200" />
                          Gap: {opportunity.gap}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {opportunity.skills.map((skill) => (
                          <span
                            key={`${opportunity.company}-${skill}`}
                            className="rounded border border-white/10 bg-white/[0.035] px-2 py-1 text-[11px] text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:justify-end">
                      <span className="text-2xl font-semibold text-emerald-100">
                        {opportunity.score}
                      </span>
                      <span className="text-xs text-slate-500">match</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
