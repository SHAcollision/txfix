"use client";

import type { CheckResult } from "@/lib/diagnosis/types";
import { DiagnosticStep } from "./DiagnosticStep";
import { Spinner } from "./ui/Spinner";

interface DiagnosticSequenceProps {
  steps: CheckResult[];
  isRunning: boolean;
}

export function DiagnosticSequence({ steps, isRunning }: DiagnosticSequenceProps) {
  return (
    <div className="bg-surface-inset border border-card-border rounded-xl p-4 sm:p-5 font-mono">
      <div className="space-y-0.5" aria-live="polite">
        {steps.map((step, i) => (
          <DiagnosticStep key={step.id} step={step} index={i} />
        ))}
      </div>
      {isRunning && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-card-border">
          <Spinner size="sm" />
          <span className="text-muted text-xs">Running diagnostics...</span>
        </div>
      )}
    </div>
  );
}
