export function eventDate(value: string, timezone: string, withYear = false) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "long",
    day: "numeric",
    ...(withYear ? { year: "numeric" as const } : {}),
  }).format(new Date(value));
}

export function eventTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}
