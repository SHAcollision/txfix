"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useUrlState } from "@/hooks/useUrlState";
import { useDiagnosis } from "@/hooks/useDiagnosis";
import { TxInput } from "@/components/TxInput";
import { DiagnosticSequence } from "@/components/DiagnosticSequence";
import { VerdictCard } from "@/components/VerdictCard";
import { AcceleratorFallback } from "@/components/AcceleratorFallback";
import { WalletSelector } from "@/components/WalletSelector";
import { WalletGuide } from "@/components/WalletGuide";
import { LiveTracker } from "@/components/LiveTracker";
import { RescueReceipt } from "@/components/RescueReceipt";
import { Button } from "@/components/ui/Button";
import { TxFixError } from "@/lib/errors";
import { truncateTxid } from "@/lib/bitcoin/format";
import { getWalletById } from "@/lib/wallets/data";
import { resolveGuide } from "@/lib/wallets/resolveGuide";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";

type FixMethod = "RBF" | "CPFP";

function FlowBreadcrumbs({
  txid,
  fixMethod,
  selectedWalletId,
  broadcastedTxid,
}: {
  txid: string | null;
  fixMethod: FixMethod | null;
  selectedWalletId: string | null;
  broadcastedTxid: string | null;
}) {
  const steps = [
    { label: "Diagnose", active: !!txid },
    { label: "Fix", active: !!fixMethod },
    { label: "Guide", active: !!selectedWalletId },
    { label: "Track", active: !!broadcastedTxid },
  ];

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted">
      {steps.map((step, i) => (
        <span key={step.label} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-card-border">/</span>}
          <span className={step.active ? "text-bitcoin font-semibold" : ""}>
            {step.label}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  const { txid, method: fixMethod, walletId: selectedWalletId, setTxid, setMethod, setWallet, setMethodAndWallet } = useUrlState();
  const diagnosis = useDiagnosis(txid);

  // Ephemeral state (not shareable via URL)
  const [broadcastedTxid, setBroadcastedTxid] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Derive resolved guide from URL params + diagnosis data
  const resolvedGuide = useMemo(() => {
    if (!selectedWalletId || !fixMethod || !diagnosis.verdict) return null;
    const wallet = getWalletById(selectedWalletId);
    if (!wallet) return null;
    return resolveGuide(wallet, fixMethod, diagnosis.verdict);
  }, [selectedWalletId, fixMethod, diagnosis.verdict]);

  // Safety net: clear invalid deep-linked wallet/method combos
  useEffect(() => {
    if (
      diagnosis.phase === "complete" &&
      fixMethod &&
      selectedWalletId &&
      !resolvedGuide
    ) {
      // Invalid wallet ID or broken state - fall back to verdict
      setMethod(null);
    }
  }, [diagnosis.phase, fixMethod, selectedWalletId, resolvedGuide, setMethod]);

  const handleSubmit = useCallback(
    (newTxid: string) => {
      setBroadcastedTxid(null);
      setConfirmed(false);
      setTxid(newTxid);
    },
    [setTxid],
  );

  const handleFix = useCallback(
    (method: FixMethod) => {
      setMethod(method);
    },
    [setMethod],
  );

  const handleWalletSelect = useCallback(
    (walletId: string) => {
      setWallet(walletId);
    },
    [setWallet],
  );

  const handleChangeWallet = useCallback(() => {
    setWallet(null);
  }, [setWallet]);

  const handleCancelFix = useCallback(() => {
    setMethod(null);
  }, [setMethod]);

  const handleSwitchMethod = useCallback(
    (method: FixMethod) => {
      if (selectedWalletId) {
        // Keep same wallet, just switch method (single URL push)
        setMethodAndWallet(method, selectedWalletId);
      } else {
        setMethod(method);
      }
    },
    [setMethod, setMethodAndWallet, selectedWalletId],
  );

  const handleBroadcasted = useCallback((newTxid: string) => {
    setBroadcastedTxid(newTxid);
  }, []);

  const handleConfirmed = useCallback(() => {
    setConfirmed(true);
  }, []);

  const handleReset = useCallback(() => {
    setBroadcastedTxid(null);
    setConfirmed(false);
    setTxid(null);
    diagnosis.reset();
  }, [setTxid, diagnosis]);

  // Global keyboard navigation (Backspace / Escape to go back)
  const isTrackerOrReceipt = broadcastedTxid !== null || confirmed;
  useKeyboardNav({
    txid,
    method: fixMethod,
    walletId: selectedWalletId,
    onReset: handleReset,
    onClearMethod: handleCancelFix,
    onClearWallet: handleChangeWallet,
    disabled: isTrackerOrReceipt,
  });

  // Auto-focus on view transitions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedWalletId && fixMethod) {
        const guideBtn = document.querySelector<HTMLElement>("[data-guide-action]");
        guideBtn?.focus();
      } else if (fixMethod && !selectedWalletId) {
        const search = document.querySelector<HTMLElement>("[data-wallet-search]");
        search?.focus();
      } else if (
        diagnosis.phase === "complete" &&
        diagnosis.verdict !== null &&
        !fixMethod
      ) {
        const verdictBtn = document.querySelector<HTMLElement>("[data-verdict-action]");
        verdictBtn?.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedWalletId, fixMethod, diagnosis.phase, diagnosis.verdict]);

  const isLoading =
    diagnosis.phase === "fetching" || diagnosis.phase === "diagnosing";
  const showHero = !txid;
  const showDiagnosis = !!txid && diagnosis.steps.length > 0;
  const showVerdict =
    diagnosis.phase === "complete" &&
    diagnosis.verdict !== null &&
    !fixMethod &&
    !broadcastedTxid;
  const showWalletSelect =
    fixMethod !== null &&
    selectedWalletId === null &&
    !broadcastedTxid;
  const showWalletGuide =
    fixMethod !== null &&
    resolvedGuide !== null &&
    !broadcastedTxid;
  const showTracker = broadcastedTxid !== null && !confirmed;
  const showReceipt = confirmed && broadcastedTxid !== null;
  const showError = diagnosis.phase === "error";

  // Derive current phase key for page transitions
  const currentPhase = showHero
    ? "hero"
    : showReceipt
      ? "receipt"
      : showTracker
        ? "tracker"
        : showWalletGuide
          ? "guide"
          : showWalletSelect
            ? "wallet-select"
            : showVerdict
              ? "verdict"
              : showError
                ? "error"
                : "diagnosis";

  return (
    <div
      className={`flex-1 flex flex-col ${showHero ? "items-center justify-center" : ""} px-4 py-6`}
    >
      <AnimatePresence mode="wait">
        {showHero ? (
          /* -- Hero --------------------------------------------------------- */
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center gap-8 text-center w-full"
          >
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                Transaction stuck?{" "}
                <span className="bg-gradient-to-r from-bitcoin to-[#fbb040] bg-clip-text text-transparent">Fix it.</span>
              </h1>
              <p className="text-muted text-lg max-w-md mx-auto">
                Free diagnosis. 3 clicks to unstick. No keys required.
              </p>
            </div>
            <TxInput onSubmit={handleSubmit} isLoading={isLoading} />
            <p className="inline-flex items-center gap-1.5 text-muted/40 text-xs">
              <ShieldCheck size={14} className="text-success/50" />
              Your keys never leave your device
            </p>
          </motion.div>
        ) : (
          /* -- Diagnosis Flow ----------------------------------------------- */
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto space-y-6 pt-2 sm:pt-4 pb-8"
          >
            {/* TXID header with back button and breadcrumbs */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="text-muted hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Go back to home"
                >
                  <ArrowLeft size={18} />
                </button>
                {txid && (
                  <p className="text-muted text-sm font-mono truncate flex-1">
                    {truncateTxid(txid, 16)}
                  </p>
                )}
              </div>
              <FlowBreadcrumbs
                txid={txid}
                fixMethod={fixMethod}
                selectedWalletId={selectedWalletId}
                broadcastedTxid={broadcastedTxid}
              />
            </div>

            {/* Diagnostic steps - hide once verdict is ready */}
            {showDiagnosis &&
              !showVerdict &&
              !showWalletSelect &&
              !showWalletGuide &&
              !showTracker &&
              !showReceipt && (
                <DiagnosticSequence
                  steps={diagnosis.steps}
                  isRunning={isLoading}
                />
              )}

            {/* Verdict */}
            {showVerdict && diagnosis.verdict && (
              <div className="space-y-3">
                <VerdictCard verdict={diagnosis.verdict} onFix={handleFix} />
                {diagnosis.verdict.showAcceleratorFallback && txid && (
                  <AcceleratorFallback txid={txid} />
                )}
              </div>
            )}

            {/* Wallet Selection */}
            {showWalletSelect && (
              <WalletSelector
                onSelect={handleWalletSelect}
                onCancel={handleCancelFix}
              />
            )}

            {/* Wallet Guide */}
            {showWalletGuide &&
              resolvedGuide &&
              fixMethod &&
              diagnosis.txData &&
              diagnosis.rawTxHex &&
              diagnosis.verdict &&
              txid && (
                <WalletGuide
                  guide={resolvedGuide}
                  verdict={diagnosis.verdict}
                  txData={diagnosis.txData}
                  txHex={diagnosis.rawTxHex}
                  cpfpCandidates={diagnosis.cpfpCandidates}
                  txid={txid}
                  onBroadcasted={handleBroadcasted}
                  onCancel={handleCancelFix}
                  onChangeWallet={handleChangeWallet}
                  onSwitchMethod={handleSwitchMethod}
                />
              )}

            {/* Live Tracker */}
            {showTracker && broadcastedTxid && txid && (
              <LiveTracker
                txid={broadcastedTxid}
                originalTxid={txid}
                onConfirmed={handleConfirmed}
              />
            )}

            {/* Rescue Receipt */}
            {showReceipt &&
              broadcastedTxid &&
              txid &&
              diagnosis.verdict &&
              fixMethod && (
                <RescueReceipt
                  originalTxid={txid}
                  replacementTxid={broadcastedTxid}
                  method={fixMethod}
                  feePaidSats={
                    diagnosis.verdict.recommendations.find(
                      (r) => r.method === fixMethod,
                    )?.costSats ?? 0
                  }
                  btcPrice={diagnosis.btcPrice}
                />
              )}

            {/* Error */}
            {showError && diagnosis.error && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 space-y-3">
                <p className="text-danger font-medium text-sm">
                  {diagnosis.error instanceof TxFixError
                    ? diagnosis.error.userMessage
                    : "Something went wrong. Please try again."}
                </p>
                <Button variant="secondary" size="sm" onClick={handleReset}>
                  Try again
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
