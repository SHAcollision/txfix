"use client";

import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-bitcoin text-black font-semibold hover:bg-bitcoin-hover hover:shadow-[0_0_12px_rgba(247,147,26,0.3)] active:scale-[0.98] disabled:hover:bg-bitcoin disabled:hover:shadow-none disabled:active:scale-100",
  secondary:
    "bg-card-bg text-foreground border border-card-border hover:border-muted active:scale-[0.98] disabled:hover:border-card-border disabled:active:scale-100",
  ghost:
    "text-muted hover:text-foreground hover:bg-card-bg active:scale-[0.98] disabled:hover:text-muted disabled:hover:bg-transparent disabled:active:scale-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150
        ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${variantClasses[variant]} ${sizeClasses[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
