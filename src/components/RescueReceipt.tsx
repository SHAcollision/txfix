"use client";

import { Card } from "./ui/Card";
import { CopyButton } from "./ui/CopyButton";
import { truncateTxid, formatSats, satsToDollars } from "@/lib/bitcoin/format";
import { useNetwork } from "@/context/NetworkContext";
import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";

interface RescueReceiptProps {
  originalTxid: string;
  replacementTxid: string;
  method: "RBF" | "CPFP";
  feePaidSats: number;
  btcPrice: number;
}

export function RescueReceipt({
  originalTxid,
  replacementTxid,
  method,
  feePaidSats,
  btcPrice,
}: RescueReceiptProps) {
  const { config } = useNetwork();

  const summaryText = [
    `Rescued by TxFix`,
    `Method: ${method}`,
    `Fee paid: ${formatSats(feePaidSats)} (${satsToDollars(feePaidSats, btcPrice)})`,
    `Original: ${originalTxid}`,
    `Replacement: ${replacementTxid}`,
    `https://txfix.click`,
  ].join("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card accent="success" className="space-y-4">
        <div className="text-center space-y-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.2,
            }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/15 text-success mx-auto"
          >
            <ShieldCheck size={24} />
          </motion.div>
          <h3 className="font-bold text-lg">Transaction Rescued</h3>
        </div>

        <div className="space-y-3 text-sm tabular-nums">
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted shrink-0">Method</span>
            <span className="font-mono font-medium">{method}</span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted shrink-0">Fee paid</span>
            <span className="font-mono">
              {formatSats(feePaidSats)}{" "}
              <span className="text-muted">
                ({satsToDollars(feePaidSats, btcPrice)})
              </span>
            </span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted shrink-0">Original TX</span>
            <a
              href={`${config.explorerUrl}/tx/${originalTxid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-bitcoin hover:underline"
            >
              {truncateTxid(originalTxid, 8)}
            </a>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-muted shrink-0">Replacement TX</span>
            <a
              href={`${config.explorerUrl}/tx/${replacementTxid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-bitcoin hover:underline"
            >
              {truncateTxid(replacementTxid, 8)}
            </a>
          </div>
        </div>

        <div className="border-t border-card-border pt-3 flex justify-center">
          <CopyButton text={summaryText} label="Copy summary" />
        </div>
      </Card>
    </motion.div>
  );
}
