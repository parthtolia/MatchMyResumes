"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getRecommendations,
  classifyIntent,
} from "@/lib/affiliates/recommendation-engine";
import {
  getAbVariant,
  getSessionId,
  shouldFireImpression,
} from "@/lib/affiliates/session-tracker";
import { RecommendationContext } from "@/lib/affiliates/types";
import { AffiliateCard } from "./AffiliateCard";
import { CareerImprovementPath } from "./CareerImprovementPath";

interface AffiliateRecommendationsProps extends RecommendationContext {
  className?: string;
}

export const AffiliateRecommendations: React.FC<AffiliateRecommendationsProps> = ({
  totalScore,
  missingKeywords,
  skillsDetected,
  cvScores,
  pageContext,
  className,
}) => {
  const abVariant = getAbVariant();
  const sessionId = getSessionId();

  // Get recommendations
  const result = getRecommendations(
    { totalScore, missingKeywords, skillsDetected, cvScores, pageContext },
    abVariant
  );

  // Fire impression events on mount
  useEffect(() => {
    const sharedPayload = {
      eventType: "impression" as const,
      page: pageContext ?? "unknown",
      intentLevel: result.intentLevel,
      userScore: totalScore,
      abVariant,
      sessionId,
    };

    if (result.primary && shouldFireImpression(result.primary.product.id)) {
      fetch("/api/affiliates/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sharedPayload,
          productId: result.primary.product.id,
          position: "primary",
        }),
      }).catch(() => {});
    }

    result.secondary.forEach(secondary => {
      if (shouldFireImpression(secondary.product.id)) {
        fetch("/api/affiliates/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...sharedPayload,
            productId: secondary.product.id,
            position: "secondary",
          }),
        }).catch(() => {});
      }
    });
  }, []);

  // No-recommendation fallback
  if (result.isEmpty) {
    const showFallback =
      pageContext === "cv-analysis" ||
      pageContext === "scan" ||
      pageContext === "marketing-ats" ||
      pageContext === "marketing-jd";

    if (!showFallback) return null;

    return (
      <div className={`glass p-5 rounded-2xl border border-gray-700/40 text-center ${className ?? ""}`}>
        <p className="text-sm text-gray-400">
          Not enough data to suggest personalised resources yet.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Try scanning against a job description for targeted recommendations.
        </p>
        <Link
          href="/dashboard/scan"
          className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-3"
        >
          Run a JD Scan <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-4 ${className ?? ""}`}
    >
      {/* Urgency tag */}
      {result.heading.urgencyTag && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 border border-red-500/30 text-red-400 uppercase tracking-wider mb-2">
          {result.heading.urgencyTag}
        </span>
      )}

      {/* Heading */}
      <div>
        <h3 className="text-base font-semibold text-white">{result.heading.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{result.heading.subtitle}</p>
      </div>

      {/* Progress frame */}
      {result.progressFrame && (
        <div className="text-xs text-emerald-400/80 italic">{result.progressFrame}</div>
      )}

      {/* Primary hook label */}
      {result.primary && (
        <div className="text-[10px] font-semibold text-violet-400 uppercase tracking-widest">
          {result.primaryHook}
        </div>
      )}

      {/* Primary card */}
      {result.primary && (
        <AffiliateCard
          ranked={result.primary}
          variant="primary"
          pageContext={pageContext}
          intentLevel={result.intentLevel}
          totalScore={totalScore}
          abVariant={abVariant}
          sessionId={sessionId}
        />
      )}

      {/* Secondary grid (Variant A only) */}
      {result.abVariant === "A" && result.secondary.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
          {result.secondary.map((secondary, idx) => (
            <motion.div
              key={secondary.product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.07 }}
            >
              <AffiliateCard
                ranked={secondary}
                variant="secondary"
                pageContext={pageContext}
                intentLevel={result.intentLevel}
                totalScore={totalScore}
                abVariant={abVariant}
                sessionId={sessionId}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Improvement path (CRITICAL/NEEDS_WORK only) */}
      {result.improvementSteps.length > 0 && (
        <CareerImprovementPath
          steps={result.improvementSteps}
          intentLevel={result.intentLevel}
          sessionId={sessionId}
          pageContext={pageContext}
        />
      )}
    </motion.div>
  );
};
