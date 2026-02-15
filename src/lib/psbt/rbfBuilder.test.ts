import { describe, it, expect } from "vitest";
import { buildRbfPsbt } from "./rbfBuilder";
import { makeTx, makeVin, makeVout, makeLegacyVin } from "@/lib/__testdata__/fixtures";
import * as bitcoin from "bitcoinjs-lib";

const network = bitcoin.networks.testnet;

function makeSegWitTx() {
  return makeTx({
    weight: 561,
    fee: 1_000,
    vin: [makeVin({ sequence: 0xfffffffd })],
    vout: [
      makeVout({ value: 40_000, scriptpubkey_type: "p2pkh", scriptpubkey_address: "1abc" }),
      makeVout({ value: 59_000 }), // change - matches input type v0_p2wpkh
    ],
  });
}

describe("buildRbfPsbt", () => {
  it("builds valid PSBT for SegWit-only tx", () => {
    const tx = makeSegWitTx();
    const result = buildRbfPsbt({
      originalTx: tx,
      originalTxHex: "0200000000010100" + "ab".repeat(100),
      targetFeeRate: 20,
      network,
    });

    expect(result.psbtBase64).toBeTruthy();
    expect(result.psbtHex).toBeTruthy();
    expect(result.newFee).toBeGreaterThan(tx.fee);
    expect(result.additionalFee).toBeGreaterThan(0);
    expect(result.changeOutputIndex).toBe(1);
  });

  it("falls back to originalTxHex when inputTxHexMap lacks entry for SegWit input", () => {
    // SegWit inputs don't use nonWitnessUtxo, so they work without inputTxHexMap
    const tx = makeSegWitTx();
    const result = buildRbfPsbt({
      originalTx: tx,
      originalTxHex: "0200000000010100" + "ab".repeat(100),
      inputTxHexMap: {}, // empty map - ok because all inputs are SegWit
      targetFeeRate: 20,
      network,
    });
    expect(result.psbtBase64).toBeTruthy();
  });

  it("throws when legacy input has no hex available", () => {
    const legacyVin = makeLegacyVin({ txid: "dd".repeat(32) });
    const tx = makeTx({
      weight: 800,
      fee: 1_000,
      vin: [legacyVin],
      vout: [
        makeVout({ value: 40_000, scriptpubkey_type: "p2pkh", scriptpubkey_address: "1abc" }),
        makeVout({ value: 58_000 }),
      ],
    });

    expect(() =>
      buildRbfPsbt({
        originalTx: tx,
        originalTxHex: "",
        inputTxHexMap: {},
        targetFeeRate: 10,
        network,
      }),
    ).toThrow("Missing raw transaction hex");
  });

  it("throws CHANGE_OUTPUT_TOO_SMALL when change is below dust", () => {
    const tx = makeTx({
      weight: 561,
      fee: 1_000,
      vin: [makeVin()],
      vout: [
        makeVout({ value: 99_000, scriptpubkey_type: "p2pkh", scriptpubkey_address: "1abc" }),
        makeVout({ value: 100 }), // tiny change
      ],
    });

    expect(() =>
      buildRbfPsbt({
        originalTx: tx,
        originalTxHex: "0200" + "00".repeat(100),
        targetFeeRate: 100,
        network,
      }),
    ).toThrow(/too small/i);
  });

  it("throws when new fee is not higher than original", () => {
    const tx = makeTx({
      weight: 561,
      fee: 100_000,
      vin: [makeVin()],
      vout: [
        makeVout({ value: 40_000 }),
        makeVout({ value: 59_000 }),
      ],
    });

    expect(() =>
      buildRbfPsbt({
        originalTx: tx,
        originalTxHex: "0200" + "00".repeat(100),
        targetFeeRate: 1,
        network,
      }),
    ).toThrow(/not higher/);
  });
});
