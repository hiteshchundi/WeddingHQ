export function ActivityItem({ description }: { description: string }) {
  return (
    <li className="border-b border-border py-4 first:pt-0 last:border-b-0">
      <p className="text-sm">{description}</p>
    </li>
  );
}
