"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { AppNav } from "@/components/app-nav";
import { PageBackground } from "@/components/page-background";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateAnonId } from "@/lib/client-id";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  async function upgradeToPro() {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: "pro", anon_id: getOrCreateAnonId() }),
      });
      const data = await response.json();
      if (!response.ok || !data.checkout_url) {
        throw new Error(data.error || "Não foi possível iniciar checkout.");
      }
      window.location.href = data.checkout_url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao iniciar checkout.");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <PageBackground />
      <AppNav />
      <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Escolha seu plano
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Comece grátis com 1 análise. Faça upgrade para Pro e libere análises ilimitadas, PDF e histórico completo.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-white/10 bg-slate-900/82">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Free</CardTitle>
              <p className="text-slate-400">R$ 0 / mês</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p className="flex items-center gap-2"><Check className="size-4 text-emerald-200" /> 1 análise gratuita</p>
              <p className="flex items-center gap-2"><Check className="size-4 text-emerald-200" /> Sem PDF</p>
              <p className="flex items-center gap-2"><Check className="size-4 text-emerald-200" /> Sem histórico</p>
              <Button variant="outline" className="mt-4 w-full" asChild>
                <a href="/demo">Começar grátis</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-sky-300/30 bg-sky-300/10 shadow-glow">
            <CardHeader>
              <div className="mb-2 inline-flex w-fit rounded-md border border-sky-300/25 bg-sky-300/10 px-2 py-1 text-xs text-sky-100">
                Mais escolhido
              </div>
              <CardTitle className="text-2xl text-white">Pro</CardTitle>
              <p className="text-slate-300">R$ 29 / mês</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              <p className="flex items-center gap-2"><Check className="size-4 text-emerald-200" /> Análises ilimitadas</p>
              <p className="flex items-center gap-2"><Check className="size-4 text-emerald-200" /> Download em PDF</p>
              <p className="flex items-center gap-2"><Check className="size-4 text-emerald-200" /> CV adaptado</p>
              <p className="flex items-center gap-2"><Check className="size-4 text-emerald-200" /> Histórico completo</p>
              <Button className="mt-4 w-full" onClick={upgradeToPro} disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

