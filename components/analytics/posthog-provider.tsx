"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

type Props = {
  children: React.ReactNode;
};

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

function PostHogIdentitySync() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (!posthogKey) {
      return;
    }

    if (isSignedIn && user?.id) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || "",
      });
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    if (!posthogKey) {
      return;
    }

    const query = searchParams.toString();
    const currentUrl = query ? `${pathname}?${query}` : pathname;
    posthog.capture("$pageview", { $current_url: currentUrl });
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider({ children }: Props) {
  useEffect(() => {
    if (!posthogKey) {
      return;
    }

    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
    });
  }, []);

  if (!posthogKey) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider client={posthog}>
      <PostHogIdentitySync />
      {children}
    </PostHogProvider>
  );
}

