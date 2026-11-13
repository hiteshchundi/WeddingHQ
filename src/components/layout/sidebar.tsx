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
  identity = weddingFixture.identity,
}: {
  basePath: string;
  pathname: string;
  collapsed: boolean;
  onToggle: () => void;
  identity?: { coupleNames: string; countdown: string; monogram: string };
}) {
  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  function renderLink(item: (typeof organiserNavigation)[number]) {
    const href = navigationHref(basePath, item.segment);
    const Icon = item.icon;
    const content = <><Icon size={20} aria-hidden="true" /><span className="sidebar-expanded">{item.label}</span></>;
    return (
      <li key={item.label}>
        {item.available ? <Link
          href={href}
          prefetch={false}
          className="shell-nav-link"
          title={item.label}
          aria-label={item.label}
          aria-current={isCurrentPath(pathname, href, basePath) ? "page" : undefined}
        >
          {content}
        </Link> : <span role="link" aria-disabled="true" aria-label={`${item.label} — available later`} title={`${item.label} — available later`} className="shell-nav-link">{content}</span>}
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
          <p className="break-words font-editorial text-2xl">{identity.coupleNames}</p>
          <p className="text-sm text-secondary-text">{identity.countdown}</p>
        </div>
        <span className="sidebar-collapsed text-sm font-semibold" title={identity.coupleNames}>
          {identity.monogram}
        </span>
      </div>
      <nav id="organiser-sidebar-nav" aria-label="Organiser" className="sidebar-nav">
        <ul className="space-y-1">{organiserNavigation.slice(0, -1).map(renderLink)}</ul>
        <p className="sidebar-expanded px-3 pt-4 text-xs text-secondary-text">More areas are planned for a later phase.</p>
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
