import type { MempoolTransaction, MempoolVin } from "@/lib/api/types";
import { DUST_LIMITS, DEFAULT_DUST_LIMIT } from "@/lib/bitcoin/constants";

const SEGWIT_TYPES = new Set(["v0_p2wpkh", "v0_p2wsh", "v1_p2tr"]);

export function isSegWitInput(vin: MempoolVin): boolean {
  return SEGWIT_TYPES.has(vin.prevout.scriptpubkey_type);
}

export function isSegWitType(type: string): boolean {
  return SEGWIT_TYPES.has(type);
}

export function getDustLimit(scriptType: string): number {
  return DUST_LIMITS[scriptType] ?? DEFAULT_DUST_LIMIT;
}

/**
 * Identify the change output of a transaction using heuristics.
 * Returns the output index, or -1 if unable to identify.
 *
 * Heuristics (in priority order):
 * 1. If only one output matches the input address type → that's change
 * 2. Among matching outputs, prefer non-round amounts
 * 3. Fallback: last output matching input type
 * 4. If no match: last output that's not OP_RETURN
 */
export function identifyChangeOutput(tx: MempoolTransaction): number {
  const inputTypes = new Set(tx.vin.map((v) => v.prevout.scriptpubkey_type));

  // Filter to outputs matching input address type (skip OP_RETURN and no-address outputs)
  const candidates = tx.vout
    .map((v, i) => ({ ...v, index: i }))
    .filter((v) => v.scriptpubkey_address && inputTypes.has(v.scriptpubkey_type));

  if (candidates.length === 1) return candidates[0].index;

  if (candidates.length > 1) {
    // Prefer non-round amounts (change is typically not a round number)
    const nonRound = candidates.filter(
      (c) => c.value % 1000 !== 0 && c.value % 10000 !== 0,
    );
    if (nonRound.length === 1) return nonRound[0].index;

    // Fallback: last matching output
    return candidates[candidates.length - 1].index;
  }

  // No type match: use last addressable output
  for (let i = tx.vout.length - 1; i >= 0; i--) {
    if (tx.vout[i].scriptpubkey_address) return i;
  }

  return -1;
}

/**
 * Extract the redeem script from a P2SH-wrapped SegWit input's scriptsig.
 * P2SH-P2WPKH scriptsig is: OP_PUSHDATA <redeemScript>
 * where redeemScript is: 0014{20-byte-pubkey-hash}
 */
export function extractRedeemScript(scriptsig: string): Uint8Array {
  const buf = hexToBytes(scriptsig);
  if (buf.length === 0) {
    throw new Error("Empty scriptsig - cannot extract redeem script");
  }
  const opcode = buf[0];
  let dataStart: number;
  let dataLen: number;

  if (opcode >= 0x01 && opcode <= 0x4b) {
    // Direct push: opcode IS the length
    dataLen = opcode;
    dataStart = 1;
  } else if (opcode === 0x4c) {
    // OP_PUSHDATA1: next byte is length
    if (buf.length < 2) throw new Error("Truncated OP_PUSHDATA1 in scriptsig");
    dataLen = buf[1];
    dataStart = 2;
  } else if (opcode === 0x4d) {
    // OP_PUSHDATA2: next 2 bytes (little-endian) are length
    if (buf.length < 3) throw new Error("Truncated OP_PUSHDATA2 in scriptsig");
    dataLen = buf[1] | (buf[2] << 8);
    dataStart = 3;
  } else {
    throw new Error(`Unexpected opcode 0x${opcode.toString(16)} in scriptsig`);
  }

  if (dataStart + dataLen > buf.length) {
    throw new Error("Scriptsig push length exceeds buffer");
  }
  return buf.slice(dataStart, dataStart + dataLen);
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Hex string must have even length");
  }
  if (hex.length > 0 && !/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error("Invalid hex characters");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
