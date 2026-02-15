"use client";

import { useState, useMemo } from "react";
import { useNetwork } from "@/context/NetworkContext";

const MAINNET_PREFIXES = ["bc1", "1", "3"];
const TESTNET_PREFIXES = ["tb1", "m", "n", "2"];
const SIGNET_PREFIXES = ["tb1", "sb1"];

function validateAddress(address: string, network: string): string | null {
  const trimmed = address.trim();
  if (!trimmed) return "Address is required";
  if (trimmed.length < 26 || trimmed.length > 90) {
    return "Address length looks invalid";
  }

  const prefixes =
    network === "mainnet"
      ? MAINNET_PREFIXES
      : network === "signet"
        ? SIGNET_PREFIXES
        : TESTNET_PREFIXES;

  const matchesPrefix = prefixes.some((p) =>
    trimmed.startsWith(p),
  );

  if (!matchesPrefix) {
    const expected = prefixes.join(", ");
    return `Address should start with ${expected} for ${network}`;
  }

  return null;
}

interface CpfpAddressInputProps {
  defaultAddress: string;
  onConfirm: (address: string) => void;
  onCancel: () => void;
}

export function CpfpAddressInput({
  defaultAddress,
  onConfirm,
  onCancel,
}: CpfpAddressInputProps) {
  const [address, setAddress] = useState(defaultAddress);
  const { network } = useNetwork();

  const error = useMemo(
    () => validateAddress(address, network),
    [address, network],
  );

  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-sm">CPFP Destination Address</h3>
      <p className="text-muted text-xs leading-relaxed">
        The child transaction will send funds to this address. By default, it
        sends back to the same address (self-spend). You can change it if
        needed.
      </p>
      <div>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          className={`w-full bg-surface-inset border rounded-lg px-3 py-2
            font-mono text-sm text-foreground placeholder:text-muted/50
            focus:outline-none focus:border-bitcoin transition-colors
            ${error && address.trim() ? "border-danger" : "border-card-border"}`}
        />
        {error && address.trim() && (
          <p className="text-danger text-xs mt-1.5">{error}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onConfirm(address)}
          disabled={!!error}
          className="px-4 py-2 bg-bitcoin text-black font-semibold text-sm rounded-lg
            hover:bg-bitcoin-hover transition-colors disabled:opacity-50 cursor-pointer"
        >
          Build PSBT
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-muted text-sm hover:text-foreground transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
