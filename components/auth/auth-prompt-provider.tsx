"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Mail, Shield, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type AuthPromptContextValue = {
  isSignedIn: boolean;
  openAuthPrompt: () => void;
  requireAuth: () => boolean;
};

const AuthPromptContext = createContext<AuthPromptContextValue | null>(null);

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

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const clerk = useClerk();
  const { isSignedIn } = useUser();

  const openAuthPrompt = useCallback(() => {
    setIsOpen(true);
  }, []);

  const requireAuth = useCallback(() => {
    if (isSignedIn) {
      return true;
    }

    setIsOpen(true);
    return false;
  }, [isSignedIn]);

  const value = useMemo(
    () => ({
      isSignedIn: Boolean(isSignedIn),
      openAuthPrompt,
      requireAuth,
    }),
    [isSignedIn, openAuthPrompt, requireAuth]
  );

  const openClerkSignIn = useCallback(() => {
    setIsOpen(false);
    clerk.openSignIn({
      appearance: clerkAppearance,
      fallbackRedirectUrl: "/dashboard",
      forceRedirectUrl: "/dashboard",
      signUpFallbackRedirectUrl: "/dashboard",
      signUpForceRedirectUrl: "/dashboard",
      withSignUp: true,
    });
  }, [clerk]);

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/82 px-5 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
              className="relative w-full max-w-md overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(52,211,153,0.12),transparent_38%),rgba(2,6,23,0.96)] p-6 shadow-glow"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 rounded-md border border-white/10 bg-white/[0.035] p-2 text-slate-400 transition hover:text-white"
                aria-label="Close authentication modal"
              >
                <X className="size-4" />
              </button>

              <div className="flex size-11 items-center justify-center rounded-md border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                <Shield className="size-5" />
              </div>

              <p className="mt-5 inline-flex items-center gap-2 rounded-md border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-xs font-medium text-sky-100">
                <Sparkles className="size-3.5" />
                Private beta access
              </p>

              <h2
                id="auth-modal-title"
                className="mt-5 text-2xl font-semibold leading-tight text-white"
              >
                Create your free AI Job Radar account to generate your report.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Save your career profile, generate reports, and return to your dashboard when new market signals appear.
              </p>

              <div className="mt-6 space-y-3">
                <Button
                  type="button"
                  size="lg"
                  className="h-12 w-full"
                  onClick={openClerkSignIn}
                >
                  Continue with Google
                  <ArrowRight />
                </Button>

                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-12 w-full"
                  onClick={openClerkSignIn}
                >
                  <Mail />
                  Continue with email
                </Button>
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                No auto-apply, no spam. AI Job Radar is built for career strategy and private profile intelligence.
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AuthPromptContext.Provider>
  );
}

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext);

  if (!context) {
    throw new Error("useAuthPrompt must be used inside AuthPromptProvider.");
  }

  return context;
}
