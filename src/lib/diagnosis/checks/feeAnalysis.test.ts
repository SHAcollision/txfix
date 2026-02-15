import { describe, it, expect } from "vitest";
import { checkFeeAdequacy } from "./feeAnalysis";
import { makeTx, RECOMMENDED_FEES, MEMPOOL_BLOCKS } from "@/lib/__testdata__/fixtures";

describe("checkFeeAdequacy", () => {
  it("returns pass when fee rate meets next-block target", () => {
    // weight=400, fee=20000 => feeRate = 20000/100 = 200 sat/vB (well above fastestFee=50)
    const tx = makeTx({ weight: 400, fee: 20_000 });
    const result = checkFeeAdequacy(tx, RECOMMENDED_FEES, MEMPOOL_BLOCKS);
    expect(result.status).toBe("pass");
    expect(result.id).toBe("fee-analysis");
  });

  it("returns warn when fee rate is between hourFee and fastestFee", () => {
    // weight=400, fee=8000 => feeRate = 8000/100 = 80 - wait, that's above 50
    // need feeRate between 15 (hourFee) and 50 (fastestFee)
    // weight=400, fee=2500 => feeRate = 2500/100 = 25 sat/vB
    const tx = makeTx({ weight: 400, fee: 2_500 });
    const result = checkFeeAdequacy(tx, RECOMMENDED_FEES, MEMPOOL_BLOCKS);
    expect(result.status).toBe("warn");
    expect(result.detail).toContain("next-block target");
  });

  it("returns fail when fee rate is below hourFee", () => {
    // weight=400, fee=400 => feeRate = 400/100 = 4 sat/vB (below hourFee=15)
    const tx = makeTx({ weight: 400, fee: 400 });
    const result = checkFeeAdequacy(tx, RECOMMENDED_FEES, MEMPOOL_BLOCKS);
    expect(result.status).toBe("fail");
    expect(result.detail).toContain("Well below");
  });

  it("returns pass at exact boundary of fastestFee", () => {
    // weight=400, fee=5000 => feeRate = 5000/100 = 50 sat/vB (exactly fastestFee)
    const tx = makeTx({ weight: 400, fee: 5_000 });
    const result = checkFeeAdequacy(tx, RECOMMENDED_FEES, MEMPOOL_BLOCKS);
    expect(result.status).toBe("pass");
  });
});
