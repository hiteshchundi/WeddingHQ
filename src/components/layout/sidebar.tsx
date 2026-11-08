import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { weddingFixture } from "../../fixtures/wedding";
import { BrandMark } from "../brand/brand-mark";
import { Button } from "../ui/button";
import { isCurrentPath, navigationHref, organiserNavigation } from "./navigation";

export function Sidebar({
  basePath,
  pathname,
  collapsed,
  onToggle,
}: {
  basePath: string;
  pathname: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  function renderLink(item: (typeof organiserNavigation)[number]) {
    const href = navigationHref(basePath, item.segment);
    const Icon = item.icon;
    return (
      <li key={item.label}>
        <Link
          href={href}
          prefetch={false}
          className="shell-nav-link"
          title={item.label}
          aria-label={item.label}
          aria-current={isCurrentPath(pathname, href, basePath) ? "page" : undefined}
        >
          <Icon size={20} aria-hidden="true" />
          <span className="sidebar-expanded">{item.label}</span>
        </Link>
      </li>
    );
  }

  return (
    <aside className="organiser-sidebar" aria-label="Wedding workspace">
      <div className="sidebar-brand">
        <BrandMark className="sidebar-expanded" />
        <BrandMark wordmark={false} className="sidebar-collapsed" />
      </div>
      <div className="sidebar-identity">
        <div className="sidebar-expanded flex-col gap-1">
          <p className="font-editorial text-2xl">{weddingFixture.identity.coupleNames}</p>
          <p className="text-sm text-secondary-text">{weddingFixture.identity.countdown}</p>
        </div>
        <span className="sidebar-collapsed text-sm font-semibold" title={weddingFixture.identity.coupleNames}>
          {weddingFixture.identity.monogram}
        </span>
      </div>
      <nav id="organiser-sidebar-nav" aria-label="Organiser" className="sidebar-nav">
        <ul className="space-y-1">{organiserNavigation.slice(0, -1).map(renderLink)}</ul>
        <ul className="mt-auto pt-6">{organiserNavigation.slice(-1).map(renderLink)}</ul>
      </nav>
      <Button
        variant="tertiary"
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label={toggleLabel}
        title={toggleLabel}
        aria-expanded={!collapsed}
        aria-controls="organiser-sidebar-nav"
      >
        {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        <span className="sidebar-expanded">Collapse</span>
      </Button>
    </aside>
  );
}
