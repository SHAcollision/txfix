import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: "danger" | "warning" | "success" | "info" | "bitcoin";
}

const accentClasses: Record<string, string> = {
  danger: "border-t-[3px] border-t-danger",
  warning: "border-t-[3px] border-t-warning",
  success: "border-t-[3px] border-t-success",
  info: "border-t-[3px] border-t-info",
  bitcoin: "border-t-[3px] border-t-bitcoin",
};

export function Card({
  accent,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-card-bg border border-card-border rounded-xl p-5
        shadow-[0_1px_3px_rgba(0,0,0,0.3)]
        ${accent ? accentClasses[accent] : ""}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
