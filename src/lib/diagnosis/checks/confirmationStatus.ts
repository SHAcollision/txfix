import type { MempoolTransaction } from "@/lib/api/types";
import type { CheckResult } from "../types";

export function checkConfirmationStatus(tx: MempoolTransaction): CheckResult {
  if (tx.status.confirmed) {
    return {
      id: "confirmation-status",
      label: "Transaction confirmed",
      detail: `Block #${tx.status.block_height?.toLocaleString("en-US")}`,
      status: "pass",
      icon: "\u2713",
    };
  }

  return {
    id: "confirmation-status",
    label: "Transaction found in mempool",
    detail: "Unconfirmed - awaiting inclusion in a block",
    status: "info",
    icon: "\u25CB",
  };
}
