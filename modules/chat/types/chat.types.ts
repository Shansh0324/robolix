export interface ChatMessageResponse {
  id: string;
  conversationId: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  metadata?: Record<string, unknown>;
  attachments: {
    id: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }[];
  createdAt: string;
}

export interface ConversationResponse {
  id: string;
  projectId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
