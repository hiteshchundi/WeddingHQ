import { ExpensesPage } from "../../../../components/wedding/expenses-page";
import { getWeddingExpenses, getExpenseSummary } from "../../../../services/expenses";
import { pageData } from "../../../../lib/page-access";
export default async function Expenses({ params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const [expenses, summary] = weddingId === "demo" ? [undefined, undefined] : await Promise.all([pageData(() => getWeddingExpenses(weddingId)), pageData(() => getExpenseSummary(weddingId))]);
  return <ExpensesPage key={weddingId} initialExpenses={expenses} initialSummary={summary} />;
}
