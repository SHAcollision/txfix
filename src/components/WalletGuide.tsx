"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Crosshair } from "lucide-react";
import { CopyButton } from "./ui/CopyButton";
import type { ResolvedGuide } from "@/lib/wallets/types";
import type { MempoolTransaction } from "@/lib/api/types";
import type { CpfpCandidate, Verdict } from "@/lib/diagnosis/types";
import { FixFlow } from "./FixFlow";
import { BroadcastInput } from "./BroadcastInput";
import { AcceleratorFallback } from "./AcceleratorFallback";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { WalletAvatar } from "./ui/WalletAvatar";
import { TipJar } from "./TipJar";

interface WalletGuideProps {
  guide: ResolvedGuide;
  verdict: Verdict;
  txData: MempoolTransaction;
  txHex: string;
  cpfpCandidates: CpfpCandidate[];
  txid: string;
  onBroadcasted: (txid: string) => void;
  onCancel: () => void;
  onChangeWallet: () => void;
  onSwitchMethod: (method: "RBF" | "CPFP") => void;
}

export function WalletGuide({
  guide,
  verdict,
  txData,
  txHex,
  cpfpCandidates,
  txid,
  onBroadcasted,
  onCancel,
  onChangeWallet,
  onSwitchMethod,
}: WalletGuideProps) {
  const [showPsbtFallback, setShowPsbtFallback] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);

  if (guide.approach === "unsupported") {
    return (
      <UnsupportedView
        guide={guide}
        verdict={verdict}
        txid={txid}
        onChangeWallet={onChangeWallet}
        onCancel={onCancel}
        onSwitchMethod={onSwitchMethod}
      />
    );
  }

  if (guide.approach === "psbt") {
    return (
      <PsbtView
        guide={guide}
        verdict={verdict}
        txData={txData}
        txHex={txHex}
        cpfpCandidates={cpfpCandidates}
        onBroadcasted={onBroadcasted}
        onCancel={onCancel}
        onChangeWallet={onChangeWallet}
      />
    );
  }

  // Native guide
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Card accent="bitcoin" className="space-y-4">
        <div className="flex items-center gap-3">
          <WalletAvatar
            walletId={guide.wallet.id}
            walletName={guide.wallet.name}
            size={24}
          />
          <h3 className="font-semibold">{guide.wallet.name}</h3>
          <Badge variant="success">{guide.method}</Badge>
        </div>

        {/* Caveat shown upfront before steps */}
        {guide.caveat && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg px-3 py-2 text-sm text-warning">
            {guide.caveat}
          </div>
        )}

        <p className="text-muted text-sm">
          Follow these steps in{" "}
          <strong className="text-foreground">{guide.wallet.name}</strong> to{" "}
          {guide.method === "RBF"
            ? "bump your transaction fee"
            : "speed up confirmation with a child transaction"}
          :
        </p>

        {/* Step-by-step instructions */}
        <ol className="space-y-3">
          {guide.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-bitcoin/25 to-bitcoin/15 text-bitcoin text-sm font-bold flex items-center justify-center mt-0.5 shadow-[0_0_8px_rgba(247,147,26,0.2)]">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-relaxed">
                  {renderFormatted(step.instruction)}
                </p>
                {step.note && (
                  <p className="text-xs text-muted mt-1">{step.note}</p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="bg-bitcoin/15 border border-bitcoin/30 border-l-2 border-l-bitcoin rounded-lg px-3 py-2.5 text-sm">
          <div className="flex items-start gap-2">
            <Crosshair size={16} className="text-bitcoin shrink-0 mt-1" />
            <div className="flex-1">
              <span className="text-muted text-sm">Target fee rate</span>
              <div className="flex items-center gap-2 mt-0.5">
                <strong className="text-bitcoin text-2xl tabular-nums">
                  {verdict.targetFeeRate} sat/vB
                </strong>
                <CopyButton
                  text={String(verdict.targetFeeRate)}
                  label="Copy"
                  className="text-[10px] px-2 py-0.5"
                />
              </div>
              <span className="text-muted block text-xs mt-1">
                {guide.autoFee
                  ? "Your wallet will automatically pick a fee around this rate"
                  : "Set your wallet fee to at least this rate for next-block confirmation"}
              </span>
            </div>
          </div>
        </div>

        <TipJar />

        {/* What now? - merged into main card */}
        <div className="border-t border-card-border pt-4 mt-4">
          <h4 className="font-semibold text-base">After you&apos;ve bumped the fee</h4>
          {!showBroadcast ? (
            <div className="space-y-3 mt-2">
              <p className="text-muted text-xs">
                After completing the steps above in your wallet, come back here
                to track your transaction.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowBroadcast(true)}
                data-guide-action
              >
                Track my transaction
              </Button>

              {guide.psbtAlternativeAvailable && !showPsbtFallback && (
                <button
                  onClick={() => setShowPsbtFallback(true)}
                  className="block text-muted text-xs hover:text-foreground transition-colors cursor-pointer"
                >
                  Having trouble? Import a PSBT file instead...
                </button>
              )}
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-muted text-xs mb-3">
                Paste the replacement transaction ID from your wallet so TxFix
                can track it. Check your wallet&apos;s transaction details for
                the new TXID.
              </p>
              <BroadcastInput onBroadcasted={onBroadcasted} />
              <button
                onClick={() => setShowBroadcast(false)}
                className="inline-flex items-center gap-1.5 mt-2 text-muted text-xs hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft size={12} />
                Back to instructions
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* PSBT fallback */}
      {showPsbtFallback && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <FixFlow
            method={guide.method}
            txData={txData}
            txHex={txHex}
            verdict={verdict}
            cpfpCandidates={cpfpCandidates}
            onBroadcastReady={() => {}}
            onCancel={() => setShowPsbtFallback(false)}
            hideBackLink
          />
        </motion.div>
      )}

      <div className="flex gap-4">
        <button
          onClick={onChangeWallet}
          className="text-muted text-sm hover:text-foreground focus-visible:text-foreground transition-colors cursor-pointer"
        >
          Change wallet
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-muted text-sm hover:text-foreground focus-visible:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to diagnosis
        </button>
      </div>
    </motion.div>
  );
}

// -- PSBT-import approach --

function PsbtView({
  guide,
  verdict,
  txData,
  txHex,
  cpfpCandidates,
  onBroadcasted,
  onCancel,
  onChangeWallet,
}: {
  guide: ResolvedGuide;
  verdict: Verdict;
  txData: MempoolTransaction;
  txHex: string;
  cpfpCandidates: CpfpCandidate[];
  onBroadcasted: (txid: string) => void;
  onCancel: () => void;
  onChangeWallet: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Card accent="bitcoin" className="space-y-3">
        <div className="flex items-center gap-3">
          <WalletAvatar
            walletId={guide.wallet.id}
            walletName={guide.wallet.name}
            size={24}
          />
          <h3 className="font-semibold">{guide.wallet.name}</h3>
          <Badge variant="success">{guide.method}</Badge>
        </div>
        <p className="text-muted text-sm">
          TxFix will generate a{" "}
          <strong className="text-foreground">PSBT</strong> (Partially Signed
          Bitcoin Transaction) for you to import into{" "}
          <strong className="text-foreground">{guide.wallet.name}</strong>. Your
          keys never leave your wallet.
        </p>
      </Card>

      {/* FixFlow generates the PSBT first */}
      <FixFlow
        method={guide.method}
        txData={txData}
        txHex={txHex}
        verdict={verdict}
        cpfpCandidates={cpfpCandidates}
        onBroadcastReady={() => {}}
        onCancel={onCancel}
        visibleTabs={mapImportMethodsToTabs(guide.psbtImportMethods)}
        hideBackLink
      />

      {/* Import steps shown after PSBT is available */}
      {guide.steps.length > 0 && (
        <Card className="space-y-3">
          <h4 className="font-semibold text-sm">
            How to import in {guide.wallet.name}
          </h4>
          <ol className="space-y-2">
            {guide.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-bitcoin/25 to-bitcoin/15 text-bitcoin text-sm font-bold flex items-center justify-center mt-0.5 shadow-[0_0_8px_rgba(247,147,26,0.2)]">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed">
                  {renderFormatted(step.instruction)}
                </p>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <BroadcastInput onBroadcasted={onBroadcasted} />

      <div className="flex gap-4">
        <button
          onClick={onChangeWallet}
          className="text-muted text-sm hover:text-foreground focus-visible:text-foreground transition-colors cursor-pointer"
        >
          Change wallet
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-muted text-sm hover:text-foreground focus-visible:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to diagnosis
        </button>
      </div>
    </motion.div>
  );
}

// -- Unsupported approach --

function UnsupportedView({
  guide,
  verdict,
  txid,
  onChangeWallet,
  onCancel,
  onSwitchMethod,
}: {
  guide: ResolvedGuide;
  verdict: Verdict;
  txid: string;
  onChangeWallet: () => void;
  onCancel: () => void;
  onSwitchMethod: (method: "RBF" | "CPFP") => void;
}) {
  const otherMethod = guide.method === "RBF" ? "CPFP" : "RBF";
  const otherAvailable =
    otherMethod === "RBF" ? verdict.canRbf : verdict.canCpfp;

  // Check if the wallet actually supports the other method
  const otherWalletGuide = guide.method === "RBF" ? guide.wallet.cpfp : guide.wallet.rbf;
  const otherWalletSupported = otherWalletGuide.support !== "none";
  const canSwitchMethod = otherAvailable && otherWalletSupported;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Card accent="warning" className="space-y-3">
        <div className="flex items-center gap-3">
          <WalletAvatar
            walletId={guide.wallet.id}
            walletName={guide.wallet.name}
            size={24}
          />
          <h3 className="font-semibold">
            {guide.wallet.name} doesn&apos;t support {guide.method}
          </h3>
        </div>
        <p className="text-muted text-sm leading-relaxed">
          Unfortunately, {guide.wallet.name} cannot perform{" "}
          {guide.method === "RBF"
            ? "fee bumping (RBF)"
            : "child-pays-for-parent (CPFP)"}{" "}
          directly.
        </p>

        {guide.caveat && (
          <p className="text-muted text-xs leading-relaxed border-t border-card-border pt-2">
            {guide.caveat}
          </p>
        )}

        <div className="space-y-2 pt-1">
          {canSwitchMethod && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSwitchMethod(otherMethod)}
              data-guide-action
            >
              Try {otherMethod} instead
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={onChangeWallet}
          >
            Use a different wallet
          </Button>
        </div>
      </Card>

      {!canSwitchMethod && <AcceleratorFallback txid={txid} />}

      <div className="flex gap-4">
        <button
          onClick={onChangeWallet}
          className="text-muted text-sm hover:text-foreground focus-visible:text-foreground transition-colors cursor-pointer"
        >
          Change wallet
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-muted text-sm hover:text-foreground focus-visible:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to diagnosis
        </button>
      </div>
    </motion.div>
  );
}

// -- Helpers --

/** Convert **bold** markers to <strong> elements */
function renderFormatted(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/** Map PsbtImportMethod to PsbtDelivery tab names */
function mapImportMethodsToTabs(
  methods: ResolvedGuide["psbtImportMethods"],
): ("qr" | "file" | "hex")[] {
  const map: Record<string, "qr" | "file" | "hex"> = {
    qr: "qr",
    file: "file",
    clipboard: "hex",
  };
  const result: ("qr" | "file" | "hex")[] = [];
  for (const m of methods) {
    const tab = map[m];
    if (tab) result.push(tab);
  }
  return result;
}
