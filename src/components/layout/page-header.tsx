import type { ReactNode } from "react";
import { weddingFixture } from "../../fixtures/wedding";
import { BrandMark } from "../brand/brand-mark";
import { AppearanceControl } from "../theme/appearance-control";

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <header className="organiser-page-header">
      <div className="page-header-inner">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark wordmark={false} className="organiser-mobile-brand" />
          <div>
            <h1 className="organiser-page-title font-semibold">{title}</h1>
            <p className="mobile-couple text-sm text-secondary-text">{weddingFixture.identity.coupleNames}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {action}
          <AppearanceControl />
        </div>
      </div>
    </header>
  );
}
