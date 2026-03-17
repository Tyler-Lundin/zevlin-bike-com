import { z } from "zod";
import { b2bQuoteStatusSchema } from "./domain";

export const b2bBusinessTypeSchema = z.enum([
  "bike_shop",
  "retailer",
  "distributor",
  "team_or_club",
  "event_or_community",
  "other",
]);

export const b2bInquiryTypeSchema = z.enum([
  "wholesale",
  "retail_placement",
  "community_partnership",
  "event_support",
  "team_support",
  "other",
]);

export const b2bApplicationSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(7),
  businessType: b2bBusinessTypeSchema,
  location: z.string().min(2),
  inquiryType: b2bInquiryTypeSchema,
  taxId: z.string().min(3).optional(),
  website: z.string().url().optional(),
  notes: z.string().max(2000).optional(),
});

export const quoteRequestSchema = z.object({
  organizationId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  requestedShipDate: z.string().datetime().optional(),
  notes: z.string().max(2_000).optional(),
});

export const quoteResponseSchema = z.object({
  quoteId: z.string().uuid(),
  status: b2bQuoteStatusSchema,
  amountCents: z.number().int().nonnegative(),
  currency: z.string().length(3).default("USD"),
  validUntil: z.string().datetime().optional(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      variantId: z.string().uuid().optional(),
      quantity: z.number().int().positive(),
      unitPriceCents: z.number().int().nonnegative(),
      lineTotalCents: z.number().int().nonnegative(),
    }),
  ),
});

export type B2bApplicationRequest = z.infer<typeof b2bApplicationSchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type QuoteResponse = z.infer<typeof quoteResponseSchema>;
export type B2bBusinessType = z.infer<typeof b2bBusinessTypeSchema>;
export type B2bInquiryType = z.infer<typeof b2bInquiryTypeSchema>;
