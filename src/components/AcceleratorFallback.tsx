"use client";

import { useNetwork } from "@/context/NetworkContext";
import { Card } from "./ui/Card";

interface AcceleratorFallbackProps {
  txid: string;
}

export function AcceleratorFallback({ txid }: AcceleratorFallbackProps) {
  const { config, network } = useNetwork();

  return (
    <Card accent="warning" className="space-y-3">
      <h3 className="font-semibold">Accelerator Recommended</h3>
      <p className="text-muted text-sm leading-relaxed">
        Neither RBF nor CPFP are available for this transaction. A mining pool
        accelerator can prioritize it for a fee paid via Lightning.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        {network === "mainnet" && (
          <a
            href={`${config.explorerUrl}/tx/${txid}#accelerate`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium
              bg-bitcoin/15 text-bitcoin border border-bitcoin/30 rounded-lg hover:bg-bitcoin/25 transition-colors"
          >
            Accelerate on mempool.space
          </a>
        )}
        <a
          href={`${config.explorerUrl}/tx/${txid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium
            bg-card-bg border border-card-border rounded-lg hover:border-muted transition-colors"
        >
          View transaction
        </a>
      </div>
    </Card>
  );
}
