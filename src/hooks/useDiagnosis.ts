"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNetwork } from "@/context/NetworkContext";
import { createMempoolClient } from "@/lib/api/mempool";
import { runDiagnosis, type EngineResult } from "@/lib/diagnosis/engine";
import type {
  DiagnosisPhase,
  CheckResult,
  Verdict,
  CpfpCandidate,
} from "@/lib/diagnosis/types";
import type {
  MempoolTransaction,
  RecommendedFees,
  OutspendStatus,
} from "@/lib/api/types";

interface DiagnosisResult {
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

export function useDiagnosis(txid: string | null): DiagnosisResult {
  const { config } = useNetwork();
  const [phase, setPhase] = useState<DiagnosisPhase>("idle");
  const [steps, setSteps] = useState<CheckResult[]>([]);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [txData, setTxData] = useState<MempoolTransaction | null>(null);
  const [rawTxHex, setRawTxHex] = useState<string | null>(null);
  const [fees, setFees] = useState<RecommendedFees | null>(null);
  const [outspends, setOutspends] = useState<OutspendStatus[] | null>(null);
  const [cpfpCandidates, setCpfpCandidates] = useState<CpfpCandidate[]>([]);
  const [btcPrice, setBtcPrice] = useState(100_000);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef(false);

  // Reset state during render when txid becomes null (React recommended pattern)
  const [prevTxid, setPrevTxid] = useState<string | null>(null);
  if (txid !== prevTxid) {
    setPrevTxid(txid);
    if (!txid) {
      setPhase("idle");
      setSteps([]);
      setVerdict(null);
      setTxData(null);
      setRawTxHex(null);
      setFees(null);
      setOutspends(null);
      setCpfpCandidates([]);
      setError(null);
    }
  }

  const reset = useCallback(() => {
    setPhase("idle");
    setSteps([]);
    setVerdict(null);
    setTxData(null);
    setRawTxHex(null);
    setFees(null);
    setOutspends(null);
    setCpfpCandidates([]);
    setError(null);
  }, []);

  useEffect(() => {
    if (!txid) return;

    abortRef.current = false;

    const MIN_STEP_DELAY_MS = 200;
    const MIN_TOTAL_DIAGNOSIS_MS = 1600;

    async function run() {
      setPhase("fetching");
      setSteps([]);
      setVerdict(null);
      setError(null);

      const startTime = Date.now();

      try {
        const client = createMempoolClient(config.mempoolBaseUrl);
        setPhase("diagnosing");

        const generator = runDiagnosis(txid!, client);
        let result: IteratorResult<CheckResult, EngineResult>;

        do {
          result = await generator.next();
          if (abortRef.current) return;

          if (!result.done) {
            setSteps((prev) => [...prev, result.value as CheckResult]);
            // Small delay between steps so users can see each check
            await new Promise((r) => setTimeout(r, MIN_STEP_DELAY_MS));
            if (abortRef.current) return;
          }
        } while (!result.done);

        if (abortRef.current) return;

        // Ensure minimum total diagnosis time for perceived thoroughness
        const elapsed = Date.now() - startTime;
        if (elapsed < MIN_TOTAL_DIAGNOSIS_MS) {
          await new Promise((r) => setTimeout(r, MIN_TOTAL_DIAGNOSIS_MS - elapsed));
          if (abortRef.current) return;
        }

        const engineResult = result.value;
        setVerdict(engineResult.verdict);
        setTxData(engineResult.data.tx);
        setRawTxHex(engineResult.data.txHex);
        setFees(engineResult.data.fees);
        setOutspends(engineResult.data.outspends);
        setCpfpCandidates(engineResult.cpfpCandidates);
        setBtcPrice(engineResult.data.btcPrice);
        setPhase("complete");
      } catch (err) {
        if (abortRef.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setPhase("error");
      }
    }

    run();

    return () => {
      abortRef.current = true;
    };
  }, [txid, config.mempoolBaseUrl]);

  return {
    phase,
    steps,
    verdict,
    txData,
    rawTxHex,
    fees,
    outspends,
    cpfpCandidates,
    btcPrice,
    error,
    reset,
  };
}
