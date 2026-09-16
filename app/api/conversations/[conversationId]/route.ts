import { NextRequest } from "next/server";
import { chatService } from "@/modules/chat";
import { successResponse, errorResponse } from "@/lib/http/api-client";
import { getAuthUser } from "@/lib/http/auth-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    await getAuthUser(request);
    const { conversationId } = await params;
    const conversation = await chatService.getConversation(conversationId);
    return successResponse(conversation);
  } catch (error) {
    return errorResponse(error);
  }
}
