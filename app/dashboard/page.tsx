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
              <Badge variant="pulse">Painel privado</Badge>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Seu workspace AI Job Radar.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                Inicie uma analise de perfil, gere relatorios e acompanhe inteligencia de carreira em um workspace privado.
              </p>
            </div>
            <UserButton />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "Gerar relatorio",
                copy: "Envie um CV e crie um relatorio guiado pelo seu perfil real.",
                href: "/demo",
              },
              {
                icon: BarChart3,
                title: "Inteligencia de mercado",
                copy: "Veja sinais de cargos, salarios, habilidades e tendencias de contratacao.",
                href: "/report",
              },
              {
                icon: Radar,
                title: "Perfil de carreira",
                copy: "Seu perfil extraido e suas analises salvas ficarao aqui.",
                href: "/demo",
              },
            ].map(({ icon: Icon, title, copy, href }) => (
              <Card
                key={title}
                className="border-white/10 bg-slate-900/82 shadow-panel transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/25"
              >
                <CardContent className="p-6">
                  <div className="flex size-10 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
                  <Button asChild className="mt-6" variant="accent">
                    <Link href={href}>
                      Abrir
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
          <Card className="mx-auto max-w-3xl border-white/10 bg-slate-900/82 shadow-panel">
            <CardContent className="p-8 text-center sm:p-10">
              <div className="mx-auto flex size-12 items-center justify-center rounded-md border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                <Shield className="size-6" />
              </div>
              <Badge variant="pulse" className="mt-6">
                Conta obrigatoria
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-white">
                Entre para acessar seu painel.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400">
                O produto continua publico, mas relatorios e perfis salvos exigem uma conta.
              </p>
              <Button size="lg" className="mt-8" onClick={openAuthPrompt}>
                Entrar
                <ArrowRight />
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </main>
  );
}
