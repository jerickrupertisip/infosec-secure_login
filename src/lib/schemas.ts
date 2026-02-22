// src/lib/schemas.ts
import { z } from "zod";

export const authSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .max(64, 'Too long')
    .regex(/[0-9]/, 'At least one number')
    .regex(/[a-zA-Z]/, 'At least one letter')
});

// You can also export the Type for TypeScript support
export type AuthSchema = typeof authSchema;
