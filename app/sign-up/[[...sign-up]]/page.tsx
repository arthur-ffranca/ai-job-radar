"use client";

import { SignUp } from "@clerk/nextjs";

import { AppNav } from "@/components/app-nav";
import { PageBackground } from "@/components/page-background";

const clerkAppearance = {
  variables: {
    colorPrimary: "#38bdf8",
    colorBackground: "#020617",
    colorText: "#f8fafc",
    colorTextSecondary: "#94a3b8",
    colorInputBackground: "rgba(15, 23, 42, 0.84)",
    colorInputText: "#f8fafc",
    borderRadius: "0.5rem",
  },
  elements: {
    cardBox:
      "border border-white/10 bg-slate-950 shadow-[0_24px_80px_rgba(0,0,0,0.55)]",
    card: "bg-slate-950 text-white",
    headerTitle: "text-white",
    headerSubtitle: "text-slate-400",
    socialButtonsBlockButton:
      "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]",
    formButtonPrimary:
      "bg-[linear-gradient(135deg,#38bdf8,#34d399)] text-slate-950 hover:opacity-95",
    footerActionLink: "text-sky-200 hover:text-sky-100",
  },
};

export default function SignUpPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <PageBackground />
      <AppNav />
      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-28 sm:px-6 lg:px-8">
        <SignUp
          appearance={clerkAppearance}
          fallbackRedirectUrl="/dashboard"
          forceRedirectUrl="/dashboard"
          signInFallbackRedirectUrl="/dashboard"
          signInForceRedirectUrl="/dashboard"
        />
      </section>
    </main>
  );
}
