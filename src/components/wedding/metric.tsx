type MetricProps = {
  value: string | number;
  label: string;
  detail: string;
};

// A metric belongs inside a description list; labels precede values for AT.
export function Metric({ value, label, detail }: MetricProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="order-2 text-sm font-medium">{label}</dt>
      <dd className="order-1 text-3xl font-semibold tabular-nums">{value}</dd>
      <dd className="order-3 text-sm text-secondary-text">{detail}</dd>
    </div>
  );
}
