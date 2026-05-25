"use client";

const ANON_KEY = "ajr_anon_id";

export function getOrCreateAnonId() {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(ANON_KEY);
  if (existing) return existing;
  const anonId = crypto.randomUUID();
  window.localStorage.setItem(ANON_KEY, anonId);
  return anonId;
}

