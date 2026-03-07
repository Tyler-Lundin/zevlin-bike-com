import { z } from "zod";

export const newsletterSignupSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  source: z.string().trim().max(120).optional(),
});

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(5).max(5_000),
});

export const returnRequestSchema = z.object({
  orderNumber: z.string().trim().min(2).max(80),
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  message: z.string().trim().max(5_000).optional(),
});

export const analyticsEventSchema = z.object({
  eventName: z.string().trim().min(2).max(120),
  pagePath: z.string().trim().min(1).max(255).optional(),
  channel: z.enum(["web", "server"]).default("web"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const privacyRequestSchema = z
  .object({
    requestType: z.enum(["access", "deletion", "correction", "portability", "do_not_sell", "other"]),
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email(),
    jurisdiction: z.string().trim().max(120).optional(),
    message: z.string().trim().max(5_000).optional(),
    source: z.string().trim().max(120).optional(),
    consent: z.boolean(),
    website: z.string().trim().max(240).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.consent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["consent"],
        message: "Consent is required",
      });
    }
  });

export type NewsletterSignupRequest = z.infer<typeof newsletterSignupSchema>;
export type ContactSubmissionRequest = z.infer<typeof contactSubmissionSchema>;
export type ReturnRequest = z.infer<typeof returnRequestSchema>;
export type AnalyticsEventRequest = z.infer<typeof analyticsEventSchema>;
export type PrivacyRequest = z.infer<typeof privacyRequestSchema>;
