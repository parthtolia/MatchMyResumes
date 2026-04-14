"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { RankedProduct, IntentLevel, AbVariant } from "@/lib/affiliates/types";
import { recordClick, hasClicked } from "@/lib/affiliates/session-tracker";

interface AffiliateCardProps {
  ranked: RankedProduct;
  variant: "primary" | "secondary" | "sticky";
  pageContext?: string;
  intentLevel?: IntentLevel;
  totalScore?: number;
  abVariant?: AbVariant;
  sessionId: string;
}

export const AffiliateCard: React.FC<AffiliateCardProps> = ({
  ranked,
  variant,
  pageContext,
  intentLevel,
  totalScore,
  abVariant,
  sessionId,
}) => {
  const { product, reason } = ranked;
  const alreadyClicked = hasClicked(product.id);

  const handleClick = () => {
    // Open link synchronously — before any async work
    window.open(product.url, "_blank", "noopener noreferrer");

    // Record click in session
    recordClick(product.id);

    // Fire tracking async (fire-and-forget)
    fetch("/api/affiliates/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "click",
        productId: product.id,
        page: pageContext ?? "unknown",
        position: variant,
        intentLevel,
        userScore: totalScore,
        abVariant,
        sessionId,
      }),
    }).catch(() => {
      // Silently swallow tracking errors
    });
  };

  if (variant === "primary") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`glass p-6 rounded-2xl border border-violet-500/20 hover:border-violet-500/40 transition-all shadow-[0_0_20px_rgba(139,92,246,0.15)] flex flex-col gap-3 ${
          alreadyClicked ? "opacity-50" : ""
        }`}
      >
        {/* Top row: Sponsored label + badge */}
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
            Sponsored Resource
          </span>
          {product.badge && (
            <span className="text-[10px] font-semibold bg-violet-500/15 border border-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {product.badge}
            </span>
          )}
        </div>

        {/* Hook label */}
        <div className="text-[10px] font-semibold text-violet-400 uppercase tracking-widest">
          {product.hookLabel || "Recommended for you"}
        </div>

        {/* Product name */}
        <h3 className="text-base font-bold text-white leading-snug">{product.name}</h3>

        {/* Reason pill */}
        {reason && (
          <div className="bg-violet-500/10 text-violet-300 text-xs px-3 py-1 rounded-full italic border border-violet-500/20">
            {reason}
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-300 line-clamp-2">{product.description}</p>

        {/* Trust signal */}
        {product.trustSignal && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <CheckCircle size={10} className="text-emerald-500" />
            {product.trustSignal}
          </div>
        )}

        {/* CTA button */}
        {alreadyClicked ? (
          <div className="py-3 px-4 rounded-xl bg-gray-700/30 text-gray-400 text-sm font-semibold text-center">
            ✓ Already opened
          </div>
        ) : (
          <button
            onClick={handleClick}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold transition-all flex items-center justify-center gap-2"
          >
            {product.ctaLabel}
            <ArrowRight size={16} />
          </button>
        )}
      </motion.div>
    );
  }

  if (variant === "secondary") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={`glass px-4 py-3 rounded-xl flex items-center gap-3 border border-transparent hover:border-violet-500/20 transition-all ${
          alreadyClicked ? "opacity-50" : ""
        }`}
      >
        {product.badge && (
          <span className="text-[9px] font-semibold bg-violet-500/15 border border-violet-500/30 text-violet-300 px-1.5 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
            {product.badge}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-white truncate">{product.name}</div>
          <div className="text-xs text-gray-500 line-clamp-1">{product.description}</div>
        </div>
        {alreadyClicked ? (
          <span className="text-xs text-gray-600 flex-shrink-0">✓ Opened</span>
        ) : (
          <button
            onClick={handleClick}
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 flex-shrink-0"
          >
            {product.ctaLabel} <ArrowRight size={12} />
          </button>
        )}
      </motion.div>
    );
  }

  if (variant === "sticky") {
    return (
      <motion.button
        onClick={handleClick}
        className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
      >
        {product.ctaLabel}
        <ArrowRight size={14} />
      </motion.button>
    );
  }

  return null;
};
