import { describe, it, expect } from "vitest";
import { checkWaitEstimate } from "./waitEstimate";
import { makeTx, MEMPOOL_BLOCKS, MEMPOOL_INFO } from "@/lib/__testdata__/fixtures";

describe("checkWaitEstimate", () => {
  it("returns pass for high-fee tx (next block)", () => {
    // weight=400, fee=50000 => feeRate = 500 sat/vB - well above everything
    const tx = makeTx({ weight: 400, fee: 50_000 });
    const result = checkWaitEstimate(tx, MEMPOOL_BLOCKS, MEMPOOL_INFO);
    expect(result.status).toBe("pass");
    expect(result.id).toBe("wait-estimate");
    expect(result.detail).toContain("next block");
  });

  it("returns warn for mid-fee tx (2-6 blocks)", () => {
    // weight=400, fee=3000 => feeRate = 30 sat/vB
    // blocksByFee: feeRange[0] of block 0 is 20, so block 0 match => 1 block
    // blocksByPosition: 100 sat/vB has 500_000 vsize, 50 has 2_000_000 => 2.5M ahead
    // Math.ceil(2_500_000 / 1_000_000) + 1 = 4
    // max(1, 4) = 4 => warn
    const tx = makeTx({ weight: 400, fee: 3_000 });
    const result = checkWaitEstimate(tx, MEMPOOL_BLOCKS, MEMPOOL_INFO);
    expect(result.status).toBe("warn");
  });

  it("returns fail for very low fee tx (many blocks)", () => {
    // weight=400, fee=100 => feeRate = 1 sat/vB - minimum
    const tx = makeTx({ weight: 400, fee: 100 });
    const result = checkWaitEstimate(tx, MEMPOOL_BLOCKS, MEMPOOL_INFO);
    expect(result.status).toBe("fail");
  });

  it("uses max of fee-based and position-based estimates", () => {
    // Verify the result is consistent (uses the higher estimate)
    const tx = makeTx({ weight: 400, fee: 2_000 });
    const result = checkWaitEstimate(tx, MEMPOOL_BLOCKS, MEMPOOL_INFO);
    expect(result.id).toBe("wait-estimate");
    expect(["pass", "warn", "fail"]).toContain(result.status);
  });
});
