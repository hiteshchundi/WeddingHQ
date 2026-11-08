import type { ComponentProps } from "react";

type InputProps = Omit<ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  helperText?: string;
  error?: string;
};

export function Input({
  id,
  label,
  helperText,
  error,
  className = "",
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: InputProps) {
  const description = [
    describedBy,
    helperText ? `${id}-help` : null,
    error ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        {...props}
        id={id}
        aria-describedby={description || undefined}
        aria-invalid={error ? true : invalid}
        className={`h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base text-primary-text placeholder:text-secondary-text focus:border-sage disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-primary-text ${className}`}
      />
      {helperText ? (
        <p id={`${id}-help`} className="text-sm text-secondary-text">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-semibold">
          Error: {error}
        </p>
      ) : null}
    </div>
  );
}
