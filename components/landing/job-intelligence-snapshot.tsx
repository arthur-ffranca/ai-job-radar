"use client";

import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  Code2,
  FileSearch,
  Globe2,
  MapPin,
  SignalHigh,
} from "lucide-react";

const snapshot = [
  {
    icon: BriefcaseBusiness,
    label: "Target Role",
    value: "{target_role}",
  },
  {
    icon: Building2,
    label: "Company",
    value: "{company}",
  },
  {
    icon: MapPin,
    label: "Work Model",
    value: "{work_model}",
  },
  {
    icon: BadgeDollarSign,
    label: "Estimated Salary",
    value: "{salary_if_available}",
  },
  {
    icon: Globe2,
    label: "Location",
    value: "{location}",
  },
  {
    icon: Code2,
    label: "Key Skills",
    value: "Extracted from job description",
  },
  {
    icon: SignalHigh,
    label: "Fit Signal",
    value: "Calculated from match score",
  },
];

export function JobIntelligenceSnapshot() {
  return (
    <motion.div
      initial={{ opacity: 0.96, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
      className="mx-auto mt-10 max-w-6xl"
    >
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-slate-950/58 p-2 shadow-glow backdrop-blur-xl">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(56,189,248,0.08),transparent_42%,rgba(52,211,153,0.08))]"
          aria-hidden="true"
        />
        <div className="relative mb-2 flex flex-col gap-2 rounded-md border border-white/10 bg-slate-950/55 px-3 py-2 text-left sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <FileSearch className="size-4 text-emerald-200" />
            <p className="text-sm font-medium text-white">
              Job Intelligence Snapshot
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Parsed from posting and private profile
          </p>
        </div>
        <div className="relative grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
          {snapshot.map(({ icon: Icon, label, value }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0.9, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 + index * 0.04 }}
              className="group min-w-0 rounded-md border border-white/10 bg-white/[0.045] p-3 text-left transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/25 hover:bg-white/[0.07] hover:shadow-glow"
            >
              <div className="mb-3 flex size-7 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
                <Icon className="size-4" />
              </div>
              <p className="text-[11px] uppercase tracking-normal text-slate-500">
                {label}
              </p>
              <p className="mt-1 text-sm font-medium leading-5 text-white [overflow-wrap:anywhere]">
                {value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
