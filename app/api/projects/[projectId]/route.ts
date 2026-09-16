import { NextRequest } from "next/server";
import { projectService, UpdateProjectSchema } from "@/modules/projects";
import { successResponse, errorResponse } from "@/lib/http/api-client";
import { getAuthUser } from "@/lib/http/auth-middleware";
import { badRequest } from "@/lib/http/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { projectId } = await params;
    const project = await projectService.getById(projectId, user.id);
    return successResponse(project);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { projectId } = await params;
    const body = await request.json();
    const parsed = UpdateProjectSchema.safeParse(body);

    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message || "Invalid request");
    }

    const project = await projectService.update(projectId, user.id, parsed.data);
    return successResponse(project);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { projectId } = await params;
    await projectService.delete(projectId, user.id);
    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
