export const taskStatuses = ["TODO", "IN_PROGRESS", "DONE"] as const;
export const taskPriorities = ["LOW", "MEDIUM", "HIGH"] as const;
export type TaskDTO = {
  id: string; title: string; description: string | null; eventId: string | null;
  assigneeMembershipId: string | null; dueAt: string | null;
  priority: typeof taskPriorities[number]; status: typeof taskStatuses[number];
  notes?: string | null; completedAt: string | null; createdAt: string; updatedAt: string;
};
export type MemberDTO = { id: string; name: string; email: string; role: "OWNER" | "PLANNER" | "ADMIN" | "COLLABORATOR"; status: "ACTIVE" | "INVITED" | "REVOKED" };
