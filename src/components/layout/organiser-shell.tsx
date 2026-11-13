"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import {
  serverSidebarSnapshot,
  setPreference,
  sidebarSnapshot,
  subscribePreferences,
} from "../theme/preferences";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { Sidebar } from "./sidebar";

export function OrganiserShell({
  weddingId,
  children,
  account,
  identity,
}: {
  weddingId: string;
  children: ReactNode;
  account?: ReactNode;
  identity?: { coupleNames: string; countdown: string; monogram: string };
}) {
  const pathname = usePathname();
  const basePath = `/weddings/${encodeURIComponent(weddingId)}`;
  const collapsed = useSyncExternalStore(
    subscribePreferences,
    sidebarSnapshot,
    serverSidebarSnapshot,
  );

  return (
    <div className="organiser-shell">
      <a href="#organiser-content" className="organiser-skip-link">
        Skip to content
      </a>
      <Sidebar
        identity={identity}
        basePath={basePath}
        pathname={pathname}
        collapsed={collapsed}
        onToggle={() => setPreference("sidebarCollapsed", String(!collapsed))}
      />
      <div className="organiser-workspace">{account}{children}</div>
      <MobileBottomNav basePath={basePath} pathname={pathname} />
    </div>
  );
}
