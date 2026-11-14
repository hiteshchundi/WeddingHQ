import "server-only";
import mongoose from "mongoose";
import { WeddingMembershipModel } from "../models/wedding-membership";
import { accessWedding } from "./weddings";
import type { MemberDTO } from "../types/task";

export async function getWeddingMembers(weddingId: string): Promise<MemberDTO[]> {
  await accessWedding(weddingId, true);
  const memberships = await WeddingMembershipModel.find({ weddingId }).sort({ createdAt: 1, _id: 1 });
  const users = await mongoose.connection.db!.collection("users").find({ _id: { $in: memberships.flatMap((member) => member.userId ? [member.userId] : []) } }, { projection: { name: 1 } }).toArray();
  const names = new Map(users.map((user) => [String(user._id), typeof user.name === "string" ? user.name : ""]));
  return memberships.map((member) => ({ id: String(member._id), name: names.get(String(member.userId)) || member.email, email: member.email, role: member.role, status: member.status }));
}
