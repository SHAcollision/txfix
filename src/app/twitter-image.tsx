import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const alt = "TxFix - Unstick Bitcoin Transactions in 3 Clicks";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#ededed",
              letterSpacing: "-0.02em",
            }}
          >
            tx
          </span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#f7931a",
              letterSpacing: "-0.02em",
            }}
          >
            fix
          </span>
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#787880",
            marginTop: 8,
          }}
        >
          Unstick Bitcoin Transactions in 3 Clicks
        </div>
        <div
          style={{
            fontSize: 20,
            color: "#787880",
            opacity: 0.6,
            marginTop: 16,
          }}
        >
          Free diagnosis. No keys required.
        </div>
      </div>
    ),
    { ...size },
  );
}
