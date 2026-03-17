import { z } from "zod";
import { teamMembershipStatusSchema } from "./domain";

export const teamEventSignupSchema = z.object({
  eventId: z.string().uuid(),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).optional(),
  message: z.string().max(1000).optional(),
});

export const teamApplicationSchema = z.object({
  teamProgramId: z.string().uuid().optional(),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).optional(),
  city: z.string().min(2).optional(),
  ridingFocus: z.string().max(240).optional(),
  message: z.string().max(2_000).optional(),
  wantsDiscounts: z.boolean().default(true),
});

export const teamMembershipSummarySchema = z.object({
  membershipId: z.string().uuid(),
  teamProgramId: z.string().uuid(),
  customerId: z.string().uuid(),
  status: teamMembershipStatusSchema,
  startedAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
});

export type TeamEventSignupRequest = z.infer<typeof teamEventSignupSchema>;
export type TeamApplicationRequest = z.infer<typeof teamApplicationSchema>;
export type TeamMembershipSummary = z.infer<typeof teamMembershipSummarySchema>;
