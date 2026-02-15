"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Loader2, ChevronDown } from "lucide-react";

interface TimelineStepProps {
  step: number;
  label: string;
  completed: boolean;
  active: boolean;
  loading?: boolean;
  summary?: string;
  isLast?: boolean;
  children: ReactNode;
}

export function TimelineStep({
  step,
  label,
  completed,
  active,
  loading = false,
  summary,
  isLast = false,
  children,
}: TimelineStepProps) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-expand when active, auto-collapse when completed
  useEffect(() => {
    if (active) setExpanded(true);
    if (completed && !active) setExpanded(false);
  }, [active, completed]);

  const showContent = active || expanded;
  const canToggle = completed && !active;

  return (
    <div className="relative pt-2" data-timeline-step={step} data-timeline-active={active || undefined}>
      {/* Vertical connector line */}
      {!isLast && (
        <div
          className={`absolute left-4 top-0 bottom-0 w-0.5 transition-colors duration-300
            ${completed ? "bg-success/40" : active ? "bg-bitcoin/30" : "bg-card-border"}`}
        />
      )}

      {/* Step header */}
      <button
        onClick={() => canToggle && setExpanded(!expanded)}
        className={`flex items-center gap-3 w-full text-left group
          ${canToggle ? "cursor-pointer" : "cursor-default"}`}
        aria-expanded={showContent}
        aria-label={`Step ${step}: ${label}`}
        disabled={!canToggle}
      >
        {/* Circle indicator */}
        <div
          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300
            ${completed ? "bg-success text-black" : ""}
            ${active ? "bg-bitcoin text-black" : ""}
            ${!completed && !active ? "bg-card-border text-muted" : ""}`}
        >
          {completed ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Check size={16} />
            </motion.span>
          ) : active && loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            step
          )}
        </div>

        {/* Label + summary */}
        <div className="flex-1 min-w-0">
          <span
            className={`text-sm font-semibold block
              ${active ? "text-foreground" : completed ? "text-foreground/80" : "text-muted"}`}
          >
            {label}
          </span>
          {completed && summary && !showContent && (
            <span className="text-xs text-muted block truncate mt-0.5">
              {summary}
            </span>
          )}
        </div>

        {/* Expand/collapse chevron */}
        {canToggle && (
          <ChevronDown
            size={16}
            className={`text-muted transition-transform duration-200
              group-hover:text-foreground
              ${expanded ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {/* Step content */}
      <AnimatePresence initial={false}>
        {showContent && (
          <motion.div
            ref={contentRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-11 pt-4 pb-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
