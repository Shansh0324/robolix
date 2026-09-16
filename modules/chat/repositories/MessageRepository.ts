import { prisma } from "@/lib/prisma";
// Removed MessageRole import as it is now a plain string in SQLite

export class MessageRepository {
  async create(data: {
    conversationId: string;
    role: "USER" | "ASSISTANT" | "SYSTEM";
    content: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
      include: {
        attachments: true,
      },
    });
  }

  async findByConversation(conversationId: string, limit: number = 50) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: limit,
      include: {
        attachments: true,
      },
    });
  }

  async getRecentMessages(conversationId: string, count: number = 10) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: count,
      include: {
        attachments: true,
      },
    });
    return messages.reverse();
  }
}

export const messageRepository = new MessageRepository();
