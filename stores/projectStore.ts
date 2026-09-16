import { create } from "zustand";
import type { ProjectSummary } from "@/modules/projects/types/project.types";

interface ProjectState {
  currentProject: ProjectSummary | null;
  projects: ProjectSummary[];

  setCurrentProject: (project: ProjectSummary | null) => void;
  setProjects: (projects: ProjectSummary[]) => void;
  addProject: (project: ProjectSummary) => void;
  removeProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  projects: [],

  setCurrentProject: (currentProject) => set({ currentProject }),
  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    })),
}));
