export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  attachments?: ChatAttachment[];
  createdAt: string;
}

export interface ChatAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  url?: string;
}

export interface ConversationSummary {
  id: string;
  projectId: string;
  title: string;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatContext {
  currentProject: {
    id: string;
  };
  currentModel?: {
    version: number;
    type: string;
  };
  recentMessages: ChatMessage[];
  references: string[];
  userInstruction: string;
}
