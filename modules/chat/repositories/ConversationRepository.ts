import { prisma } from "@/lib/prisma";

export class ConversationRepository {
  async create(data: { projectId: string; title?: string }) {
    return prisma.conversation.create({
      data: {
        projectId: data.projectId,
        title: data.title ?? "New Conversation",
      },
    });
  }

  async findById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
    });
  }

  async findByProject(projectId: string) {
    return prisma.conversation.findMany({
      where: { projectId },
      orderBy: { updatedAt: "desc" },
    });
  }

  async updateTitle(id: string, title: string) {
    return prisma.conversation.update({
      where: { id },
      data: { title },
    });
  }
}

export const conversationRepository = new ConversationRepository();
