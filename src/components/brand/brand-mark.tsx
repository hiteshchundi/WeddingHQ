type BrandMarkProps = {
  wordmark?: boolean;
  className?: string;
};

export function BrandMark({ wordmark = true, className = "" }: BrandMarkProps) {
  return (
    <span
      role="img"
      aria-label="Wedding HQ"
      className={`inline-flex items-center gap-2 font-sans ${className}`}
    >
      <span
        aria-hidden="true"
        className="inline-block h-6 w-6 shrink-0 bg-sage"
        style={{
          mask: 'url("/brand/wedding-hq-mark.svg") center / contain no-repeat',
        }}
      />
      {wordmark ? (
        <span aria-hidden="true" className="text-lg font-semibold">
          Wedding HQ
        </span>
      ) : null}
    </span>
  );
}
