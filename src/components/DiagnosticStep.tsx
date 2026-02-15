"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";
import { Check, AlertTriangle, X, Circle, Loader2 } from "lucide-react";
import type { CheckResult } from "@/lib/diagnosis/types";

interface DiagnosticStepProps {
  step: CheckResult;
  index?: number;
}

const statusColors: Record<string, string> = {
  pass: "text-success",
  warn: "text-warning",
  fail: "text-danger",
  info: "text-muted",
  running: "text-bitcoin",
};

function iconForStatus(icon: string): ReactNode {
  switch (icon) {
    case "\u2713":
      return <Check size={14} />;
    case "\u26A0":
      return <AlertTriangle size={14} />;
    case "\u2717":
      return <X size={14} />;
    case "\u25CB":
      return <Circle size={14} />;
    case "\u27F3":
      return <Loader2 size={14} className="animate-spin" />;
    default:
      return <Circle size={14} />;
  }
}

export function DiagnosticStep({ step, index = 0 }: DiagnosticStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.15 }}
      className="flex items-start gap-2.5 py-1"
    >
      <span className={`${statusColors[step.status] ?? "text-muted"} leading-5 shrink-0 w-4 flex items-center justify-center mt-0.5`}>
        {iconForStatus(step.icon)}
      </span>
      <span className="text-sm leading-5">
        <span className="text-foreground">{step.label}</span>
        {step.detail && (
          <span className="text-muted"> - {step.detail}</span>
        )}
      </span>
    </motion.div>
  );
}
