import { Megaphone } from "lucide-react";

export function SponsorCta() {
  return (
    <a
      href="mailto:copexit@tutamail.com?subject=Sponsorship%20inquiry%20-%20TxFix"
      className="group block w-full max-w-md mx-auto mt-16 rounded-lg border border-dashed border-card-border/60 px-6 py-4 text-center transition-all duration-200 hover:border-bitcoin/30 hover:bg-bitcoin/[0.02]"
    >
      <p className="flex items-center justify-center gap-2 text-sm text-muted/40 group-hover:text-muted/70 transition-colors duration-200">
        <Megaphone size={16} className="shrink-0 text-muted/30 group-hover:text-bitcoin/50 transition-colors duration-200" />
        Advertise your awesome Bitcoin app here
      </p>
      <p className="mt-1 text-[11px] text-muted/25 group-hover:text-muted/50 transition-colors duration-200">
        copexit@tutamail.com
      </p>
    </a>
  );
}
