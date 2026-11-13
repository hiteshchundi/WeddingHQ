import { z } from "zod";
import { eventTypes, weddingStatuses } from "../types/wedding";

export function isTimezone(value: string) {
  if (/^[+-]/.test(value)) return false;
  try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; }
}
const timezone = z.string().trim().min(1).max(100).refine(isTimezone, "Enter a valid IANA timezone.");
const instant = z.iso.datetime({ offset: true }).refine((value) => Number.isFinite(Date.parse(value)), "Enter a valid date.");
const text = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) => text(max).nullable().optional();
const httpUrl = z.url({ protocol: /^https?$/ }).max(2048).nullable().optional();
const helpContact = z.strictObject({
  name: text(100).min(1), label: text(100).optional(), phone: text(50).optional(),
  email: z.email().max(254).optional(),
});
const weddingFields = {
  title: text(200).min(1), brideName: text(100).min(1), groomName: text(100).min(1),
  description: optionalText(5000), timezone,
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "Enter a three-letter currency code."),
  startDate: instant, endDate: instant,
};
export const weddingCreateSchema = z.strictObject(weddingFields).refine(
  (value) => Date.parse(value.endDate) >= Date.parse(value.startDate),
  { path: ["endDate"], message: "End date cannot be before start date." },
);
export const weddingPatchSchema = z.strictObject({
  ...weddingFields, status: z.enum(weddingStatuses),
  rsvpDefaultDeadline: instant.nullable(), helpContacts: z.array(helpContact).max(20),
}).partial().refine((value) => Object.keys(value).length > 0, "Provide at least one editable field.");
const eventFieldsSchema = z.strictObject({
  name: text(200).min(1), type: z.enum(eventTypes), customType: optionalText(100),
  description: optionalText(5000), startsAt: instant, endsAt: instant.nullable().optional(), timezone,
  venue: z.strictObject({ name: optionalText(300), address: optionalText(1000), googleMapsUrl: httpUrl }).optional(),
  dressCode: optionalText(500), youtubeLiveUrl: httpUrl, rsvpDeadline: instant.nullable().optional(),
  order: z.number().int().min(0).max(1_000_000).optional(),
});
export const eventCreateSchema = eventFieldsSchema.superRefine((value, context) => {
  if (value.type === "CUSTOM" && !value.customType) context.addIssue({ code: "custom", path: ["customType"], message: "A custom event type is required." });
  if (value.endsAt && Date.parse(value.endsAt) < Date.parse(value.startsAt)) context.addIssue({ code: "custom", path: ["endsAt"], message: "End time cannot be before start time." });
});
export const eventPatchSchema = eventFieldsSchema.partial().refine((value) => Object.keys(value).length > 0, "Provide at least one editable field.");
export const listQuerySchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(50),
});
export const weddingListQuerySchema = listQuerySchema.extend({ status: z.enum(weddingStatuses).optional() });
export type WeddingCreate = z.infer<typeof weddingCreateSchema>;
export type WeddingPatch = z.infer<typeof weddingPatchSchema>;
export type EventCreate = z.infer<typeof eventCreateSchema>;
export type EventPatch = z.infer<typeof eventPatchSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
