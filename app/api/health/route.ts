import { successResponse } from "@/lib/http/api-client";

export async function GET() {
  return successResponse({ status: "ok" });
}
