import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { AuthPromptProvider } from "@/components/auth/auth-prompt-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Job Radar | Career Intelligence",
  description:
    "AI Job Radar is a premium career intelligence platform for discovering, scoring, and winning high-fit roles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#38bdf8",
              colorBackground: "#020617",
              colorText: "#f8fafc",
              colorTextSecondary: "#94a3b8",
              borderRadius: "0.5rem",
            },
          }}
        >
          <AuthPromptProvider>{children}</AuthPromptProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
