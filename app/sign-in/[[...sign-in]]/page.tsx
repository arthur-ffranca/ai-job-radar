"use client";

import { SignIn } from "@clerk/nextjs";

import { AppNav } from "@/components/app-nav";
import { PageBackground } from "@/components/page-background";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <PageBackground />
      <AppNav />
      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-28 sm:px-6 lg:px-8">
        <SignIn
          appearance={clerkAppearance}
          fallbackRedirectUrl="/dashboard"
          forceRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
          withSignUp
        />
      </section>
    </main>
  );
}
