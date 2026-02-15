import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-5 text-xs text-muted border-t border-card-border">
      <span className="font-medium text-foreground/60">txfix.click</span>
      <span className="text-muted/50">3 clicks to unstick</span>
      <span className="text-muted/50">Free &amp; open source</span>
      <a
        href="https://github.com/copexit/txfix"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-muted/50 hover:text-foreground transition-colors"
      >
        <Github size={12} />
        GitHub
      </a>
    </footer>
  );
}
