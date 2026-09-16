import { z } from "zod";

export const CreateConversationSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
});

export type CreateConversationDto = z.infer<typeof CreateConversationSchema>;
