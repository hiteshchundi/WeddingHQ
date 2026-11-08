import type { ComponentProps } from "react";

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={`rounded-lg border border-border bg-surface p-6 ${className}`}
    />
  );
}
