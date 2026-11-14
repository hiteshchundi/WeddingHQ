// Integer minor-unit helpers shared by the prototype UI and server summaries.
export function currencyDigits(code = "INR") {
  return new Intl.NumberFormat("en", { style: "currency", currency: code }).resolvedOptions().maximumFractionDigits ?? 2;
}
export function formatMoney(minor: number | null, compact = false, code = "INR") {
  if (minor === null) return "Not added";
  if (!Number.isSafeInteger(minor)) throw new Error("The monetary value is outside the supported range.");
  const absolute = Math.abs(minor);
  const decimal = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
  if (code === "INR" && compact && absolute >= 10000000 && minor % 100000 === 0) return `₹${decimal.format(minor / 10000000)}L`;
  if (code === "INR" && compact && absolute >= 100000 && minor % 1000 === 0) return `₹${decimal.format(minor / 100000)}K`;
  const digits = currencyDigits(code), scale = BigInt(10) ** BigInt(digits), amount = BigInt(minor);
  const fraction = String((amount < BigInt(0) ? -amount : amount) % scale).padStart(digits, "0").replace(/0+$/, "");
  // Format the whole part as BigInt, then insert the exact minor-unit fraction.
  const whole = amount / scale;
  const formatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: code, minimumFractionDigits: digits, maximumFractionDigits: digits });
  return formatter.formatToParts(minor < 0 && whole === BigInt(0) ? -0 : whole).filter((part) => fraction || !["decimal", "fraction"].includes(part.type)).map((part) => part.type === "fraction" ? fraction : part.value).join("");
}
export function moneyInput(minor: number | null, code = "INR") {
  if (minor === null) return "";
  const digits = currencyDigits(code), scale = BigInt(10) ** BigInt(digits), value = BigInt(minor);
  return `${value / scale}${digits ? `.${String(value % scale).padStart(digits, "0")}` : ""}`;
}
export function parseMoney(value: string, code = "INR"): number | null {
  if (!value.trim()) return null;
  const digits = currencyDigits(code);
  if (!new RegExp(`^\\d+${digits ? `(?:\\.\\d{1,${digits}})?` : ""}$`).test(value)) throw new Error(`Enter amounts of zero or more, with up to ${digits} decimal places.`);
  const [major, fraction = ""] = value.split(".");
  const minor = BigInt(major) * BigInt(10) ** BigInt(digits) + BigInt(fraction.padEnd(digits, "0") || "0");
  if (minor > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("This amount is too large. Enter a smaller amount.");
  return Number(minor);
}
export function expenseTotals(expenses: { estimatedAmountMinor?: number | null; actualAmountMinor?: number | null }[]) {
  let estimated = BigInt(0), actual = BigInt(0);
  for (const expense of expenses) {
    for (const value of [expense.estimatedAmountMinor, expense.actualAmountMinor]) if (value != null && (!Number.isSafeInteger(value) || value < 0)) throw new Error("Invalid integer minor-unit amount.");
    estimated += BigInt(expense.estimatedAmountMinor ?? 0); actual += BigInt(expense.actualAmountMinor ?? 0);
  }
  if (estimated > BigInt(Number.MAX_SAFE_INTEGER) || actual > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("Expense totals exceed the supported safe integer range.");
  return { estimated: Number(estimated), actual: Number(actual) };
}
export function expenseVariance(estimated: number | null, actual: number | null, code = "INR") {
  if (estimated === null || actual === null) return "Not enough amounts to compare";
  const difference = actual - estimated;
  return difference === 0 ? "On estimate" : `${formatMoney(Math.abs(difference), true, code)} ${difference < 0 ? "under" : "over"} estimate`;
}
