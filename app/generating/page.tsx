import { AppNav } from "@/components/app-nav";
import { PageBackground } from "@/components/page-background";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, Upload } from "lucide-react";

export default function GeneratingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <PageBackground />
      <AppNav />
      <section className="relative flex min-h-screen items-center px-5 py-28 sm:px-6 lg:px-8">
        <Card className="mx-auto w-full max-w-2xl border-white/10 bg-slate-900/86 text-center shadow-panel backdrop-blur">
          <CardHeader className="items-center p-8">
            <div className="mb-4 flex size-12 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
              <Radar className="size-6" />
            </div>
            <Badge variant="pulse">Gerando relatorio AI Job Radar</Badge>
            <CardTitle className="mt-6 text-3xl leading-tight text-white sm:text-4xl">
              Comece pelo fluxo de upload.
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-slate-400">
              Esta pagina nao gera relatorio apenas por parametros na URL. Envie e processe um CV primeiro para criar um relatorio baseado no perfil real.
            </p>
            <a
              href="/demo"
              className="mx-auto mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
            >
              <Upload className="size-4" />
              Enviar CV
            </a>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
