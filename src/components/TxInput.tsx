"use client";

import { useState, useRef, useCallback, type FormEvent } from "react";
import { isValidTxid } from "@/lib/bitcoin/format";
import { Spinner } from "./ui/Spinner";

interface TxInputProps {
  onSubmit: (txid: string) => void;
  isLoading: boolean;
  compact?: boolean;
}

export function TxInput({ onSubmit, isLoading, compact = false }: TxInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim().toLowerCase();
      if (!trimmed) return;
      if (!isValidTxid(trimmed)) {
        setError("Invalid TXID - must be a 64-character hex string");
        return;
      }
      setError(null);
      onSubmit(trimmed);
    },
    [onSubmit],
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted && isValidTxid(pasted.trim())) {
      e.preventDefault();
      setValue(pasted.trim().toLowerCase());
      setPasteSuccess(true);
      setTimeout(() => {
        setPasteSuccess(false);
        submit(pasted);
      }, 300);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            onPaste={handlePaste}
            placeholder="Paste a transaction ID..."
            spellCheck={false}
            autoComplete="off"
            aria-describedby={error ? "txid-error" : undefined}
            className={`flex-1 bg-card-bg border rounded-lg px-3 py-2
              font-mono text-sm text-foreground placeholder:text-muted/50
              focus:outline-none focus:border-bitcoin focus:ring-1 focus:ring-bitcoin/30
              transition-all duration-200
              ${pasteSuccess ? "border-success ring-2 ring-success/20" : "border-card-border"}`}
          />
          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="px-4 py-2 bg-bitcoin text-black font-semibold text-sm rounded-lg
              hover:bg-bitcoin-hover transition-all duration-150 disabled:opacity-50
              disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {isLoading ? <Spinner size="sm" /> : "Diagnose"}
          </button>
        </div>
        {error && (
          <p id="txid-error" className="text-danger text-xs mt-1.5">{error}</p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative group">
        <div className="absolute -inset-1 bg-bitcoin/5 rounded-2xl blur-xl group-focus-within:bg-bitcoin/10 transition-all duration-300 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onPaste={handlePaste}
          placeholder="Paste a transaction ID..."
          spellCheck={false}
          autoComplete="off"
          autoFocus
          aria-describedby={error ? "txid-error" : undefined}
          className={`relative w-full bg-card-bg border rounded-xl px-5 py-4
            font-mono text-sm sm:text-base text-foreground placeholder:text-muted/50
            focus:border-bitcoin focus:ring-2 focus:ring-bitcoin/20
            focus:shadow-[0_0_20px_rgba(247,147,26,0.15)]
            transition-all duration-200
            ${pasteSuccess ? "border-success ring-2 ring-success/20" : "border-card-border"}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Spinner />
          ) : (
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-4 py-1.5 bg-bitcoin text-black font-semibold text-sm rounded-lg
                hover:bg-bitcoin-hover transition-all duration-150 disabled:opacity-30
                disabled:cursor-not-allowed cursor-pointer"
            >
              Diagnose
            </button>
          )}
        </div>
      </div>
      {error && (
        <p id="txid-error" className="text-danger text-xs mt-2 text-center">{error}</p>
      )}
    </form>
  );
}
