"use client";

import { useCallback, useSyncExternalStore } from "react";
import { weddingFixture, type WeddingTask } from "../../fixtures/wedding";

// A tab-local demo handoff, not business persistence or access control.
const stores = new Map<string, { tasks: WeddingTask[]; listeners: Set<() => void> }>();
const storageKey = (weddingId: string) => `wedding-hq:demo-tasks:v1:${weddingId}`;
const serverSnapshot = () => weddingFixture.tasks;

function isTask(value: unknown): value is WeddingTask {
  if (!value || typeof value !== "object") return false;
  const task = value as Record<string, unknown>;
  return ["id", "title", "description", "notes", "dueAt"].every((key) => typeof task[key] === "string")
    && typeof task.id === "string" && task.id.length > 0
    && Number.isFinite(Date.parse(task.dueAt as string))
    && (task.assigneeMembershipId === null || typeof task.assigneeMembershipId === "string")
    && (task.eventId === null || typeof task.eventId === "string")
    && ["LOW", "MEDIUM", "HIGH"].includes(task.priority as string)
    && ["TODO", "IN_PROGRESS", "DONE"].includes(task.status as string);
}

function getStore(weddingId: string) {
  let store = stores.get(weddingId);
  if (!store) {
    let tasks = weddingFixture.tasks;
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(storageKey(weddingId)) ?? "null");
      if (Array.isArray(saved) && saved.every(isTask) && new Set(saved.map((task) => task.id)).size === saved.length) tasks = saved;
    } catch {
      // Blocked storage or stale demo data should never stop the walkthrough.
    }
    store = { tasks, listeners: new Set() };
    stores.set(weddingId, store);
  }
  return store;
}

export function useDemoTasks(weddingId: string) {
  const subscribe = useCallback((listener: () => void) => {
    const store = getStore(weddingId);
    store.listeners.add(listener);
    return () => { store.listeners.delete(listener); };
  }, [weddingId]);
  const getSnapshot = useCallback(() => getStore(weddingId).tasks, [weddingId]);
  const tasks = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
  const setTasks = useCallback((update: (current: WeddingTask[]) => WeddingTask[]) => {
    const store = getStore(weddingId);
    store.tasks = update(store.tasks);
    try {
      sessionStorage.setItem(storageKey(weddingId), JSON.stringify(store.tasks));
    } catch {
      // Keep in-memory editing usable when browser storage is unavailable.
    }
    store.listeners.forEach((listener) => listener());
  }, [weddingId]);
  return [tasks, setTasks] as const;
}
