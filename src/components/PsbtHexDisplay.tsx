"use client";

import { CopyButton } from "./ui/CopyButton";

interface PsbtHexDisplayProps {
  psbtHex: string;
}

export function PsbtHexDisplay({ psbtHex }: PsbtHexDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">Raw PSBT hex</span>
        <CopyButton text={psbtHex} label="Copy hex" />
      </div>
      <div className="bg-surface-inset border border-card-border rounded-lg p-3 max-h-40 overflow-y-auto">
        <p className="font-mono text-xs text-foreground/70 break-all leading-relaxed select-all">
          {psbtHex}
        </p>
      </div>
      <p className="text-muted text-xs">
        Paste into your wallet&apos;s PSBT import
      </p>
    </div>
  );
}
