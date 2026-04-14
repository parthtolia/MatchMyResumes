"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { ImprovementStep, IntentLevel } from "@/lib/affiliates/types";
import { recordClick } from "@/lib/affiliates/session-tracker";

interface CareerImprovementPathProps {
  steps: ImprovementStep[];
  intentLevel: IntentLevel;
  sessionId: string;
  pageContext?: string;
}

export const CareerImprovementPath: React.FC<CareerImprovementPathProps> = ({
  steps,
  intentLevel,
  sessionId,
  pageContext,
}) => {
  const borderColor =
    intentLevel === "CRITICAL" ? "border-red-500/30" : "border-yellow-500/20";

  const handleProductClick = (productId: string) => {
    recordClick(productId);
  };

  return (
    <div
      className={`glass p-5 rounded-2xl border ${borderColor} space-y-4 mt-4`}
    >
      <h4 className="text-sm font-semibold text-white">Your 3-step path to a stronger application</h4>

      {steps.map((step, idx) => (
        <div key={idx} className="flex gap-3">
          {/* Step number circle */}
          <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1">
            {step.stepNumber}
          </div>

          {/* Step content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{step.action}</p>
            <p className="text-xs text-gray-400 mt-0.5">{step.reason}</p>

            {/* Urgency note */}
            {step.urgencyNote && (
              <div className="flex items-start gap-1 text-xs text-orange-400 mt-2">
                <AlertTriangle size={10} className="flex-shrink-0 mt-0.5" />
                <span>{step.urgencyNote}</span>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {step.product && (
                <a
                  href={step.product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleProductClick(step.product!.id)}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  {step.product.ctaLabel} <ArrowRight size={10} />
                </a>
              )}

              {step.internalCta && (
                <>
                  {step.product && (
                    <span className="text-xs text-gray-600">or</span>
                  )}
                  <Link
                    href={step.internalCta.href}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {step.internalCta.label} <ArrowRight size={10} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
