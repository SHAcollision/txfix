"use client";

import { useEffect } from "react";

interface UseKeyboardNavOptions {
  txid: string | null;
  method: string | null;
  walletId: string | null;
  onReset: () => void;
  onClearMethod: () => void;
  onClearWallet: () => void;
  disabled?: boolean;
}

export function useKeyboardNav({
  txid,
  method,
  walletId,
  onReset,
  onClearMethod,
  onClearWallet,
  disabled,
}: UseKeyboardNavOptions): void {
  useEffect(() => {
    if (disabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented) return;

      if (e.key !== "Backspace" && e.key !== "Escape") return;

      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (walletId) {
        e.preventDefault();
        onClearWallet();
      } else if (method) {
        e.preventDefault();
        onClearMethod();
      } else if (txid) {
        e.preventDefault();
        onReset();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [txid, method, walletId, onReset, onClearMethod, onClearWallet, disabled]);
}
