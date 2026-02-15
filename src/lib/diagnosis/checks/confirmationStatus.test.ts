import { describe, it, expect } from "vitest";
import { checkConfirmationStatus } from "./confirmationStatus";
import { makeTx } from "@/lib/__testdata__/fixtures";

describe("checkConfirmationStatus", () => {
  it("returns pass for confirmed transaction", () => {
    const tx = makeTx({
      status: { confirmed: true, block_height: 850_000, block_hash: "a".repeat(64), block_time: 1700000000 },
    });
    const result = checkConfirmationStatus(tx);
    expect(result.status).toBe("pass");
    expect(result.label).toContain("confirmed");
    expect(result.detail).toContain("850,000");
  });

  it("returns info for unconfirmed transaction", () => {
    const tx = makeTx({ status: { confirmed: false } });
    const result = checkConfirmationStatus(tx);
    expect(result.status).toBe("info");
    expect(result.label).toContain("mempool");
    expect(result.detail).toContain("Unconfirmed");
  });

  it("always returns id confirmation-status", () => {
    const tx = makeTx();
    const result = checkConfirmationStatus(tx);
    expect(result.id).toBe("confirmation-status");
  });
});
