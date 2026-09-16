import { create } from "zustand";

interface ViewerState {
  autoRotate: boolean;
  wireframe: boolean;
  showGrid: boolean;
  isFullscreen: boolean;
  environment: string;

  setAutoRotate: (autoRotate: boolean) => void;
  setWireframe: (wireframe: boolean) => void;
  setShowGrid: (showGrid: boolean) => void;
  setFullscreen: (isFullscreen: boolean) => void;
  setEnvironment: (environment: string) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  autoRotate: true,
  wireframe: false,
  showGrid: true,
  isFullscreen: false,
  environment: "studio",
};

export const useViewerStore = create<ViewerState>((set) => ({
  ...defaultSettings,

  setAutoRotate: (autoRotate) => set({ autoRotate }),
  setWireframe: (wireframe) => set({ wireframe }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  setEnvironment: (environment) => set({ environment }),
  resetSettings: () => set(defaultSettings),
}));
