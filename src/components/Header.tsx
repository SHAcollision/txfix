"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { NetworkSelector } from "./NetworkSelector";

const TAP_COUNT = 5;
const TAP_WINDOW_MS = 2000;

export function Header() {
  const tapsRef = useRef<number[]>([]);

  const handleLogoClick = useCallback(() => {
    const now = Date.now();
    const taps = tapsRef.current;
    taps.push(now);

    // Keep only taps within the window
    while (taps.length > 0 && now - taps[0] > TAP_WINDOW_MS) {
      taps.shift();
    }

    if (taps.length >= TAP_COUNT) {
      taps.length = 0;
      window.dispatchEvent(new CustomEvent("txfix:devtoggle"));
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-6xl mx-auto w-full">
        <Link
          href="/"
          aria-label="TxFix home"
          className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
        >
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground select-none">
            tx<span className="text-bitcoin">fix</span>
          </span>
        </Link>
        <NetworkSelector />
      </div>
    </header>
  );
}
