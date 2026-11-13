// Native Intl keeps the form's wall-clock values separate from UTC storage.
export function localDateTime(instant: string, timezone: string) {
  if (!instant) return "";
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(new Date(instant));
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)!.value;
  return `${read("year")}-${read("month")}-${read("day")}T${read("hour")}:${read("minute")}:${read("second")}`;
}
export function zonedInstant(value: string, timezone: string) {
  const wallTime = value.length === 16 ? `${value}:00` : value;
  const target = Date.parse(`${wallTime}Z`);
  if (!Number.isFinite(target)) throw new Error("Enter a valid date and time.");
  let candidate = target;
  for (let attempt = 0; attempt < 4; attempt++) {
    const displayed = localDateTime(new Date(candidate).toISOString(), timezone);
    if (displayed === wallTime) return new Date(candidate).toISOString();
    candidate += target - Date.parse(`${displayed}Z`);
  }
  throw new Error("This time does not exist in the selected timezone. Choose another time.");
}
