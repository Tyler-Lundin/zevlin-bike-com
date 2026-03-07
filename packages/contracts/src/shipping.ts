import { z } from "zod";

export const rateRequestSchema = z.object({
  orderId: z.string().uuid(),
});

export const rateOptionSchema = z.object({
  rateObjectId: z.string().min(1),
  carrier: z.string().min(1),
  service: z.string().min(1),
  amountCents: z.number().int().nonnegative(),
  currency: z.string().length(3),
  estimatedDays: z.number().int().positive().optional(),
});

export const purchaseLabelSchema = z.object({
  orderId: z.string().uuid(),
  rateObjectId: z.string().min(1),
  packageName: z.string().optional(),
  idempotencyKey: z.string().uuid(),
});

export const voidLabelSchema = z.object({
  shipmentId: z.string().uuid(),
  labelObjectId: z.string().min(1),
});

export const shippoWebhookSchema = z.object({
  event: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
  object_id: z.string().optional(),
});

export type RateRequest = z.infer<typeof rateRequestSchema>;
export type RateOption = z.infer<typeof rateOptionSchema>;
export type PurchaseLabelRequest = z.infer<typeof purchaseLabelSchema>;
export type VoidLabelRequest = z.infer<typeof voidLabelSchema>;
export type ShippoWebhookPayload = z.infer<typeof shippoWebhookSchema>;
