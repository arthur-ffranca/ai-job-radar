import { AppNav } from "@/components/app-nav";
import { DemoForm } from "@/components/demo/demo-form";
import { PageBackground } from "@/components/page-background";
import { Badge } from "@/components/ui/badge";

export default function DemoPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <PageBackground />
      <AppNav />
      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Badge variant="pulse">Demo funcional</Badge>
          <h1 className="mt-7 text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Analise seu perfil contra o mercado de vagas.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Envie seu CV, defina seus cargos-alvo e visualize um relatorio estrategico de inteligencia de carreira.
          </p>
        </div>
        <DemoForm />
      </section>
    </main>
  );
}
