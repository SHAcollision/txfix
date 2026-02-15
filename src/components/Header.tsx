"use client";

import Link from "next/link";
import { NetworkSelector } from "./NetworkSelector";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-6xl mx-auto w-full">
        <Link href="/" aria-label="TxFix home" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            tx<span className="text-bitcoin">fix</span>
          </span>
        </Link>
        <NetworkSelector />
      </div>
    </header>
  );
}
