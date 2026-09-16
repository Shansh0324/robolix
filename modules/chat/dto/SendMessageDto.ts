import { z } from "zod";

export const SendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1, "Message content is required").max(5000),
  attachmentIds: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
});

export type SendMessageDto = z.infer<typeof SendMessageSchema>;
