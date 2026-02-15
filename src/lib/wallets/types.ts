// ── Wallet Capability Types ──────────────────────────────────────────────────

/** How a wallet supports a particular fix method */
export type MethodSupport =
  | "native"       // Built-in UI (e.g. Sparrow's "Increase Fee" button)
  | "psbt-import"  // Wallet can import a PSBT that TxFix generates
  | "none";        // Wallet cannot perform this method

/** PSBT import mechanisms a wallet supports */
export type PsbtImportMethod = "file" | "qr" | "clipboard";

/** Platform availability */
export type Platform = "desktop" | "mobile" | "web" | "hardware";

/** A step in a wallet-specific guide */
export interface GuideStep {
  /** Numbered step instruction - supports **bold** markers for emphasis */
  instruction: string;
  /** Optional sub-note shown in muted text below the instruction */
  note?: string;
}

/** Guide for a specific fix method within a wallet */
export interface WalletMethodGuide {
  method: "RBF" | "CPFP";
  support: MethodSupport;
  /** Steps when the wallet has native support */
  nativeSteps?: GuideStep[];
  /** Steps when using PSBT import path */
  psbtSteps?: GuideStep[];
  /** Which PSBT import methods the wallet supports */
  psbtImportMethods?: PsbtImportMethod[];
  /** Warning or caveat to display */
  caveat?: string;
  /** True if the wallet auto-calculates boost fees (user can't set exact sat/vB) */
  autoFee?: boolean;
}

/** Full wallet definition */
export interface WalletInfo {
  id: string;
  name: string;
  description: string;
  url: string;
  platforms: Platform[];
  openSource: boolean;
  rbf: WalletMethodGuide;
  cpfp: WalletMethodGuide;
  /** Search keywords for filtering */
  keywords: string[];
}

/** Resolved guide - the flattened result of wallet + method + verdict */
export interface ResolvedGuide {
  wallet: WalletInfo;
  method: "RBF" | "CPFP";
  approach: "native" | "psbt" | "unsupported";
  steps: GuideStep[];
  psbtAlternativeAvailable: boolean;
  psbtImportMethods: PsbtImportMethod[];
  caveat?: string;
  /** True if the wallet auto-calculates boost fees */
  autoFee: boolean;
}
