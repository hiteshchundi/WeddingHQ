"use client";

import { Ellipsis, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { IconButton } from "../ui/icon-button";
import { isCurrentPath, navigationHref, secondaryNavigation } from "./navigation";

export function MobileMoreMenu({
  basePath,
  pathname,
}: {
  basePath: string;
  pathname: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const dialogId = useId();

  useEffect(() => {
    const tablet = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => { if (tablet.matches) dialog.current?.close(); };
    tablet.addEventListener("change", closeOnDesktop);
    return () => tablet.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <>
      <button
        type="button"
        className="mobile-nav-item w-full"
        aria-haspopup="dialog"
        aria-controls={dialogId}
        onClick={() => dialog.current?.showModal()}
      >
        <Ellipsis size={22} aria-hidden="true" />
        <span>More</span>
      </button>
      <dialog
        ref={dialog}
        id={dialogId}
        aria-labelledby={titleId}
        className="shell-dialog mobile-more-dialog"
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      >
        <div>
          <header className="flex items-center justify-between gap-4">
            <h2 id={titleId} className="text-2xl font-semibold">More</h2>
            <IconButton aria-label="Close More menu" onClick={() => dialog.current?.close()}>
              <X size={20} />
            </IconButton>
          </header>
          <p className="mt-4 text-sm text-secondary-text">These areas will be available in a later phase.</p>
          <nav aria-label="More organiser pages" className="mt-4">
            <ul className="space-y-1">
              {secondaryNavigation.map(({ label, segment, icon: Icon, available }) => {
                const href = navigationHref(basePath, segment);
                return (
                  <li key={label}>
                    {available ? <Link
                      href={href}
                      prefetch={false}
                      className="shell-nav-link"
                      aria-current={isCurrentPath(pathname, href, basePath) ? "page" : undefined}
                      onClick={() => dialog.current?.close()}
                    >
                      <Icon size={22} aria-hidden="true" />
                      <span>{label}</span>
                    </Link> : <span role="link" aria-disabled="true" aria-label={`${label} — available later`} className="shell-nav-link"><Icon size={22} aria-hidden="true" /><span>{label}</span></span>}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </dialog>
    </>
  );
}
