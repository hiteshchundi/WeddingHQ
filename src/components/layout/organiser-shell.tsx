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
}: {
  weddingId: string;
  children: ReactNode;
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
        basePath={basePath}
        pathname={pathname}
        collapsed={collapsed}
        onToggle={() => setPreference("sidebarCollapsed", String(!collapsed))}
      />
      <div className="organiser-workspace">{children}</div>
      <MobileBottomNav basePath={basePath} pathname={pathname} />
    </div>
  );
}
