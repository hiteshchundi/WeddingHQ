export async function saveResource<T>(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  if (response.status === 204) return undefined as T;
  const result = await response.json();
  if (!response.ok) {
    const fields = result.error?.details?.fields;
    const detail = fields ? Object.entries(fields).map(([key, value]) => `${key}: ${value}`).join(" ") : "";
    throw new Error(detail || result.error?.message || "We couldn’t save your changes. Please try again.");
  }
  return result.data as T;
}
