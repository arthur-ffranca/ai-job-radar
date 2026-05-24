"use client";

import Link from "next/link";
import { ChevronRight, Radar } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AppNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-900/72 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-white">
          <span className="flex size-8 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
            <Radar className="size-4" />
          </span>
          AI Job Radar
        </Link>
        <div className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
          <Link className="transition hover:text-white" href="/#product">
            Produto
          </Link>
          <Link className="transition hover:text-white" href="/#workflow">
            Fluxo
          </Link>
          <Link className="transition hover:text-white" href="/#features">
            Recursos
          </Link>
          <Link className="transition hover:text-white" href="/#insights">
            Inteligencia
          </Link>
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
  );
}
