import "server-only";
import { checkSameOrigin, errorResponse } from "./api";
export async function guestRoute(request: Request, operation: () => Promise<Response>) {
  try { checkSameOrigin(request); return await operation(); }
  catch (error) { return errorResponse(error); }
}
