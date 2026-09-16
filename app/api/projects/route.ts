import { NextRequest } from "next/server";
import { projectService, CreateProjectSchema } from "@/modules/projects";
import { successResponse, errorResponse } from "@/lib/http/api-client";
import { getAuthUser } from "@/lib/http/auth-middleware";
import { badRequest } from "@/lib/http/errors";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const projects = await projectService.getAllByUser(user.id);
    return successResponse(projects);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const body = await request.json();
    const parsed = CreateProjectSchema.safeParse(body);

    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message || "Invalid request");
    }

    const project = await projectService.create(user.id, parsed.data);
    return successResponse(project, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
