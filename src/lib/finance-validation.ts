import { z } from "zod";
import { listQuerySchema } from "./validation";
import { vendorStatuses } from "../types/finance";
const id = z.string().regex(/^[a-f\d]{24}$/i, "Choose a valid record.");
const money = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable().optional();
const text = (max: number) => z.string().trim().max(max);
const currency = z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).optional();
const vendorFields = {
  name: text(200).min(1), category: text(100).min(1),
  contact: z.strictObject({ person: text(200).nullable().optional(), phone: text(50).nullable().optional(), email: z.email().max(254).nullable().optional() }).optional(),
  eventIds: z.array(id).max(100).optional(), estimatedCostMinor: money, actualCostMinor: money, currency,
  responsibleMembershipId: id.nullable().optional(), status: z.enum(vendorStatuses).optional(), notes: text(5000).nullable().optional(),
};
const expenseFields = { name: text(200).min(1), category: text(100).min(1), eventId: id.nullable().optional(), vendorId: id.nullable().optional(), estimatedAmountMinor: money, actualAmountMinor: money, currency, notes: text(5000).nullable().optional() };
export const vendorCreateSchema = z.strictObject(vendorFields);
export const vendorPatchSchema = z.strictObject(vendorFields).partial().refine((input) => Object.keys(input).length > 0, "Provide an editable field.");
export const expenseCreateSchema = z.strictObject(expenseFields);
export const expensePatchSchema = z.strictObject(expenseFields).partial().refine((input) => Object.keys(input).length > 0, "Provide an editable field.");
export const vendorQuerySchema = listQuerySchema.extend({ category: text(100).optional(), eventId: id.optional(), status: z.enum(vendorStatuses).optional(), q: text(200).optional() });
export const expenseQuerySchema = listQuerySchema.extend({ category: text(100).optional(), eventId: id.optional(), vendorId: id.optional() });
export type VendorInput = z.infer<typeof vendorCreateSchema>; export type VendorPatch = z.infer<typeof vendorPatchSchema>; export type VendorQuery = z.infer<typeof vendorQuerySchema>;
export type ExpenseInput = z.infer<typeof expenseCreateSchema>; export type ExpensePatch = z.infer<typeof expensePatchSchema>; export type ExpenseQuery = z.infer<typeof expenseQuerySchema>;
