import { NextRequest } from "next/server";
import { chatService, CreateConversationSchema } from "@/modules/chat";
import { successResponse, errorResponse } from "@/lib/http/api-client";
import { getAuthUser } from "@/lib/http/auth-middleware";
import { badRequest } from "@/lib/http/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    await getAuthUser(request);
    const { projectId } = await params;
    const conversations = await chatService.getConversationsByProject(projectId);
    return successResponse(conversations);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    await getAuthUser(request);
    const { projectId } = await params;
    const body = await request.json();

    const parsed = CreateConversationSchema.safeParse({ ...body, projectId });

    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message || "Invalid request");
    }

    const conversation = await chatService.createConversation(parsed.data);
    return successResponse(conversation, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
