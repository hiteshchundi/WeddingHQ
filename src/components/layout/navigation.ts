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
  { label: "Overview", segment: "", icon: LayoutDashboard, available: true },
  { label: "Events", segment: "events", icon: CalendarDays, available: true },
  { label: "Guests", segment: "guests", icon: Users, available: true },
  { label: "Tasks", segment: "tasks", icon: ListTodo, available: true },
  { label: "Vendors", segment: "vendors", icon: Store, available: false },
  { label: "Expenses", segment: "expenses", icon: Wallet, available: false },
  { label: "Messages", segment: "messages", icon: Mail, available: false },
  { label: "Photos", segment: "photos", icon: Images, available: false },
  { label: "Activity", segment: "activity", icon: Activity, available: false },
  { label: "Settings", segment: "settings", icon: Settings, available: false },
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
