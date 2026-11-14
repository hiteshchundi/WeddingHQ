export const vendorStatuses = ["PROSPECT", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
export type VendorDTO = {
  id: string; name: string; category: string; contact: { person: string | null; phone: string | null; email: string | null };
  eventIds: string[]; estimatedCostMinor: number | null; actualCostMinor: number | null; currency: string;
  responsibleMembershipId: string | null; status: typeof vendorStatuses[number]; notes: string | null;
};
export type ExpenseDTO = {
  id: string; name: string; category: string; eventId: string | null; vendorId: string | null;
  estimatedAmountMinor: number | null; actualAmountMinor: number | null; currency: string; notes: string | null;
};
export type ExpenseSummary = { currency: string; estimatedTotalMinor: number; actualTotalMinor: number; varianceMinor: number };
