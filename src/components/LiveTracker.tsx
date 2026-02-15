"use client";

import { useLiveTracker } from "@/hooks/useLiveTracker";
import { useNetwork } from "@/context/NetworkContext";
import { Card } from "./ui/Card";
import { Spinner } from "./ui/Spinner";
import { truncateTxid } from "@/lib/bitcoin/format";
import { motion } from "motion/react";
import { Check, ExternalLink } from "lucide-react";

interface LiveTrackerProps {
  txid: string;
  originalTxid: string;
  onConfirmed: () => void;
}

const STEPS = [
  { key: "broadcast", label: "Broadcast" },
  { key: "mempool", label: "In mempool" },
  { key: "confirmed", label: "Confirmed" },
] as const;

function getActiveIndex(status: string): number {
  if (status === "confirmed") return 2;
  if (status === "in-mempool") return 1;
  return 0;
}

export function LiveTracker({
  txid,
  originalTxid,
  onConfirmed,
}: LiveTrackerProps) {
  const { config } = useNetwork();
  const { status, blockHeight } = useLiveTracker(txid, onConfirmed);
  const activeIndex = getActiveIndex(status);
  const isConfirmed = status === "confirmed";

  return (
    <Card
      accent={isConfirmed ? "success" : "bitcoin"}
      className="space-y-5"
    >
      <div>
        <h3 className="font-semibold">
          {isConfirmed ? "Transaction Confirmed" : "Tracking Transaction"}
        </h3>
        <p className="text-muted text-sm mt-1 font-mono">
          {truncateTxid(txid, 12)}
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-0" role="progressbar" aria-valuemin={0} aria-valuenow={activeIndex} aria-valuemax={2} aria-label="Transaction confirmation progress">
        {STEPS.map((step, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          const isPending = i > activeIndex;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${isDone ? "bg-success text-black" : ""}
                    ${isActive && !isConfirmed ? "bg-bitcoin text-black" : ""}
                    ${isActive && isConfirmed ? "bg-success text-black" : ""}
                    ${isPending ? "bg-card-border text-muted" : ""}`}
                >
                  {isDone ? (
                    <Check size={16} />
                  ) : isActive && !isConfirmed ? (
                    <Spinner size="sm" />
                  ) : isActive && isConfirmed ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Check size={16} />
                    </motion.span>
                  ) : (
                    <span className="text-xs">{i + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap
                    ${isDone || isActive ? "text-foreground" : "text-muted"}`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-2 mb-6">
                  <div
                    className={`h-0.5 w-full transition-colors ${
                      i < activeIndex ? "bg-success" : "bg-card-border"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status details */}
      {isConfirmed && blockHeight && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-success text-sm text-center"
        >
          Confirmed in block <span className="tabular-nums">{blockHeight.toLocaleString()}</span>
        </motion.p>
      )}

      {!isConfirmed && (
        <div className="text-center space-y-1">
          <p className="text-muted text-xs">
            Checking every 10 seconds...
          </p>
          <p className="text-muted/50 text-xs">
            You can close this tab - your transaction will confirm either way.
          </p>
        </div>
      )}

      {/* Explorer link */}
      <div className="border-t border-card-border pt-3 flex flex-col gap-2">
        <a
          href={`${config.explorerUrl}/tx/${txid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 text-bitcoin text-sm hover:underline"
        >
          View replacement on mempool.space
          <ExternalLink size={14} />
        </a>
        <a
          href={`${config.explorerUrl}/tx/${originalTxid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted text-xs hover:underline text-center"
        >
          View original transaction
        </a>
      </div>
    </Card>
  );
}
