import type { MempoolClient } from "@/lib/api/mempool";
import type { CheckResult, Verdict, CpfpCandidate, DiagnosisData } from "./types";
import { checkConfirmationStatus } from "./checks/confirmationStatus";
import { checkRbfSignaling } from "./checks/rbf";
import { checkCpfpFeasibility } from "./checks/cpfp";
import { checkFeeAdequacy } from "./checks/feeAnalysis";
import { checkMempoolPosition } from "./checks/mempoolPosition";
import { checkWaitEstimate } from "./checks/waitEstimate";
import {
  getEffectiveFeeRate,
  calculateRbfCost,
  calculateCpfpCost,
  estimateBlocksToConfirm,
} from "@/lib/bitcoin/fees";
import { formatFeeRate, formatBlockEstimate, satsToUsd } from "@/lib/bitcoin/format";

export interface EngineResult {
  verdict: Verdict;
  data: DiagnosisData;
  cpfpCandidates: CpfpCandidate[];
}

/**
 * Async generator that yields diagnostic check results one by one,
 * then returns the final verdict. This drives the animated UI.
 */
export async function* runDiagnosis(
  txid: string,
  mempoolClient: MempoolClient,
): AsyncGenerator<CheckResult, EngineResult> {
  // ── Fetch all data in parallel ──────────────────────────────────────────
  const [tx, txHex, fees, mempoolBlocks, outspends, mempoolInfo, btcPrice] =
    await Promise.all([
      mempoolClient.getTransaction(txid),
      mempoolClient.getTxHex(txid),
      mempoolClient.getRecommendedFees(),
      mempoolClient.getMempoolBlocks(),
      mempoolClient.getTxOutspends(txid),
      mempoolClient.getMempoolInfo(),
      mempoolClient.getPrice(),
    ]);

  const data: DiagnosisData = {
    tx,
    txHex,
    fees,
    mempoolBlocks,
    mempoolInfo,
    outspends,
    btcPrice,
  };

  // ── 1. Confirmation status ──────────────────────────────────────────────
  const confirmCheck = checkConfirmationStatus(tx);
  yield confirmCheck;

  if (tx.status.confirmed) {
    return {
      verdict: buildConfirmedVerdict(tx),
      data,
      cpfpCandidates: [],
    };
  }

  // ── 2. RBF signaling ───────────────────────────────────────────────────
  yield checkRbfSignaling(tx);

  // ── 3. CPFP feasibility ────────────────────────────────────────────────
  const cpfpResult = checkCpfpFeasibility(tx, outspends);
  yield cpfpResult.check;

  // ── 4. Fee adequacy ────────────────────────────────────────────────────
  yield checkFeeAdequacy(tx, fees, mempoolBlocks);

  // ── 5. Mempool position ────────────────────────────────────────────────
  yield checkMempoolPosition(tx, mempoolInfo);

  // ── 6. Wait estimate ───────────────────────────────────────────────────
  yield checkWaitEstimate(tx, mempoolBlocks);

  // ── Build verdict ──────────────────────────────────────────────────────
  const verdict = buildVerdict(data, cpfpResult.candidates);

  return {
    verdict,
    data,
    cpfpCandidates: cpfpResult.candidates,
  };
}

// ── Verdict builders ────────────────────────────────────────────────────────

function buildConfirmedVerdict(
  tx: import("@/lib/api/types").MempoolTransaction,
): Verdict {
  return {
    severity: "CONFIRMED",
    headline: "Already confirmed",
    explanation: `This transaction was confirmed in block #${tx.status.block_height?.toLocaleString()}. No action needed.`,
    recommendations: [],
    canRbf: false,
    canCpfp: false,
    showAcceleratorFallback: false,
    currentFeeRate: getEffectiveFeeRate(tx),
    targetFeeRate: 0,
  };
}

function buildVerdict(
  data: DiagnosisData,
  cpfpCandidates: CpfpCandidate[],
): Verdict {
  const { tx, fees, mempoolBlocks, btcPrice: rawBtcPrice } = data;
  const btcPrice = rawBtcPrice > 0 ? rawBtcPrice : 100_000;
  const currentFeeRate = getEffectiveFeeRate(tx);
  const targetFeeRate = fees.fastestFee;
  const blocks = estimateBlocksToConfirm(currentFeeRate, mempoolBlocks);

  // Determine severity
  let severity: Verdict["severity"];
  if (blocks <= 1) severity = "FINE";
  else if (blocks <= 6) severity = "SLOW";
  else severity = "STUCK";

  // Full-RBF era: always treat as RBF-able (may fail for some edge cases)
  const canRbf = true;
  const canCpfp = cpfpCandidates.length > 0;

  const recommendations: Verdict["recommendations"] = [];

  if (severity !== "FINE") {
    // RBF recommendation
    if (canRbf) {
      const rbfCost = calculateRbfCost(tx, targetFeeRate);
      recommendations.push({
        method: "RBF",
        label: "RBF Bump",
        isPrimary: true,
        costSats: rbfCost.additionalFeeSats,
        costUsd: satsToUsd(rbfCost.additionalFeeSats, btcPrice),
        estimatedTime: "~10 min",
        targetFeeRate,
      });
    }

    // CPFP recommendation
    if (canCpfp) {
      const cpfpCost = calculateCpfpCost(tx, cpfpCandidates[0], targetFeeRate);
      recommendations.push({
        method: "CPFP",
        label: "CPFP Child",
        isPrimary: !canRbf,
        costSats: cpfpCost.childFeeSats,
        costUsd: satsToUsd(cpfpCost.childFeeSats, btcPrice),
        estimatedTime: "~10 min",
        targetFeeRate: cpfpCost.effectiveChildFeeRate,
      });
    }
  }

  // Wait recommendation (always show for SLOW, and for FINE)
  if (severity === "FINE" || severity === "SLOW") {
    recommendations.push({
      method: "WAIT",
      label: "Wait",
      isPrimary: severity === "FINE",
      costSats: 0,
      estimatedTime: formatBlockEstimate(blocks),
      targetFeeRate: currentFeeRate,
    });
  }

  // Accelerator fallback
  const showAcceleratorFallback = severity === "STUCK" && !canRbf && !canCpfp;
  if (showAcceleratorFallback) {
    recommendations.push({
      method: "ACCELERATOR",
      label: "Use Accelerator",
      isPrimary: true,
      costSats: 0,
      estimatedTime: "~10-30 min",
      targetFeeRate: 0,
    });
  }

  return {
    severity,
    headline: buildHeadline(severity, blocks),
    explanation: buildExplanation(currentFeeRate, targetFeeRate, severity),
    recommendations,
    canRbf,
    canCpfp,
    showAcceleratorFallback,
    currentFeeRate,
    targetFeeRate,
  };
}

function buildHeadline(severity: Verdict["severity"], blocks: number): string {
  switch (severity) {
    case "STUCK":
      return `Stuck, but fixable - ${formatBlockEstimate(blocks)} at current rate`;
    case "SLOW":
      return `Slow, but fixable - ${formatBlockEstimate(blocks)} at current rate`;
    case "FINE":
      return "Looking good - should confirm soon";
    case "CONFIRMED":
      return "Already confirmed";
  }
}

function buildExplanation(
  currentFeeRate: number,
  targetFeeRate: number,
  severity: Verdict["severity"],
): string {
  if (severity === "FINE") {
    return `Your transaction pays ${formatFeeRate(currentFeeRate)}, which is sufficient for timely confirmation. No action needed.`;
  }
  if (severity === "CONFIRMED") {
    return "This transaction has already been included in a block.";
  }
  return `Your transaction pays ${formatFeeRate(currentFeeRate)} but the mempool needs ${formatFeeRate(targetFeeRate)} for next-block confirmation.`;
}
