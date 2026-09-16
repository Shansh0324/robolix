import { create } from "zustand";
import type { GenerationStatus } from "@/types/generation.types";

interface GenerationState {
  currentGenerationId: string | null;
  status: GenerationStatus | null;
  progress: number;
  message: string | null;

  setGeneration: (id: string, status: GenerationStatus) => void;
  setProgress: (progress: number, message?: string) => void;
  setStatus: (status: GenerationStatus) => void;
  clearGeneration: () => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  currentGenerationId: null,
  status: null,
  progress: 0,
  message: null,

  setGeneration: (id, status) =>
    set({ currentGenerationId: id, status, progress: 0, message: null }),
  setProgress: (progress, message) =>
    set({ progress, ...(message !== undefined && { message }) }),
  setStatus: (status) => set({ status }),
  clearGeneration: () =>
    set({ currentGenerationId: null, status: null, progress: 0, message: null }),
}));
