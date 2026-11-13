import { apiRoute, dataResponse, readBody } from "../../../../lib/api";
import { weddingCreateSchema, weddingListQuerySchema } from "../../../../lib/validation";
import { createWedding, listWeddings } from "../../../../services/weddings";

export const runtime = "nodejs";
export function GET(request: Request) {
  return apiRoute(request, async () => Response.json(await listWeddings(weddingListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams))), { headers: { "Cache-Control": "private, no-store" } }));
}
export function POST(request: Request) {
  return apiRoute(request, async () => dataResponse(await createWedding(await readBody(request, weddingCreateSchema)), 201));
}
