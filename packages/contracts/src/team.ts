import { z } from "zod";

export const teamEventSignupSchema = z.object({
  eventId: z.string().uuid(),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).optional(),
  message: z.string().max(1000).optional(),
});

export type TeamEventSignupRequest = z.infer<typeof teamEventSignupSchema>;
