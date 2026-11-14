import { z } from "zod";
import { listQuerySchema } from "./validation";
const text = (length: number) => z.string().trim().max(length);
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Enter a valid resource ID.").transform((id) => id.toLowerCase());
const eventIds = z.array(objectIdSchema).max(100).refine((ids) => new Set(ids).size === ids.length, "Do not repeat an event assignment.");
export const assignmentSchema = z.strictObject({ eventIds });
export const householdCreateSchema = z.strictObject({
  householdName: text(200).min(1, "Household name is required."),
  primaryContact: z.strictObject({ name: text(200).optional(), email: z.email().max(254).transform((email) => email.toLowerCase()).nullable().optional(), phone: text(100).optional() }).optional(),
  adultsInvited: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  childrenInvited: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  members: z.array(z.strictObject({ name: text(200).min(1) })).max(200).optional(),
  notes: text(5000).nullable().optional(), eventIds: eventIds.optional(),
});
export const householdPatchSchema = householdCreateSchema.partial().refine((input) => Object.keys(input).length > 0, "Provide an editable field.");
export const householdQuerySchema = listQuerySchema.extend({
  q: text(200).optional(), eventId: objectIdSchema.optional(),
  // Filtering actual RSVP responses is deferred. Reject these explicitly in H4.
  rsvpResponse: z.enum(["YES", "NO", "MAYBE", "AWAITING"]).optional(),
});
export const exportQuerySchema = z.strictObject({ format: z.enum(["csv", "xlsx"]), eventId: objectIdSchema.optional(), rsvpResponse: z.enum(["YES", "NO", "MAYBE", "AWAITING"]).optional() });
export const importConfirmSchema = z.strictObject({
  previewProof: z.string().min(1).max(1_500_000),
  duplicatePolicy: z.enum(["FAIL", "SKIP"]).default("FAIL"),
  importAnywayRows: z.array(z.number().int().min(2).max(1_048_576)).max(1000).default([]),
});
export type HouseholdCreate = z.infer<typeof householdCreateSchema>;
export type HouseholdPatch = z.infer<typeof householdPatchSchema>;
export type HouseholdQuery = z.infer<typeof householdQuerySchema>;
export type ImportConfirm = z.infer<typeof importConfirmSchema>;
