import { prisma } from "@/lib/prisma";
import type { CreateProjectDto } from "../dto/CreateProjectDto";
import type { UpdateProjectDto } from "../dto/UpdateProjectDto";

export class ProjectRepository {
  async create(userId: string, dto: CreateProjectDto) {
    return prisma.project.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
      },
      include: {
        _count: {
          select: { modelVersions: true },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: { modelVersions: true },
        },
      },
    });
  }

  async findAllByUser(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { modelVersions: true },
        },
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    return prisma.project.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
      include: {
        _count: {
          select: { modelVersions: true },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  }

  async isOwnedByUser(id: string, userId: string): Promise<boolean> {
    const count = await prisma.project.count({
      where: { id, userId },
    });
    return count > 0;
  }
}

export const projectRepository = new ProjectRepository();
