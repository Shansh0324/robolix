import { messageRepository } from "../repositories/MessageRepository";
import { conversationRepository } from "../repositories/ConversationRepository";
import { notFound } from "@/lib/http/errors";
import { generationOrchestrator } from "@/modules/generation/services/GenerationOrchestrator";
import type { SendMessageDto } from "../dto/SendMessageDto";
import type { CreateConversationDto } from "../dto/CreateConversationDto";
import type { ChatMessageResponse, ConversationResponse } from "../types/chat.types";
import { logger } from "@/lib/utils/logger";

function toMessageResponse(message: {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  metadata: string | null;
  createdAt: Date;
  attachments?: {
    id: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }[];
}): ChatMessageResponse {
  return {
    id: message.id,
    conversationId: message.conversationId,
    role: message.role as "USER" | "ASSISTANT" | "SYSTEM",
    content: message.content,
    metadata: message.metadata ? JSON.parse(message.metadata) : undefined,
    attachments: (message.attachments || []).map((a) => ({
      id: a.id,
      fileName: a.fileName,
      mimeType: a.mimeType,
      fileSize: a.fileSize,
    })),
    createdAt: message.createdAt.toISOString(),
  };
}

function toConversationResponse(conv: {
  id: string;
  projectId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}): ConversationResponse {
  return {
    id: conv.id,
    projectId: conv.projectId,
    title: conv.title,
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
  };
}

export class ChatService {
  async createConversation(dto: CreateConversationDto): Promise<ConversationResponse> {
    const conversation = await conversationRepository.create({
      projectId: dto.projectId,
      title: dto.title,
    });
    logger.info("Conversation created", { conversationId: conversation.id, projectId: dto.projectId });
    return toConversationResponse(conversation);
  }

  async getConversation(id: string): Promise<ConversationResponse> {
    const conversation = await conversationRepository.findById(id);
    if (!conversation) throw notFound("CONVERSATION_NOT_FOUND", "Conversation not found");
    return toConversationResponse(conversation);
  }

  async getConversationsByProject(projectId: string): Promise<ConversationResponse[]> {
    const conversations = await conversationRepository.findByProject(projectId);
    return conversations.map(toConversationResponse);
  }

  async sendMessage(dto: SendMessageDto): Promise<ChatMessageResponse> {
    // Verify conversation exists
    const conversation = await conversationRepository.findById(dto.conversationId);
    if (!conversation) throw notFound("CONVERSATION_NOT_FOUND", "Conversation not found");

    // Save user message
    const message = await messageRepository.create({
      conversationId: dto.conversationId,
      role: "USER",
      content: dto.content,
      metadata: dto.imageUrl ? { imageUrl: dto.imageUrl } : undefined,
    });

    logger.info("Message sent", { conversationId: dto.conversationId });

    // Trigger AI Generation Pipeline
    // This will run in the background and eventually add the ASSISTANT message to the conversation.
    await generationOrchestrator.startGeneration(
      conversation.projectId,
      conversation.id,
      dto.content,
      !!dto.imageUrl, // hasImage
      dto.imageUrl
    );

    // Return the user message immediately
    return toMessageResponse(message);
  }

  async getMessages(conversationId: string): Promise<ChatMessageResponse[]> {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) throw notFound("CONVERSATION_NOT_FOUND", "Conversation not found");

    const messages = await messageRepository.findByConversation(conversationId);
    return messages.map(toMessageResponse);
  }

}

export const chatService = new ChatService();
