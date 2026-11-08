import type { ComponentProps } from "react";

export function Badge({ className = "", ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      className={`inline-flex items-center rounded-sm bg-sage-soft px-2 py-1 text-xs font-semibold text-primary-text ${className}`}
    />
  );
}
