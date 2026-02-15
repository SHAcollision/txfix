"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ArrowLeft } from "lucide-react";
import { WALLETS } from "@/lib/wallets/data";
import type { WalletInfo, Platform } from "@/lib/wallets/types";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";

interface WalletSelectorProps {
  onSelect: (walletId: string) => void;
  onCancel: () => void;
}

const platformLabels: Record<Platform, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  web: "Web",
  hardware: "Hardware",
};

const walletColors: Record<string, string> = {
  sparrow: "bg-blue-500/20 text-blue-400",
  electrum: "bg-cyan-500/20 text-cyan-400",
  bitkit: "bg-orange-500/20 text-orange-400",
  ashigaru: "bg-red-500/20 text-red-400",
  bluewallet: "bg-blue-600/20 text-blue-300",
  "bitcoin-core": "bg-amber-500/20 text-amber-400",
  wasabi: "bg-emerald-500/20 text-emerald-400",
  ledger: "bg-purple-500/20 text-purple-400",
  trezor: "bg-green-500/20 text-green-400",
  exodus: "bg-violet-500/20 text-violet-400",
  muun: "bg-indigo-500/20 text-indigo-400",
  green: "bg-teal-500/20 text-teal-400",
};

function getWalletInitial(wallet: WalletInfo): string {
  return wallet.name.charAt(0).toUpperCase();
}

function getWalletColor(walletId: string): string {
  return walletColors[walletId] ?? "bg-bitcoin/15 text-bitcoin";
}

export function WalletSelector({ onSelect, onCancel }: WalletSelectorProps) {
  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [gridActive, setGridActive] = useState(false);
  const [columns, setColumns] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { mainWallets, otherWallet } = useMemo(() => {
    const other = WALLETS.find((w) => w.id === "other");
    const main = WALLETS.filter((w) => w.id !== "other");
    return { mainWallets: main, otherWallet: other };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return mainWallets;
    const q = query.toLowerCase();
    return mainWallets.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.keywords.some((k) => k.includes(q)),
    );
  }, [query, mainWallets]);

  // Total navigable items: filtered wallets + "Other" button
  const itemCount = filtered.length + (otherWallet ? 1 : 0);

  // Track columns via matchMedia
  useEffect(() => {
    const update = () => {
      const lgMq = window.matchMedia("(min-width: 1024px)");
      const smMq = window.matchMedia("(min-width: 640px)");
      setColumns(lgMq.matches ? 3 : smMq.matches ? 2 : 1);
    };
    update();
    const lgMq = window.matchMedia("(min-width: 1024px)");
    const smMq = window.matchMedia("(min-width: 640px)");
    lgMq.addEventListener("change", update);
    smMq.addEventListener("change", update);
    return () => {
      lgMq.removeEventListener("change", update);
      smMq.removeEventListener("change", update);
    };
  }, []);

  // Clamp focusedIndex when filtered list changes
  useEffect(() => {
    if (gridActive && focusedIndex >= itemCount) {
      setFocusedIndex(Math.max(0, itemCount - 1));
    }
  }, [itemCount, focusedIndex, gridActive]);

  const enterGrid = useCallback(() => {
    if (itemCount > 0) {
      setGridActive(true);
      setFocusedIndex(0);
      gridRef.current?.focus();
    }
  }, [itemCount]);

  const exitGrid = useCallback(() => {
    setGridActive(false);
    setFocusedIndex(-1);
    searchRef.current?.focus();
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      enterGrid();
    }
  };

  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!gridActive) return;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + columns, itemCount - 1));
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const next = focusedIndex - columns;
        if (next < 0) {
          exitGrid();
        } else {
          setFocusedIndex(next);
        }
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, itemCount - 1));
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      }
      case "Enter": {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filtered.length) {
          onSelect(filtered[focusedIndex].id);
        } else if (focusedIndex === filtered.length && otherWallet) {
          onSelect(otherWallet.id);
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        exitGrid();
        break;
      }
      default: {
        // Printable character - redirect to search
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          exitGrid();
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card accent="bitcoin" className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">Which wallet do you use?</h3>
          <p className="text-muted text-sm mt-1">
            We&apos;ll show you step-by-step instructions for your specific
            wallet.
          </p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search wallets..."
            autoComplete="off"
            aria-label="Search wallets"
            data-wallet-search
            className="w-full bg-surface-inset border border-card-border rounded-lg pl-9 pr-3 py-2
              text-sm text-foreground placeholder:text-muted/50
              focus:border-bitcoin focus:shadow-[0_0_0_4px_rgba(247,147,26,0.1)]
              transition-all duration-200"
          />
        </div>

        {/* Wallet grid */}
        <div
          ref={gridRef}
          tabIndex={-1}
          onKeyDown={handleGridKeyDown}
          onBlur={(e) => {
            if (!gridRef.current?.contains(e.relatedTarget as Node)) {
              setGridActive(false);
              setFocusedIndex(-1);
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-2 outline-none"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((wallet, i) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onSelect={onSelect}
                isFocused={gridActive && focusedIndex === i}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <p className="text-muted text-sm text-center py-2">
            No wallets match your search.
          </p>
        )}

        {/* Other / Not Listed - always visible */}
        {otherWallet && (
          <button
            onClick={() => onSelect(otherWallet.id)}
            className={`w-full text-left bg-surface-inset border rounded-lg p-3
              hover:border-bitcoin hover:bg-surface-elevated hover:shadow-[0_4px_12px_rgba(247,147,26,0.15)]
              hover:scale-[1.01] active:scale-[0.99]
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-bitcoin focus-visible:outline-offset-2
              transition-all duration-200 cursor-pointer
              ${gridActive && focusedIndex === filtered.length ? "ring-2 ring-bitcoin/30 border-bitcoin" : "border-card-border"}`}
          >
            <span className="text-sm font-semibold text-foreground">
              My wallet isn&apos;t listed
            </span>
            <span className="text-xs text-muted block mt-0.5">
              {otherWallet.description}
            </span>
          </button>
        )}

        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-muted text-sm hover:text-foreground focus-visible:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to diagnosis
        </button>
      </Card>
    </motion.div>
  );
}

function WalletCard({
  wallet,
  onSelect,
  isFocused,
}: {
  wallet: WalletInfo;
  onSelect: (id: string) => void;
  isFocused: boolean;
}) {
  const colorClass = getWalletColor(wallet.id);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(wallet.id)}
      className={`text-left bg-surface-inset border rounded-lg p-3
        hover:border-bitcoin hover:bg-surface-elevated hover:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(247,147,26,0.15)]
        hover:scale-[1.02] active:scale-[0.99]
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-bitcoin focus-visible:outline-offset-2
        transition-all duration-200 cursor-pointer
        ${isFocused ? "ring-2 ring-bitcoin/30 border-bitcoin" : "border-card-border"}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full ${colorClass} text-sm font-bold flex items-center justify-center shrink-0`}>
          {getWalletInitial(wallet)}
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold block">{wallet.name}</span>
          <span className="text-xs text-muted block mt-0.5 line-clamp-1 sm:line-clamp-2 leading-snug">
            {wallet.description}
          </span>
          <div className="flex gap-1 mt-2">
            {wallet.platforms.map((p) => (
              <Badge key={p} variant="muted" className="text-[10px] px-1.5 py-0">
                {platformLabels[p]}
              </Badge>
            ))}
            {wallet.openSource && (
              <Badge
                variant="success"
                className="text-[10px] px-1.5 py-0"
              >
                FOSS
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
