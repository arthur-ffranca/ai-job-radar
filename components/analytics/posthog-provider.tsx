"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

import { trackEvent } from "@/lib/telemetry";

type Props = {
  children: React.ReactNode;
};

type RuntimeConfig = {
  posthogKey: string;
  posthogHost: string;
};

function PostHogIdentitySync({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (isSignedIn && user?.id) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || "",
      });
    }
  }, [enabled, isSignedIn, user]);

  useEffect(() => {
    if (enabled) {
      posthog.capture("$pageview", { $current_url: pathname });
    }

    trackEvent("page_viewed", { path: pathname });
  }, [enabled, pathname]);

  return null;
}

export function AnalyticsProvider({ children }: Props) {
  const [config, setConfig] = useState<RuntimeConfig | null>(null);
  const enabled = Boolean(config?.posthogKey);

  useEffect(() => {
    let mounted = true;

    async function loadConfig() {
      try {
        const response = await fetch("/api/public-config", { cache: "no-store" });
        const data = (await response.json()) as RuntimeConfig;
        if (mounted) {
          setConfig(data);
        }
      } catch {
        if (mounted) {
          setConfig({
            posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || "",
            posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
          });
        }
      }
    }

    void loadConfig();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !config?.posthogKey) {
      return;
    }

    posthog.init(config.posthogKey, {
      api_host: config.posthogHost || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
    });
  }, [config, enabled]);

  if (!enabled) {
    return (
      <>
        <PostHogIdentitySync enabled={false} />
        {children}
      </>
    );
  }

  return (
    <PostHogProvider client={posthog}>
      <PostHogIdentitySync enabled />
      {children}
    </PostHogProvider>
  );
}
