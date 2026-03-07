import { z } from "zod";

export const b2bApplicationSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(7),
  taxId: z.string().min(3),
  website: z.string().url().optional(),
  notes: z.string().max(2000).optional(),
});

export const quoteRequestSchema = z.object({
  accountId: z.string().uuid(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  requestedShipDate: z.string().datetime().optional(),
});

export type B2bApplicationRequest = z.infer<typeof b2bApplicationSchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
