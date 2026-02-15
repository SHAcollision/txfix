"use client";

import { motion } from "motion/react";
import type { Verdict, Recommendation } from "@/lib/diagnosis/types";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { formatSats } from "@/lib/bitcoin/format";

interface VerdictCardProps {
  verdict: Verdict;
  onFix: (method: "RBF" | "CPFP") => void;
}

const severityConfig: Record<
  Verdict["severity"],
  { accent: "danger" | "warning" | "success" | "info"; badge: "danger" | "warning" | "success" | "info" }
> = {
  STUCK: { accent: "danger", badge: "danger" },
  SLOW: { accent: "warning", badge: "warning" },
  FINE: { accent: "success", badge: "success" },
  CONFIRMED: { accent: "info", badge: "info" },
};

export function VerdictCard({ verdict, onFix }: VerdictCardProps) {
  const config = severityConfig[verdict.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
    >
      <Card accent={config.accent} className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant={config.badge}>{verdict.severity}</Badge>
          <h2 className="text-xl font-semibold">{verdict.headline}</h2>
        </div>

        <p className="text-muted text-sm leading-relaxed">
          {verdict.explanation}
        </p>

        {verdict.recommendations.length > 0 ? (
          <div className="space-y-2 pt-2">
            {verdict.recommendations.map((rec, index) => (
              <RecommendationRow
                key={rec.method}
                rec={rec}
                onFix={onFix}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="pt-2 border-t border-card-border/30">
            <p className="text-sm text-muted">
              No action needed. Your transaction is being processed normally.
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function RecommendationRow({
  rec,
  onFix,
  index = 0,
}: {
  rec: Recommendation;
  onFix: (method: "RBF" | "CPFP") => void;
  index?: number;
}) {
  const isActionable = rec.method === "RBF" || rec.method === "CPFP";
  const actionLabel = rec.method === "RBF" ? "Bump fee" : rec.method === "CPFP" ? "Speed up" : "Fix it";

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 lg:p-4 rounded-lg
        ${rec.isPrimary ? "bg-card-border/30" : "bg-transparent"}
        ${index > 0 ? "border-t border-card-border/30" : ""}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Badge
          variant={
            rec.method === "WAIT"
              ? "muted"
              : rec.method === "ACCELERATOR"
                ? "warning"
                : "success"
          }
        >
          {rec.label}
        </Badge>
        <div className="text-sm tabular-nums">
          <span className="text-foreground font-medium">
            {rec.costSats > 0 ? formatSats(rec.costSats) : "Free"}
          </span>
          {rec.costUsd !== undefined && rec.costUsd > 0 && (
            <span className="text-muted"> (~${rec.costUsd.toFixed(2)})</span>
          )}
          <span className="text-muted"> &middot; {rec.estimatedTime}</span>
        </div>
      </div>

      {isActionable && (
        <Button
          variant={rec.isPrimary ? "primary" : "secondary"}
          size={rec.isPrimary ? "md" : "sm"}
          onClick={() => onFix(rec.method as "RBF" | "CPFP")}
          className="w-full sm:w-auto"
          data-verdict-action
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
