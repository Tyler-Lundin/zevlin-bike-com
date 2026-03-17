import { z } from "zod";
import {
  paymentProviderSchema,
  salesChannelSchema,
  shippingProviderSchema,
} from "./domain";

export const addressSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().length(2),
});

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative(),
  weightGrams: z.number().int().positive().optional(),
});

export const createOrderSchema = z.object({
  customerId: z.string().uuid().nullable().optional(),
  buyerOrganizationId: z.string().uuid().nullable().optional(),
  items: z.array(orderItemSchema).min(1),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  source: salesChannelSchema,
  channel: salesChannelSchema.optional(),
  currency: z.string().length(3).default("USD"),
  email: z.string().email().optional(),
});

export const orderAdjustmentSchema = z.object({
  type: z.string().min(1),
  label: z.string().min(1),
  amountCents: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const paymentAttemptSchema = z.object({
  orderId: z.string().uuid(),
  provider: paymentProviderSchema,
  status: z.string().min(1),
  amountCents: z.number().int().nonnegative(),
  currency: z.string().length(3).default("USD"),
  externalCheckoutSessionId: z.string().optional(),
  externalPaymentIntentId: z.string().optional(),
});

export const shipmentSummarySchema = z.object({
  shipmentId: z.string().uuid(),
  orderId: z.string().uuid(),
  provider: shippingProviderSchema,
  status: z.string().min(1),
  carrier: z.string().optional(),
  service: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
  labelUrl: z.string().url().optional(),
});

export const returnItemSchema = z.object({
  orderItemId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().positive(),
  condition: z.string().max(120).optional(),
  resolution: z.string().max(120).optional(),
});

export const returnRequestSubmissionSchema = z.object({
  orderId: z.string().uuid().optional(),
  orderNumber: z.string().min(2).max(80).optional(),
  customerId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  reason: z.string().min(2).max(500),
  items: z.array(returnItemSchema).default([]),
  message: z.string().max(5_000).optional(),
});

export const discountEligibilitySchema = z.object({
  customerId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  teamMembershipId: z.string().uuid().optional(),
  discountCode: z.string().trim().min(2).optional(),
});

export type Address = z.infer<typeof addressSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type CreateOrderRequest = z.infer<typeof createOrderSchema>;
export type OrderAdjustment = z.infer<typeof orderAdjustmentSchema>;
export type PaymentAttempt = z.infer<typeof paymentAttemptSchema>;
export type ShipmentSummary = z.infer<typeof shipmentSummarySchema>;
export type ReturnItem = z.infer<typeof returnItemSchema>;
export type ReturnRequestSubmission = z.infer<typeof returnRequestSubmissionSchema>;
export type DiscountEligibility = z.infer<typeof discountEligibilitySchema>;
