import type { MempoolTransaction } from "@/lib/api/types";
import type { CheckResult } from "../types";

export function checkRbfSignaling(tx: MempoolTransaction): CheckResult {
  if (tx.vin.length === 0) {
    return {
      id: "rbf-signaling",
      label: "No inputs",
      detail: "Transaction has no inputs - cannot determine RBF signaling",
      status: "warn",
      icon: "\u26A0",
    };
  }

  const hasRbfSignal = tx.vin.some(
    (input) => input.sequence < 0xfffffffe,
  );
  const allMaxSequence = tx.vin.every(
    (input) => input.sequence === 0xffffffff,
  );

  if (hasRbfSignal) {
    const minSeq = Math.min(...tx.vin.map((v) => v.sequence));
    return {
      id: "rbf-signaling",
      label: "RBF signaled",
      detail: `sequence: 0x${minSeq.toString(16).padStart(8, "0")}`,
      status: "pass",
      icon: "\u2713",
    };
  }

  return {
    id: "rbf-signaling",
    label: "RBF not explicitly signaled",
    detail: allMaxSequence
      ? "All inputs at max sequence - full-RBF may still work (most nodes relay since Core 28)"
      : `sequence: 0x${Math.min(...tx.vin.map((v) => v.sequence)).toString(16).padStart(8, "0")}`,
    status: "warn",
    icon: "\u26A0",
  };
}

/**
 * Returns true if the transaction has explicit RBF opt-in.
 */
export function hasExplicitRbf(tx: MempoolTransaction): boolean {
  return tx.vin.some((input) => input.sequence < 0xfffffffe);
}
