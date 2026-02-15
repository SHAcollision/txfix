import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0 px-4 py-4 text-xs text-muted border-t border-card-border">
      <span>
        <span className="font-medium text-foreground/60">txfix.click</span>
        {" "}&ndash; 3 clicks to unstick &middot; Free &amp; open source
        &middot;{" "}
        <a
          href="https://github.com/copexit/txfix"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Github size={12} />
          GitHub
        </a>
      </span>
      <span className="text-muted/60 sm:before:content-['_\00B7_']">
        Your keys never leave your device
      </span>
    </footer>
  );
}
