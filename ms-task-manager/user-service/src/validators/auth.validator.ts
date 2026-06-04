import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(4),
  email: z.email().optional(),
  password: z.string().min(4),
});

export const loginSchema = z.object({
  username: z.string().min(4),
  password: z.string().min(4),
});
