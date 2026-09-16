import { projectRepository } from "../repositories/ProjectRepository";
import { notFound, unauthorized } from "@/lib/http/errors";
import type { CreateProjectDto } from "../dto/CreateProjectDto";
import type { UpdateProjectDto } from "../dto/UpdateProjectDto";
import type { ProjectSummary } from "../types/project.types";

function toSummary(project: {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { modelVersions: number };
}): ProjectSummary {
  return {
    id: project.id,
    userId: project.userId,
    name: project.name,
    description: project.description,
    versionsCount: project._count.modelVersions,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export class ProjectService {
  async create(userId: string, dto: CreateProjectDto): Promise<ProjectSummary> {
    const project = await projectRepository.create(userId, dto);
    return toSummary(project);
  }

  async getById(id: string, userId: string): Promise<ProjectSummary> {
    const project = await projectRepository.findById(id);
    if (!project) throw notFound("PROJECT_NOT_FOUND", "Project not found");
    if (project.userId !== userId) throw unauthorized("Not authorized to access this project");
    return toSummary(project);
  }

  async getAllByUser(userId: string): Promise<ProjectSummary[]> {
    const projects = await projectRepository.findAllByUser(userId);
    return projects.map(toSummary);
  }

  async update(id: string, userId: string, dto: UpdateProjectDto): Promise<ProjectSummary> {
    const owned = await projectRepository.isOwnedByUser(id, userId);
    if (!owned) throw notFound("PROJECT_NOT_FOUND", "Project not found");
    const project = await projectRepository.update(id, dto);
    return toSummary(project);
  }

  async delete(id: string, userId: string): Promise<void> {
    const owned = await projectRepository.isOwnedByUser(id, userId);
    if (!owned) throw notFound("PROJECT_NOT_FOUND", "Project not found");
    await projectRepository.delete(id);
  }
}

export const projectService = new ProjectService();
