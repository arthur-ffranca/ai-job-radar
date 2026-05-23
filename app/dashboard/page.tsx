"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { ArrowRight, BarChart3, FileText, Radar, Shield } from "lucide-react";

import { AppNav } from "@/components/app-nav";
import { PageBackground } from "@/components/page-background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthPrompt } from "@/components/auth/auth-prompt-provider";

export default function DashboardPage() {
  const { openAuthPrompt } = useAuthPrompt();
  const { isLoaded, isSignedIn } = useUser();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <PageBackground />
      <AppNav />
      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-6 lg:px-8">
        {isLoaded && isSignedIn ? (
          <>
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <Badge variant="pulse">Private dashboard</Badge>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Your AI Job Radar workspace.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                Start a profile analysis, generate a report, and track career intelligence as the product moves through beta.
              </p>
            </div>
            <UserButton />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "Generate report",
                copy: "Upload a CV and create a profile-driven AI Job Radar report.",
                href: "/demo",
              },
              {
                icon: BarChart3,
                title: "Market intelligence",
                copy: "Review global role, salary, skill, and hiring trend signals.",
                href: "/report",
              },
              {
                icon: Radar,
                title: "Career profile",
                copy: "Your parsed profile and saved job intelligence will live here.",
                href: "/demo",
              },
            ].map(({ icon: Icon, title, copy, href }) => (
              <Card
                key={title}
                className="border-white/10 bg-slate-950/82 shadow-panel transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/25"
              >
                <CardContent className="p-6">
                  <div className="flex size-10 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
                  <Button asChild className="mt-6" variant="accent">
                    <Link href={href}>
                      Open
                      <ArrowRight />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          </>
        ) : null}

        {isLoaded && !isSignedIn ? (
          <Card className="mx-auto max-w-3xl border-white/10 bg-slate-950/82 shadow-panel">
            <CardContent className="p-8 text-center sm:p-10">
              <div className="mx-auto flex size-12 items-center justify-center rounded-md border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                <Shield className="size-6" />
              </div>
              <Badge variant="pulse" className="mt-6">
                Account required
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-white">
                Sign in to access your dashboard.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400">
                The product remains public, but reports and saved career profiles require an account.
              </p>
              <Button size="lg" className="mt-8" onClick={openAuthPrompt}>
                Sign In
                <ArrowRight />
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </main>
  );
}
