"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useWeddingEvents } from "./events-context";

type AttentionItemProps = {
  itemId: string;
  issue: string;
  action: string;
  href?: string;
};

export function AttentionItem({ itemId, issue, action, href }: AttentionItemProps) {
  const { events } = useWeddingEvents();
  if (itemId === "reception-venue" && events.find((event) => event.id === "reception")?.venue.name) return null;
  const content = <>
    <span className="text-base font-medium">{issue}</span>
    <span className="inline-flex items-center gap-2 text-sm font-semibold">
      {action}{href ? <ArrowRight size={16} aria-hidden="true" /> : <span className="text-xs font-normal text-secondary-text">· Available later</span>}
    </span>
  </>;
  return (
    <li>
      {href ? <Link
        href={href}
        prefetch={false}
        className="flex min-h-[44px] flex-col items-start gap-2 rounded-md px-3 py-4 hover:bg-surface focus-visible:bg-surface"
      >
        {content}
      </Link> : <div className="flex flex-col items-start gap-2 px-3 py-4">{content}</div>}
    </li>
  );
}
