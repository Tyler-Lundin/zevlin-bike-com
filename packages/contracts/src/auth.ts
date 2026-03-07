import { z } from "zod";

export const roleSchema = z.enum([
  "customer",
  "admin",
  "ops",
  "b2b_applicant",
  "b2b_customer",
  "team_editor",
]);

export const sessionSchema = z.object({
  userId: z.string().min(1),
  customerId: z.string().min(1).nullable().optional(),
  roles: z.array(roleSchema),
  mfaVerified: z.boolean(),
  issuedAt: z.number().int(),
  expiresAt: z.number().int(),
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type Role = z.infer<typeof roleSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
