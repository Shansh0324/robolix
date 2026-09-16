export type GenerationStatus =
  | "QUEUED"
  | "ANALYZING"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type GenerationType =
  | "TEXT_TO_3D"
  | "IMAGE_TO_3D"
  | "MODIFY"
  | "REGENERATE";

export type GenerationQuality = "FAST" | "STANDARD" | "HIGH";

export type UserIntent =
  | "GENERATE_MODEL"
  | "REGENERATE_MODEL"
  | "MODIFY_MODEL"
  | "CHANGE_COLOR"
  | "CHANGE_MATERIAL"
  | "CHANGE_STYLE"
  | "ANALYZE_MODEL"
  | "OPTIMIZE_MODEL"
  | "EXPORT_MODEL";

export interface GenerationSummary {
  id: string;
  projectId: string;
  conversationId: string;
  status: GenerationStatus;
  prompt: string;
  generationType: GenerationType;
  aiProvider?: string;
  modelProvider?: string;
  modelName?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationInstruction {
  intent: UserIntent;
  mode: "TEXT_TO_3D" | "IMAGE_TO_3D";
  object: string;
  description?: string;
  style?: string;
  materials?: string[];
  colors?: string[];
  preserveReference?: boolean;
  quality: GenerationQuality;
  modelPreference?: string;
  instructions: string[];
}

export interface GenerationProgress {
  generationId: string;
  status: GenerationStatus;
  progress?: number;
  message?: string;
}
