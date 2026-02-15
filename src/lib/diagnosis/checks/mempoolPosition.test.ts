import { describe, it, expect } from "vitest";
import { checkMempoolPosition } from "./mempoolPosition";
import { makeTx, MEMPOOL_INFO } from "@/lib/__testdata__/fixtures";

describe("checkMempoolPosition", () => {
  it("passes for high-fee tx (near front)", () => {
    const tx = makeTx({ weight: 400, fee: 50_000 });
    // feeRate = 50000/100 = 500 sat/vB - above all histogram entries
    const result = checkMempoolPosition(tx, MEMPOOL_INFO);
    expect(result.status).toBe("pass");
    expect(result.label).toContain("front");
  });

  it("shows position for mid-fee tx", () => {
    const tx = makeTx({ weight: 400, fee: 2_000 });
    // feeRate = 20, histogram entries above 20: [100,500000] + [50,2000000] = 2.5M vsize
    const result = checkMempoolPosition(tx, MEMPOOL_INFO);
    expect(result.status).toBe("info");
    expect(result.label).toContain("Mempool position");
  });

  it("caps position estimate at total count", () => {
    // Very large vsizeAhead relative to totalVsize
    const info = {
      count: 100,
      vsize: 50,
      total_fee: 1_000_000,
      fee_histogram: [[10 as number, 1_000 as number]] as [number, number][],
    };
    const tx = makeTx({ weight: 4, fee: 1 });
    // feeRate = 1, all histogram entries above → vsizeAhead=1000
    // ratio = 1000/50 = 20, uncapped = 20*100 = 2000, should cap at 100
    const result = checkMempoolPosition(tx, info);
    // position should not exceed count
    expect(result.label).toContain("100");
  });

  it("handles zero vsize gracefully", () => {
    const info = {
      count: 0,
      vsize: 0,
      total_fee: 0,
      fee_histogram: [] as [number, number][],
    };
    const tx = makeTx({ weight: 400, fee: 1000 });
    const result = checkMempoolPosition(tx, info);
    expect(result.status).toBe("pass");
  });
});
