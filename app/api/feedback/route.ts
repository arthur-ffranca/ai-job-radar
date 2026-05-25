import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { createReportFeedback } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanNullableText(value: unknown, maxLength: number) {
  const text = cleanText(value, maxLength);
  return text || null;
}

function cleanRating(value: unknown) {
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

function cleanScore(value: unknown) {
  const score = Number(value);
  return Number.isInteger(score) && score >= 0 && score <= 100 ? score : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const rating = cleanRating(body.rating);
    const comment = cleanText(body.comment, 2000);
    const useCase = cleanText(body.useCase, 500);

    if (!rating && !comment) {
      return jsonResponse({ error: "Envie uma nota ou comentario." }, 400);
    }

    const { userId } = await auth();
    const feedback = await createReportFeedback({
      userId: userId || null,
      anonId: cleanNullableText(body.anonId, 120),
      analysisId: cleanNullableText(body.analysisId, 120),
      targetRole: cleanNullableText(body.targetRole, 180),
      matchScore: cleanScore(body.matchScore),
      rating,
      comment,
      useCase,
    });

    return jsonResponse({ ok: true, id: feedback.id });
  } catch (error) {
    console.error("[AI Job Radar] feedback failed", error);
    return jsonResponse(
      { error: "Nao foi possivel registrar o feedback agora. Tente novamente em instantes." },
      500
    );
  }
}
