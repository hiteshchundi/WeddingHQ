import type { WeddingExpense } from "../../fixtures/wedding";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 });
const decimal = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export function formatMoney(minor: number | null, compact = false) {
  if (minor === null) return "Not added";
  const absolute = Math.abs(minor);
  // Compact only when it preserves the recorded amount to the paise.
  if (compact && absolute >= 10000000 && minor % 100000 === 0) return `₹${decimal.format(minor / 10000000)}L`;
  if (compact && absolute >= 100000 && minor % 1000 === 0) return `₹${decimal.format(minor / 100000)}K`;
  return currency.format(minor / 100);
}

export function moneyInput(minor: number | null) {
  return minor === null ? "" : `${Math.floor(minor / 100)}.${String(minor % 100).padStart(2, "0")}`;
}

export function parseMoney(value: string): number | null {
  if (!value.trim()) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) throw new Error("Enter amounts of zero or more, with up to two decimal places.");
  const [rupees, paise = ""] = value.split(".");
  const minor = Number(rupees) * 100 + Number(paise.padEnd(2, "0"));
  if (!Number.isSafeInteger(minor)) throw new Error("This amount is too large. Enter a smaller amount.");
  return minor;
}

export function expenseTotals(expenses: WeddingExpense[]) {
  return expenses.reduce((total, expense) => ({
    estimated: total.estimated + (expense.estimatedAmountMinor ?? 0),
    actual: total.actual + (expense.actualAmountMinor ?? 0),
  }), { estimated: 0, actual: 0 });
}

export function expenseVariance(estimated: number | null, actual: number | null) {
  if (estimated === null || actual === null) return "Not enough amounts to compare";
  const difference = actual - estimated;
  return difference === 0 ? "On budget" : `${formatMoney(Math.abs(difference), true)} ${difference < 0 ? "under" : "over"}`;
}
