"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { AffiliateCard } from "./AffiliateCard";
import { RankedProduct, IntentLevel } from "@/lib/affiliates/types";
import {
  isStickyDismissed,
  dismissStickyCta,
  getAbVariant,
  getSessionId,
} from "@/lib/affiliates/session-tracker";

interface StickyAffiliateCtaProps {
  product: RankedProduct;
  intentLevel: IntentLevel;
  totalScore?: number;
  pageContext?: string;
}

const COPY: Record<"CRITICAL" | "NEEDS_WORK", { text: string; cta: string }> = {
  CRITICAL: {
    text: "Your resume is being rejected before anyone reads it.",
    cta: "Fix It Now",
  },
  NEEDS_WORK: {
    text: "You're missing keywords that could get you interviews.",
    cta: "Close the Gap",
  },
};

export const StickyAffiliateCta: React.FC<StickyAffiliateCtaProps> = ({
  product,
  intentLevel,
  totalScore,
  pageContext,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // start as true, set to false after check
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const abVariant = getAbVariant();
  const sessionId = getSessionId();

  // Check if already dismissed this session
  useEffect(() => {
    setIsDismissed(isStickyDismissed());
  }, []);

  // Set up IntersectionObserver to show sticky when recommendations scroll out of view
  useEffect(() => {
    if (!targetRef.current || isDismissed) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // Show sticky when target (AffiliateRecommendations) is NOT visible
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observerRef.current.observe(targetRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isDismissed]);

  const handleDismiss = () => {
    dismissStickyCta();
    setIsDismissed(true);
    setIsVisible(false);
  };

  const copy = COPY[intentLevel as "CRITICAL" | "NEEDS_WORK"];
  if (!copy) return null;

  return (
    <>
      {/* Invisible observer target — attach this ref to AffiliateRecommendations in pages */}
      <div ref={targetRef} className="invisible h-0" aria-hidden="true" />

      {/* Sticky bar */}
      <AnimatePresence>
        {isVisible && !isDismissed && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur border-t border-violet-500/20 px-4 py-3 flex items-center justify-between gap-4"
          >
            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300">{copy.text}</p>
            </div>

            {/* CTA + Dismiss */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  window.open(product.product.url, "_blank", "noopener noreferrer");
                }}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold rounded-lg transition-all"
              >
                {copy.cta}
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
