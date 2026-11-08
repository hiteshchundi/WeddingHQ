import {
  Activity,
  CalendarDays,
  Images,
  LayoutDashboard,
  ListTodo,
  Mail,
  Settings,
  Store,
  Users,
  Wallet,
} from "lucide-react";

export const organiserNavigation = [
  { label: "Overview", segment: "", icon: LayoutDashboard },
  { label: "Events", segment: "events", icon: CalendarDays },
  { label: "Guests", segment: "guests", icon: Users },
  { label: "Tasks", segment: "tasks", icon: ListTodo },
  { label: "Vendors", segment: "vendors", icon: Store },
  { label: "Expenses", segment: "expenses", icon: Wallet },
  { label: "Messages", segment: "messages", icon: Mail },
  { label: "Photos", segment: "photos", icon: Images },
  { label: "Activity", segment: "activity", icon: Activity },
  { label: "Settings", segment: "settings", icon: Settings },
] as const;

export const mobilePrimaryNavigation = [
  organiserNavigation[0],
  organiserNavigation[2],
  organiserNavigation[3],
  organiserNavigation[1],
];

export const secondaryNavigation = organiserNavigation.slice(4);

export function navigationHref(basePath: string, segment: string) {
  return segment ? `${basePath}/${segment}` : basePath;
}

export function isCurrentPath(pathname: string, href: string, basePath: string) {
  return pathname === href || (href !== basePath && pathname.startsWith(`${href}/`));
}
