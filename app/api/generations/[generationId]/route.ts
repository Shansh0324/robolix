import { NextRequest } from "next/server";
import { generationOrchestrator } from "@/modules/generation/services/GenerationOrchestrator";
import { successResponse, errorResponse } from "@/lib/http/api-client";
import { getAuthUser } from "@/lib/http/auth-middleware";
import { notFound } from "@/lib/http/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ generationId: string }> }
) {
  try {
    await getAuthUser(request);
    const { generationId } = await params;
    
    const generation = await generationOrchestrator.getStatus(generationId);
    if (!generation) throw notFound("GENERATION_NOT_FOUND", "Generation not found");

    return successResponse(generation);
  } catch (error) {
    return errorResponse(error);
  }
}
