"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useNetwork } from "@/context/NetworkContext";
import { usePsbtBuilder } from "@/hooks/usePsbtBuilder";
import type { MempoolTransaction } from "@/lib/api/types";
import type { CpfpCandidate, Verdict } from "@/lib/diagnosis/types";
import { PsbtDelivery } from "./PsbtDelivery";
import { CpfpAddressInput } from "./CpfpAddressInput";
import { Spinner } from "./ui/Spinner";
import { Card } from "./ui/Card";
import { TxFixError } from "@/lib/errors";

interface FixFlowProps {
  method: "RBF" | "CPFP";
  txData: MempoolTransaction;
  txHex: string;
  verdict: Verdict;
  cpfpCandidates: CpfpCandidate[];
  onBroadcastReady: (signedTxHex?: string) => void;
  onCancel: () => void;
  /** Filter which PSBT delivery tabs to show */
  visibleTabs?: ("qr" | "file" | "hex")[];
  /** Hide the "Back to diagnosis" link (when parent already has one) */
  hideBackLink?: boolean;
}

export function FixFlow({
  method,
  txData,
  txHex,
  verdict,
  cpfpCandidates,
  onCancel,
  visibleTabs,
  hideBackLink = false,
}: FixFlowProps) {
  const { network } = useNetwork();
  const psbtBuilder = usePsbtBuilder();
  const [needsCpfpAddress, setNeedsCpfpAddress] = useState(
    method === "CPFP",
  );

  const buildRbf = useCallback(async () => {
    await psbtBuilder.buildRbf({
      originalTx: txData,
      originalTxHex: txHex,
      targetFeeRate: verdict.targetFeeRate,
      network,
    });
  }, [psbtBuilder, txData, txHex, verdict.targetFeeRate, network]);

  const buildCpfp = useCallback(
    async (address: string) => {
      if (cpfpCandidates.length === 0) return;
      await psbtBuilder.buildCpfp({
        parentTx: txData,
        candidate: cpfpCandidates[0],
        targetFeeRate: verdict.targetFeeRate,
        destinationAddress: address,
        network,
      });
      setNeedsCpfpAddress(false);
    },
    [psbtBuilder, txData, cpfpCandidates, verdict.targetFeeRate, network],
  );

  // Auto-trigger RBF build
  const rbfTriggered = useRef(false);
  useEffect(() => {
    if (method === "RBF" && !rbfTriggered.current && !psbtBuilder.psbt && !psbtBuilder.isBuilding && !psbtBuilder.error) {
      rbfTriggered.current = true;
      buildRbf();
    }
  }, [method, psbtBuilder.psbt, psbtBuilder.isBuilding, psbtBuilder.error, buildRbf]);

  // CPFP: show address input first
  if (method === "CPFP" && needsCpfpAddress) {
    const defaultAddress = cpfpCandidates[0]?.address ?? "";
    return (
      <CpfpAddressInput
        defaultAddress={defaultAddress}
        onConfirm={buildCpfp}
        onCancel={onCancel}
      />
    );
  }

  // Building
  if (psbtBuilder.isBuilding) {
    return (
      <Card className="flex items-center justify-center gap-3 py-8">
        <Spinner />
        <span className="text-muted text-sm">
          Building {method} transaction...
        </span>
      </Card>
    );
  }

  // Error
  if (psbtBuilder.error) {
    return (
      <Card accent="danger" className="space-y-3">
        <p className="text-danger text-sm font-medium">
          {psbtBuilder.error instanceof TxFixError
            ? psbtBuilder.error.userMessage
            : psbtBuilder.error.message}
        </p>
        {!hideBackLink && (
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-muted text-sm hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to diagnosis
          </button>
        )}
      </Card>
    );
  }

  // PSBT ready
  if (psbtBuilder.psbt) {
    return (
      <div className="space-y-3">
        <PsbtDelivery
          psbtBase64={psbtBuilder.psbt.psbtBase64}
          psbtHex={psbtBuilder.psbt.psbtHex}
          fee={psbtBuilder.psbt.fee}
          method={method}
          targetFeeRate={verdict.targetFeeRate}
          visibleTabs={visibleTabs}
        />
        {!hideBackLink && (
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-muted text-sm hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to diagnosis
          </button>
        )}
      </div>
    );
  }

  return null;
}
