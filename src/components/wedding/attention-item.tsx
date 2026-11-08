import { ArrowRight } from "lucide-react";
import Link from "next/link";

type AttentionItemProps = {
  issue: string;
  action: string;
  href: string;
};

export function AttentionItem({ issue, action, href }: AttentionItemProps) {
  return (
    <li>
      <Link
        href={href}
        prefetch={false}
        className="flex min-h-[44px] flex-col items-start gap-2 rounded-md px-3 py-4 hover:bg-surface focus-visible:bg-surface"
      >
        <span className="text-base font-medium">{issue}</span>
        <span className="inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline">
          {action}
          <ArrowRight size={16} aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}
