import { NextRequest } from "next/server";
import { chatService, SendMessageSchema } from "@/modules/chat";
import { successResponse, errorResponse } from "@/lib/http/api-client";
import { getAuthUser } from "@/lib/http/auth-middleware";
import { badRequest } from "@/lib/http/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    await getAuthUser(request);
    const { conversationId } = await params;
    const messages = await chatService.getMessages(conversationId);
    return successResponse(messages);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    await getAuthUser(request);
    const { conversationId } = await params;
    const body = await request.json();

    const parsed = SendMessageSchema.safeParse({
      ...body,
      conversationId,
    });

    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message || "Invalid request");
    }

    const message = await chatService.sendMessage(parsed.data);
    return successResponse(message, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
