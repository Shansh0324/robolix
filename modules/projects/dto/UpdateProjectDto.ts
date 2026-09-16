import { z } from "zod";

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
});

export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;
