"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Banknote,
  BriefcaseBusiness,
  Building2,
  MapPin,
  Radar,
  Sparkles,
  TrendingUp,
  Waypoints,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const workModelData = [
  { name: "Remote", value: 34, color: "#38bdf8" },
  { name: "Hybrid", value: 49, color: "#34d399" },
  { name: "Onsite", value: 17, color: "#94a3b8" },
];

const requestedSkills = [
  { skill: "SQL", share: 83 },
  { skill: "Python", share: 71 },
  { skill: "Excel", share: 64 },
  { skill: "Power BI", share: 42 },
  { skill: "Stakeholder Mgmt", share: 39 },
  { skill: "Forecasting", share: 35 },
];

const fastestGrowingSkills = [
  { skill: "AI workflows", growth: 46 },
  { skill: "Anaplan", growth: 31 },
  { skill: "dbt", growth: 28 },
  { skill: "RevOps", growth: 24 },
  { skill: "Spark", growth: 21 },
];

const salarySkills = [
  { skill: "Spark", salary: 18.4 },
  { skill: "Anaplan", salary: 16.8 },
  { skill: "Python", salary: 15.9 },
  { skill: "SAP", salary: 14.7 },
  { skill: "SQL", salary: 13.8 },
];

const industries = [
  { name: "Financial Services", openings: 1280 },
  { name: "Technology", openings: 1140 },
  { name: "Retail", openings: 870 },
  { name: "Logistics", openings: 620 },
  { name: "Healthcare", openings: 540 },
];

const companies = [
  { name: "Nubank", roles: 94 },
  { name: "Mercado Livre", roles: 87 },
  { name: "iFood", roles: 72 },
  { name: "Ambev", roles: 66 },
  { name: "Stone", roles: 58 },
];

const salaryDistribution = [
  { range: "R$4k", roles: 18 },
  { range: "R$6k", roles: 34 },
  { range: "R$8k", roles: 48 },
  { range: "R$10k", roles: 55 },
  { range: "R$12k", roles: 44 },
  { range: "R$15k+", roles: 29 },
];

const hiringTrend = [
  { month: "Jan", roles: 920, remote: 380 },
  { month: "Feb", roles: 980, remote: 362 },
  { month: "Mar", roles: 1080, remote: 344 },
  { month: "Apr", roles: 1190, remote: 330 },
  { month: "May", roles: 1270, remote: 334 },
  { month: "Jun", roles: 1360, remote: 350 },
];

const topCities = [
  { city: "São Paulo", roles: 1480 },
  { city: "Rio de Janeiro", roles: 620 },
  { city: "Belo Horizonte", roles: 470 },
  { city: "Curitiba", roles: 410 },
  { city: "Campinas", roles: 360 },
];

const insightCards = [
  {
    icon: Radar,
    label: "Skill demand",
    value: "SQL appears in 83% of analyzed roles",
    tone: "text-sky-200",
  },
  {
    icon: Waypoints,
    label: "Work model shift",
    value: "Remote finance roles decreased 12% this quarter",
    tone: "text-slate-200",
  },
  {
    icon: Banknote,
    label: "Salary correlation",
    value: "Spark-related jobs show the highest salary average",
    tone: "text-emerald-200",
  },
  {
    icon: MapPin,
    label: "City trend",
    value: "Hybrid work continues growing in São Paulo",
    tone: "text-sky-200",
  },
];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; dataKey?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-md border border-white/10 bg-slate-950/95 px-3 py-2 shadow-panel">
      {label ? <p className="mb-1 text-xs text-slate-500">{label}</p> : null}
      {payload.map((item) => (
        <p key={`${item.name}-${item.dataKey}`} className="text-sm text-slate-200">
          {item.name || item.dataKey}:{" "}
          <span className="font-medium text-white">{item.value}</span>
        </p>
      ))}
    </div>
  );
}

function AnalyticsCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`border-white/10 bg-slate-950/80 shadow-none transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/25 hover:bg-slate-950/95 ${className}`}
    >
      <CardHeader className="p-5">
        <CardTitle className="text-base text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">{children}</CardContent>
    </Card>
  );
}

export function GlobalMarketIntelligence() {
  return (
    <section id="global-market-intelligence" className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
        className="overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(52,211,153,0.12),transparent_36%),rgba(2,6,23,0.84)] p-5 shadow-glow backdrop-blur sm:p-6"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="pulse">Global Market Intelligence</Badge>
            <h2 className="mt-5 text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Labor market signals across analyzed job postings.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Aggregated, anonymized intelligence from searches and job postings. This is the market layer, separate from your personal career insights.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-white/[0.035] p-2 text-center">
            {[
              ["42k", "roles analyzed"],
              ["1.8k", "companies"],
              ["16", "industries"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-md bg-white/[0.035] px-3 py-2">
                <p className="text-lg font-semibold text-white">{value}</p>
                <p className="mt-1 text-[11px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {insightCards.map(({ icon: Icon, label, value, tone }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: index * 0.05 }}
          >
            <Card className="h-full border-white/10 bg-white/[0.035] shadow-none transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/25 hover:bg-white/[0.055]">
              <CardContent className="p-4">
                <div className="mb-4 flex size-9 items-center justify-center rounded-md border border-white/10 bg-slate-950/70">
                  <Icon className={`size-4 ${tone}`} />
                </div>
                <p className="text-[11px] uppercase tracking-normal text-slate-500">
                  {label}
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-white">{value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <AnalyticsCard title="Remote vs Hybrid vs Onsite trends">
          <div className="grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workModelData}
                    dataKey="value"
                    innerRadius={54}
                    outerRadius={78}
                    paddingAngle={4}
                    stroke="rgba(15,23,42,0.9)"
                    strokeWidth={3}
                  >
                    {workModelData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {workModelData.map((item) => (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </span>
                    <span className="font-medium text-white">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Hiring trend over time">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hiringTrend} margin={{ left: -16, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="rolesGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="remoteGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="roles" name="Total roles" stroke="#38bdf8" fill="url(#rolesGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="remote" name="Remote roles" stroke="#34d399" fill="url(#remoteGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AnalyticsCard title="Most requested skills overall">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestedSkills} layout="vertical" margin={{ left: 22, right: 8 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.1)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="skill"
                  width={104}
                  tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="share" name="Share %" radius={[0, 6, 6, 0]} fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Fastest-growing skills">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fastestGrowingSkills} margin={{ left: -18, right: 14, top: 14 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="skill" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="growth" name="Growth %" stroke="#34d399" strokeWidth={2.5} dot={{ r: 4, fill: "#34d399" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Highest salary-correlated skills">
          <div className="space-y-4">
            {salarySkills.map((item) => (
              <div key={item.skill} className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{item.skill}</span>
                  <span className="text-sm text-emerald-200">R${item.salary.toFixed(1)}k avg</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(56,189,248,0.88),rgba(52,211,153,0.95))]"
                    style={{ width: `${(item.salary / 20) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AnalyticsCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
        <AnalyticsCard title="Most active hiring industries">
          <div className="space-y-3">
            {industries.map((industry, index) => (
              <div
                key={industry.name}
                className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.035] px-3 py-3"
              >
                <span className="flex items-center gap-3 text-sm text-slate-300">
                  <BriefcaseBusiness className="size-4 text-sky-200" />
                  {industry.name}
                </span>
                <span className="text-sm font-medium text-white">
                  {index + 1}. {industry.openings}
                </span>
              </div>
            ))}
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Most active hiring companies">
          <div className="space-y-3">
            {companies.map((company) => (
              <div
                key={company.name}
                className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.035] px-3 py-3"
              >
                <span className="flex items-center gap-3 text-sm text-slate-300">
                  <Building2 className="size-4 text-emerald-200" />
                  {company.name}
                </span>
                <span className="text-sm font-medium text-white">{company.roles} roles</span>
              </div>
            ))}
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Top cities for hiring">
          <div className="space-y-3">
            {topCities.map((city) => (
              <div key={city.city}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-300">
                    <MapPin className="size-4 text-sky-200" />
                    {city.city}
                  </span>
                  <span className="text-white">{city.roles}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-sky-300/80"
                    style={{ width: `${(city.roles / topCities[0].roles) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AnalyticsCard>
      </div>

      <AnalyticsCard title="Salary distribution">
        <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryDistribution} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="range" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="roles" name="Roles" radius={[6, 6, 0, 0]} fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <Sparkles className="size-5 text-emerald-200" />
            <p className="mt-4 text-sm font-medium text-white">Market read</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Salary bands cluster around R$8k to R$12k, while postings requiring advanced data platforms or planning tools move into the upper range.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-emerald-200">
              <TrendingUp className="size-4" />
              Upper-band roles increased 18% in the last 90 days.
            </div>
          </div>
        </div>
      </AnalyticsCard>
    </section>
  );
}
