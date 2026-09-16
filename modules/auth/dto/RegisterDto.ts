import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(100),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
