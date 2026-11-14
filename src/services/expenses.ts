import "server-only";
import mongoose from "mongoose";
import { ApiError, assertId } from "../lib/api";
import type { ExpenseInput, ExpensePatch, ExpenseQuery } from "../lib/finance-validation";
import { ExpenseModel, type ExpenseRecord } from "../models/expense";
import { VendorModel } from "../models/vendor";
import { EventModel } from "../models/event";
import { WeddingModel } from "../models/wedding";
import { AuditLogModel } from "../models/audit-log";
import { expenseTotals } from "../components/wedding/money";
import { accessWedding } from "./weddings";
import type { ExpenseDTO, ExpenseSummary } from "../types/finance";
function expenseDTO(row: ExpenseRecord & { _id: mongoose.Types.ObjectId }): ExpenseDTO {
  return { id: String(row._id), name: row.name, category: row.category, eventId: row.eventId ? String(row.eventId) : null, vendorId: row.vendorId ? String(row.vendorId) : null,
    estimatedAmountMinor: row.estimatedAmountMinor ?? null, actualAmountMinor: row.actualAmountMinor ?? null, currency: row.currency, notes: row.notes ?? null };
}
export async function listExpenses(weddingId: string, query: ExpenseQuery, all = false) {
  await accessWedding(weddingId, true);
  const filter = { weddingId, ...(query.category ? { category: query.category } : {}), ...(query.eventId ? { eventId: query.eventId } : {}), ...(query.vendorId ? { vendorId: query.vendorId } : {}) };
  const cursor = ExpenseModel.find(filter).sort({ createdAt: -1, _id: 1 });
  const [rows, total] = await Promise.all([all ? cursor : cursor.skip((query.page - 1) * query.limit).limit(query.limit), ExpenseModel.countDocuments(filter)]);
  return { data: rows.map(expenseDTO), meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
}
export async function getWeddingExpenses(weddingId: string) { return (await listExpenses(weddingId, { page: 1, limit: 100 }, true)).data; }
export async function getExpenseSummary(weddingId: string): Promise<ExpenseSummary> {
  const { wedding } = await accessWedding(weddingId, true);
  // Expense records ONLY. Exact integer sums; no Vendor cost lookup or denormalisation.
  const rows = await ExpenseModel.find({ weddingId }).select("estimatedAmountMinor actualAmountMinor currency").lean();
  if (rows.some((row) => row.currency !== wedding.currency)) throw new ApiError(409, "CURRENCY_MISMATCH", "Expense currencies do not match this wedding.");
  try {
    const totals = expenseTotals(rows);
    return { currency: wedding.currency, estimatedTotalMinor: totals.estimated, actualTotalMinor: totals.actual, varianceMinor: totals.actual - totals.estimated };
  } catch { throw new ApiError(409, "FINANCIAL_TOTAL_OUT_OF_RANGE", "Expense totals exceed the supported integer range."); }
}
export async function getExpense(weddingId: string, expenseId: string) {
  await accessWedding(weddingId, true); assertId(expenseId);
  const row = await ExpenseModel.findOne({ _id: expenseId, weddingId });
  if (!row) throw new ApiError(404, "EXPENSE_NOT_FOUND", "Expense not found.");
  return expenseDTO(row);
}
export async function saveExpense(weddingId: string, expenseId: string | null, input: ExpenseInput | ExpensePatch) {
  const { membership } = await accessWedding(weddingId, true); if (expenseId) assertId(expenseId);
  await Promise.all([ExpenseModel.init(), AuditLogModel.init()]);
  return mongoose.connection.transaction(async (session) => {
    const wedding = await WeddingModel.findOneAndUpdate({ _id: weddingId }, { $inc: { __v: 1 } }, { session, timestamps: false, returnDocument: "after" });
    if (!wedding) throw new ApiError(404, "NOT_FOUND", "Wedding not found.");
    if (input.currency && input.currency !== wedding.currency) throw new ApiError(422, "CURRENCY_MISMATCH", "Use the wedding currency.");
    const row = expenseId ? await ExpenseModel.findOne({ _id: expenseId, weddingId }).session(session) : new ExpenseModel({ weddingId, createdByMembershipId: membership._id });
    if (!row) throw new ApiError(404, "EXPENSE_NOT_FOUND", "Expense not found.");
    const eventId = input.eventId === undefined ? row.eventId : input.eventId;
    const vendorId = input.vendorId === undefined ? row.vendorId : input.vendorId;
    if (eventId && !await EventModel.findOneAndUpdate({ _id: eventId, weddingId }, { $inc: { __v: 1 } }, { session, timestamps: false })) throw new ApiError(422, "INVALID_EVENT", "Choose an Event from this wedding.");
    if (vendorId && !await VendorModel.findOneAndUpdate({ _id: vendorId, weddingId }, { $inc: { __v: 1 } }, { session, timestamps: false })) throw new ApiError(422, "INVALID_VENDOR", "Choose a Vendor from this wedding.");
    row.set({ ...input, currency: wedding.currency }); await row.save({ session });
    try { expenseTotals(await ExpenseModel.find({ weddingId }).select("estimatedAmountMinor actualAmountMinor").session(session).lean()); }
    catch { throw new ApiError(422, "FINANCIAL_TOTAL_OUT_OF_RANGE", "These amounts would exceed the supported total range."); }
    await AuditLogModel.create([{ weddingId, actorType: "USER", actorMembershipId: membership._id, action: expenseId ? "EXPENSE_UPDATED" : "EXPENSE_CREATED", entityType: "EXPENSE", entityId: row._id }], { session });
    return expenseDTO(row);
  });
}
export async function deleteExpense(weddingId: string, expenseId: string) {
  await accessWedding(weddingId, true); assertId(expenseId);
  if (!(await ExpenseModel.deleteOne({ _id: expenseId, weddingId })).deletedCount) throw new ApiError(404, "EXPENSE_NOT_FOUND", "Expense not found.");
}
