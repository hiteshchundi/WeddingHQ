import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "tertiary";
};

const variants = {
  // The approved darker sage gives small light text sufficient contrast.
  primary: "border-sage-hover bg-sage-hover text-on-sage",
  secondary: "border-border bg-surface text-primary-text hover:bg-surface-alt",
  tertiary: "border-transparent bg-transparent text-primary-text",
};

export function Button({
  variant = "primary",
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`inline-flex min-h-[44px] items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold hover:underline disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
}
