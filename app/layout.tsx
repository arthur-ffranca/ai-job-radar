import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";

import { AnalyticsProvider } from "@/components/analytics/posthog-provider";
import { AuthPromptProvider } from "@/components/auth/auth-prompt-provider";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Job Radar | Inteligencia de Carreira",
  description:
    "AI Job Radar e uma plataforma premium de inteligencia de carreira para descobrir, priorizar e conquistar vagas com mais fit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body>
        <ClerkProvider
          localization={ptBR}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          appearance={clerkAppearance}
        >
          <AnalyticsProvider>
            <AuthPromptProvider>{children}</AuthPromptProvider>
          </AnalyticsProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
