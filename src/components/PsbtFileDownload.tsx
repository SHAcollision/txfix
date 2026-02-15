"use client";

import { useCallback } from "react";
import { Download } from "lucide-react";
import { Button } from "./ui/Button";

interface PsbtFileDownloadProps {
  psbtBase64: string;
}

export function PsbtFileDownload({ psbtBase64 }: PsbtFileDownloadProps) {
  const handleDownload = useCallback(() => {
    const bytes = Uint8Array.from(atob(psbtBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `txfix-rescue-${Date.now()}.psbt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [psbtBase64]);

  return (
    <div className="space-y-3">
      <Button variant="secondary" onClick={handleDownload} className="w-full">
        <Download size={16} />
        Download .psbt file
      </Button>
      <p className="text-muted text-xs text-center">
        Import into Sparrow, Electrum, or any PSBT-compatible wallet
      </p>
    </div>
  );
}
