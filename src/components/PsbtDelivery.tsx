"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BbqrAnimatedQr } from "./BbqrAnimatedQr";
import { PsbtFileDownload } from "./PsbtFileDownload";
import { PsbtHexDisplay } from "./PsbtHexDisplay";
import { Card } from "./ui/Card";
import { formatSats, formatFeeRate } from "@/lib/bitcoin/format";

interface PsbtDeliveryProps {
  psbtBase64: string;
  psbtHex: string;
  fee: number;
  method: "RBF" | "CPFP";
  targetFeeRate?: number;
  /** If provided, only show these tabs. Defaults to all tabs. */
  visibleTabs?: Tab[];
}

type Tab = "qr" | "file" | "hex";

const TABS: { value: Tab; label: string }[] = [
  { value: "qr", label: "Scan QR" },
  { value: "file", label: "Download" },
  { value: "hex", label: "Raw Hex" },
];

export function PsbtDelivery({
  psbtBase64,
  psbtHex,
  fee,
  method,
  targetFeeRate,
  visibleTabs,
}: PsbtDeliveryProps) {
  const tabs = visibleTabs?.length
    ? TABS.filter((t) => visibleTabs.includes(t.value))
    : TABS;
  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]?.value ?? "qr");

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-semibold">
          {method === "RBF" ? "RBF Replacement" : "CPFP Child"} Transaction
        </h3>
        <p className="text-muted text-sm mt-1 tabular-nums">
          Fee: {formatSats(fee)}
          {targetFeeRate ? ` (${formatFeeRate(targetFeeRate)})` : ""}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface-inset rounded-lg p-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            aria-controls={`panel-${tab.value}`}
            id={`tab-${tab.value}`}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 cursor-pointer
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-bitcoin focus-visible:outline-offset-1
              ${
                activeTab === tab.value
                  ? "bg-card-bg text-foreground shadow-sm border border-card-border/50 border-b-2 border-b-bitcoin"
                  : "text-muted hover:text-foreground"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          id={`panel-${activeTab}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex justify-center"
        >
          {activeTab === "qr" && <BbqrAnimatedQr psbtBase64={psbtBase64} />}
          {activeTab === "file" && (
            <div className="w-full">
              <PsbtFileDownload psbtBase64={psbtBase64} />
            </div>
          )}
          {activeTab === "hex" && (
            <div className="w-full">
              <PsbtHexDisplay psbtHex={psbtHex} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="text-xs text-muted text-center border-t border-card-border pt-3">
        Sign this PSBT in your wallet, then come back to broadcast.
        <br />
        <strong className="text-foreground">TxFix never touches your keys.</strong>
      </p>
    </Card>
  );
}
