import Link from "next/link";
import { isCurrentPath, mobilePrimaryNavigation, navigationHref } from "./navigation";
import { MobileMoreMenu } from "./mobile-more-menu";

export function MobileBottomNav({
  basePath,
  pathname,
}: {
  basePath: string;
  pathname: string;
}) {
  return (
    <nav aria-label="Mobile organiser" className="mobile-bottom-nav">
      <ul className="grid grid-cols-5 gap-1">
        {mobilePrimaryNavigation.map(({ label, segment, icon: Icon }) => {
          const href = navigationHref(basePath, segment);
          return (
            <li key={label}>
              <Link
                href={href}
                prefetch={false}
                className="mobile-nav-item"
                aria-current={isCurrentPath(pathname, href, basePath) ? "page" : undefined}
              >
                <Icon size={22} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
        <li><MobileMoreMenu basePath={basePath} pathname={pathname} /></li>
      </ul>
    </nav>
  );
}
