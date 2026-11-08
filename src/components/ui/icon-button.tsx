import type { ComponentProps, ReactNode } from "react";

type IconButtonProps = Omit<ComponentProps<"button">, "children" | "aria-label"> & {
  children: ReactNode;
  "aria-label": string;
};

export function IconButton({
  children,
  "aria-label": label,
  type = "button",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      aria-label={label}
      className={`inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-md border border-border bg-surface text-primary-text hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <span aria-hidden="true" className="inline-flex items-center justify-center">
        {children}
      </span>
    </button>
  );
}
