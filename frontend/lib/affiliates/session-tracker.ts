"use client";

import { AbVariant } from "./types";

const SESSION_KEY = "aff_session";
const CLICKED_KEY = "aff_clicked";
const VARIANT_KEY = "aff_variant";
const IMPRESSIONS_KEY = "aff_impressions";
const STICKY_DISMISSED_KEY = "aff_sticky_dismissed";

// ─── Stable session ID ─────────────────────────────────────────────────────────
// Used for impression deduplication within a browser tab

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// ─── A/B Variant Assignment ────────────────────────────────────────────────────
// 50/50 split, stable per session

export function getAbVariant(): AbVariant {
  if (typeof window === "undefined") return "A";
  let v = sessionStorage.getItem(VARIANT_KEY) as AbVariant | null;
  if (!v) {
    v = Math.random() < 0.5 ? "A" : "B";
    sessionStorage.setItem(VARIANT_KEY, v);
  }
  return v;
}

// ─── Click Recording & Suppression ─────────────────────────────────────────────

export function recordClick(productId: string): void {
  if (typeof window === "undefined") return;
  const clicked = getClickedIds();
  clicked.add(productId);
  sessionStorage.setItem(CLICKED_KEY, JSON.stringify([...clicked]));
}

export function hasClickedAny(): boolean {
  if (typeof window === "undefined") return false;
  return getClickedIds().size > 0;
}

export function hasClicked(productId: string): boolean {
  if (typeof window === "undefined") return false;
  return getClickedIds().has(productId);
}

// ─── Impression Deduplication ──────────────────────────────────────────────────

export function shouldFireImpression(productId: string): boolean {
  if (typeof window === "undefined") return false;
  const seen = getImpressionIds();
  if (seen.has(productId)) return false;
  seen.add(productId);
  sessionStorage.setItem(IMPRESSIONS_KEY, JSON.stringify([...seen]));
  return true;
}

// ─── Sticky CTA Dismissal ──────────────────────────────────────────────────────

export function dismissStickyCta(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STICKY_DISMISSED_KEY, "true");
}

export function isStickyDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STICKY_DISMISSED_KEY) === "true";
}

// ─── Private Helpers ───────────────────────────────────────────────────────────

function getClickedIds(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(CLICKED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function getImpressionIds(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(IMPRESSIONS_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}
