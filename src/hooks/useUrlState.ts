"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import {
  type BitcoinNetwork,
  DEFAULT_NETWORK,
  isValidNetwork,
} from "@/lib/bitcoin/networks";
import { isValidTxid } from "@/lib/bitcoin/format";
import { getWalletById } from "@/lib/wallets/data";

type FixMethod = "RBF" | "CPFP";

function parseMethod(raw: string | null): FixMethod | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower === "rbf") return "RBF";
  if (lower === "cpfp") return "CPFP";
  return null;
}

function parseWallet(raw: string | null): string | null {
  if (!raw) return null;
  return getWalletById(raw) ? raw : null;
}

export function useUrlState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawNetwork = searchParams.get("network") ?? "";
  const network: BitcoinNetwork = isValidNetwork(rawNetwork)
    ? rawNetwork
    : DEFAULT_NETWORK;

  const txid = searchParams.get("tx");
  const method = parseMethod(searchParams.get("method"));
  const walletId = parseWallet(searchParams.get("wallet"));

  const buildUrl = useCallback(
    (params: URLSearchParams) => {
      const str = params.toString();
      return str ? `${pathname}?${str}` : pathname;
    },
    [pathname],
  );

  const setTxid = useCallback(
    (newTxid: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newTxid && isValidTxid(newTxid)) {
        params.set("tx", newTxid);
      } else {
        params.delete("tx");
      }
      // Cascade: new tx clears method and wallet
      params.delete("method");
      params.delete("wallet");
      router.push(buildUrl(params));
    },
    [searchParams, router, buildUrl],
  );

  const setNetwork = useCallback(
    (newNetwork: BitcoinNetwork) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newNetwork === DEFAULT_NETWORK) {
        params.delete("network");
      } else {
        params.set("network", newNetwork);
      }
      // Cascade: new network clears tx, method, wallet
      params.delete("tx");
      params.delete("method");
      params.delete("wallet");
      router.push(buildUrl(params));
    },
    [searchParams, router, buildUrl],
  );

  const setMethod = useCallback(
    (newMethod: FixMethod | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newMethod) {
        params.set("method", newMethod.toLowerCase());
      } else {
        params.delete("method");
      }
      // Cascade: changing method clears wallet
      params.delete("wallet");
      router.push(buildUrl(params));
    },
    [searchParams, router, buildUrl],
  );

  const setWallet = useCallback(
    (newWalletId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newWalletId && getWalletById(newWalletId)) {
        params.set("wallet", newWalletId);
      } else {
        params.delete("wallet");
      }
      router.push(buildUrl(params));
    },
    [searchParams, router, buildUrl],
  );

  /** Set method + wallet in a single URL push (no cascade clear of wallet) */
  const setMethodAndWallet = useCallback(
    (newMethod: FixMethod, newWalletId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("method", newMethod.toLowerCase());
      if (getWalletById(newWalletId)) {
        params.set("wallet", newWalletId);
      }
      router.push(buildUrl(params));
    },
    [searchParams, router, buildUrl],
  );

  return { txid, network, method, walletId, setTxid, setNetwork, setMethod, setWallet, setMethodAndWallet };
}
