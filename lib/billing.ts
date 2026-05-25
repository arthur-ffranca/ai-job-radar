import { getActiveSubscription, getUsage, incrementUsage } from "@/lib/db";

export async function checkAnalysisAccess(params: {
  userId?: string | null;
  anonId?: string | null;
}) {
  const subscription = await getActiveSubscription(params);
  if (subscription?.plan === "pro") {
    return { allowed: true as const, plan: "pro" as const, usage: null };
  }

  const usage = await getUsage(params);
  const analysesUsed = usage?.total_analyses ?? 0;
  const remaining = Math.max(0, 1 - analysesUsed);
  if (analysesUsed >= 1) {
    return {
      allowed: false as const,
      plan: "free" as const,
      analysesUsed,
      remaining,
      reason:
        "Limite do plano Free atingido. Faça upgrade para Pro para análises ilimitadas, PDF e histórico.",
    };
  }

  return {
    allowed: true as const,
    plan: "free" as const,
    analysesUsed,
    remaining,
  };
}

export async function registerAnalysisUsage(params: {
  userId?: string | null;
  anonId?: string | null;
}) {
  await incrementUsage(params);
}

