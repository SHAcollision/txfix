"use client";

import { useState, useEffect, useCallback } from "react";
import { DEV_SCENARIOS, getScenarioById, type MockScenario } from "@/lib/__devdata__/scenarios";
import type { DiagnosisPhase, CheckResult, Verdict, CpfpCandidate } from "@/lib/diagnosis/types";
import type { MempoolTransaction, RecommendedFees, OutspendStatus } from "@/lib/api/types";

export interface DevModeDiagnosis {
  phase: DiagnosisPhase;
  steps: CheckResult[];
  verdict: Verdict | null;
  txData: MempoolTransaction | null;
  rawTxHex: string | null;
  fees: RecommendedFees | null;
  outspends: OutspendStatus[] | null;
  cpfpCandidates: CpfpCandidate[];
  btcPrice: number;
  error: Error | null;
  reset: () => void;
}

interface DevModeState {
  panelVisible: boolean;
  activeScenario: MockScenario | null;
}

export function useDevMode() {
  const [state, setState] = useState<DevModeState>({
    panelVisible: false,
    activeScenario: null,
  });

  const activate = useCallback((scenarioId: string) => {
    const scenario = getScenarioById(scenarioId);
    if (scenario) {
      setState({ panelVisible: true, activeScenario: scenario });
    }
  }, []);

  const deactivate = useCallback(() => {
    setState({ panelVisible: false, activeScenario: null });
  }, []);

  const togglePanel = useCallback(() => {
    setState((prev) => ({
      ...prev,
      panelVisible: !prev.panelVisible,
      activeScenario: prev.panelVisible ? null : prev.activeScenario,
    }));
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      // Backtick toggles panel
      if (e.key === "`") {
        e.preventDefault();
        togglePanel();
        return;
      }

      // Digit keys 1-6 activate scenario when panel is visible
      if (state.panelVisible && e.key >= "1" && e.key <= "6") {
        e.preventDefault();
        activate(e.key);
        return;
      }

      // Escape closes panel
      if (e.key === "Escape" && state.panelVisible) {
        e.preventDefault();
        deactivate();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    // 5-tap logo trigger (works on mobile)
    function handleDevToggle() {
      togglePanel();
    }
    window.addEventListener("txfix:devtoggle", handleDevToggle);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("txfix:devtoggle", handleDevToggle);
    };
  }, [state.panelVisible, togglePanel, activate, deactivate]);

  const mockDiagnosis: DevModeDiagnosis | null = state.activeScenario
    ? {
        phase: "complete" as const,
        steps: state.activeScenario.steps,
        verdict: state.activeScenario.verdict,
        txData: state.activeScenario.txData,
        rawTxHex: state.activeScenario.rawTxHex,
        fees: state.activeScenario.fees,
        outspends: state.activeScenario.outspends,
        cpfpCandidates: state.activeScenario.cpfpCandidates,
        btcPrice: state.activeScenario.btcPrice,
        error: null,
        reset: deactivate,
      }
    : null;

  return {
    panelVisible: state.panelVisible,
    activeScenario: state.activeScenario,
    mockDiagnosis,
    scenarios: DEV_SCENARIOS,
    activate,
    deactivate,
    togglePanel,
  };
}
