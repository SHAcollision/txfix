"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
import { TimelineStep } from "@/components/TimelineStep";
import { Button } from "@/components/ui/Button";
import { TxFixError } from "@/lib/errors";
import { truncateTxid } from "@/lib/bitcoin/format";
import { getWalletById } from "@/lib/wallets/data";
import { resolveGuide } from "@/lib/wallets/resolveGuide";
import { SponsorCta } from "@/components/SponsorCta";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useDevMode } from "@/hooks/useDevMode";
import { DevPanel } from "@/components/DevPanel";

type FixMethod = "RBF" | "CPFP";

export default function Home() {
  const { txid, method: fixMethod, walletId: selectedWalletId, setTxid, setMethod, setWallet, setMethodAndWallet } = useUrlState();
  const realDiagnosis = useDiagnosis(txid);
  const devMode = useDevMode();

  // Dev mode overrides real diagnosis when a scenario is active
  const diagnosis = devMode.mockDiagnosis ?? realDiagnosis;

  // Ephemeral state (not shareable via URL)
  const [broadcastedTxid, setBroadcastedTxid] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

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
        setMethodAndWallet(method, selectedWalletId);
      } else {
        setMethod(method);
      }
    },
    [setMethod, setMethodAndWallet, selectedWalletId],
  );

  const handleDevActivate = useCallback(
    (scenarioId: string) => {
      devMode.activate(scenarioId);
      const scenario = devMode.scenarios.find((s) => s.id === scenarioId);
      if (scenario) {
        setBroadcastedTxid(null);
        setConfirmed(false);
        setTxid(scenario.txid);
      }
    },
    [devMode, setTxid],
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
    realDiagnosis.reset();
    devMode.deactivate();
  }, [setTxid, realDiagnosis, devMode]);

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
  const showError = diagnosis.phase === "error";

  // Timeline state: "reached" = this step has been activated at some point
  const reachedDiagnosis = !!txid;
  const reachedVerdict = diagnosis.phase === "complete" && diagnosis.verdict !== null;
  const reachedWalletSelect = !!fixMethod;
  const reachedGuide = !!selectedWalletId && resolvedGuide !== null;
  const reachedTracker = !!broadcastedTxid;

  // "active" = this is the step the user is currently on
  const activeDiagnosis = reachedDiagnosis && !reachedVerdict && !showError;
  const activeVerdict = reachedVerdict && !reachedWalletSelect && !broadcastedTxid;
  const activeWalletSelect = reachedWalletSelect && !reachedGuide && !broadcastedTxid;
  const activeGuide = reachedGuide && !reachedTracker;
  const activeTracker = reachedTracker;

  // Summary text for collapsed steps
  const diagnosisSummary = diagnosis.steps.length > 0
    ? `${diagnosis.steps.length} ${diagnosis.steps.length === 1 ? "check" : "checks"} completed`
    : undefined;

  const verdictSummary = diagnosis.verdict
    ? `${diagnosis.verdict.severity} - ${diagnosis.verdict.headline}`
    : undefined;

  const walletName = selectedWalletId ? getWalletById(selectedWalletId)?.name : null;
  const walletSelectSummary = walletName
    ? `${walletName} - ${fixMethod}`
    : fixMethod
      ? `${fixMethod} selected`
      : undefined;

  const guideSummary = resolvedGuide
    ? `${resolvedGuide.steps.length} steps - ${resolvedGuide.method}`
    : undefined;

  // Auto-scroll to active step when it changes
  const prevPhaseRef = useRef<string | null>(null);
  const currentActivePhase = activeTracker ? "tracker" : activeGuide ? "guide" : activeWalletSelect ? "wallet" : activeVerdict ? "verdict" : activeDiagnosis ? "diagnosis" : null;

  useEffect(() => {
    if (currentActivePhase && currentActivePhase !== prevPhaseRef.current) {
      prevPhaseRef.current = currentActivePhase;
      // Small delay to let the DOM render the new step
      const timer = setTimeout(() => {
        const activeEl = document.querySelector("[data-timeline-active]");
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentActivePhase]);

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
            <SponsorCta />
          </motion.div>
        ) : (
          /* -- Rescue Timeline ---------------------------------------------- */
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            ref={timelineRef}
            className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto space-y-1 pt-2 sm:pt-4 pb-8"
          >
            {/* TXID header with back button */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleReset}
                className="text-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Go back to home"
              >
                <ArrowLeft size={18} />
              </button>
              {txid && (
                <p className="text-muted text-sm font-mono truncate shrink-0 hidden sm:block">
                  {truncateTxid(txid, 16)}
                </p>
              )}
              <TxInput onSubmit={handleSubmit} isLoading={isLoading} compact />
            </div>

            {/* Timeline steps */}
            <div className="space-y-0">
              {/* Step 1: Diagnosis */}
              {reachedDiagnosis && (
                <TimelineStep
                  step={1}
                  label="Diagnose"
                  completed={reachedVerdict}
                  active={activeDiagnosis}
                  loading={isLoading}
                  summary={diagnosisSummary}
                  isLast={!reachedVerdict && !showError}
                >
                  <DiagnosticSequence
                    steps={diagnosis.steps}
                    isRunning={isLoading}
                  />
                </TimelineStep>
              )}

              {/* Error state */}
              {showError && diagnosis.error && (
                <div className="pl-11 pb-4">
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
                </div>
              )}

              {/* Step 2: Verdict */}
              {reachedVerdict && diagnosis.verdict && (
                <TimelineStep
                  step={2}
                  label="Verdict"
                  completed={reachedWalletSelect}
                  active={activeVerdict}
                  summary={verdictSummary}
                  isLast={!reachedWalletSelect}
                >
                  <div className="space-y-3">
                    <VerdictCard verdict={diagnosis.verdict} onFix={handleFix} />
                    {diagnosis.verdict.showAcceleratorFallback && txid && (
                      <AcceleratorFallback txid={txid} />
                    )}
                  </div>
                </TimelineStep>
              )}

              {/* Step 3: Wallet Selection */}
              {reachedWalletSelect && (
                <TimelineStep
                  step={3}
                  label="Wallet"
                  completed={reachedGuide}
                  active={activeWalletSelect}
                  summary={walletSelectSummary}
                  isLast={!reachedGuide}
                >
                  <WalletSelector
                    onSelect={handleWalletSelect}
                    onCancel={handleCancelFix}
                  />
                </TimelineStep>
              )}

              {/* Step 4: Wallet Guide */}
              {reachedGuide &&
                resolvedGuide &&
                fixMethod &&
                diagnosis.txData &&
                diagnosis.rawTxHex &&
                diagnosis.verdict &&
                txid && (
                  <TimelineStep
                    step={4}
                    label="Instructions"
                    completed={reachedTracker}
                    active={activeGuide}
                    summary={guideSummary}
                    isLast={!reachedTracker}
                  >
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
                  </TimelineStep>
                )}

              {/* Step 5: Track / Receipt */}
              {reachedTracker && broadcastedTxid && txid && (
                <TimelineStep
                  step={5}
                  label="Track"
                  completed={confirmed}
                  active={activeTracker}
                  summary={confirmed ? "Confirmed!" : "Tracking..."}
                  isLast
                >
                  {confirmed && diagnosis.verdict && fixMethod ? (
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
                  ) : (
                    <LiveTracker
                      txid={broadcastedTxid}
                      originalTxid={txid}
                      onConfirmed={handleConfirmed}
                    />
                  )}
                </TimelineStep>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DevPanel
        visible={devMode.panelVisible}
        scenarios={devMode.scenarios}
        activeScenarioId={devMode.activeScenario?.id ?? null}
        onActivate={handleDevActivate}
        onClose={devMode.deactivate}
      />
    </div>
  );
}
