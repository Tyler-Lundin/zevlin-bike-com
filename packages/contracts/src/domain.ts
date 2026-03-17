import { z } from "zod";

export const salesChannelValues = ["store", "b2b", "admin", "customer", "landing", "team"] as const;
export const organizationTypeValues = [
  "retailer",
  "distributor",
  "cycling_team",
  "sponsor",
  "club",
  "event_partner",
  "internal",
] as const;
export const organizationMembershipRoleValues = [
  "owner",
  "admin",
  "buyer",
  "finance",
  "rider",
  "coach",
  "member",
] as const;
export const teamMembershipStatusValues = [
  "applied",
  "pending_review",
  "active",
  "paused",
  "retired",
  "rejected",
] as const;
export const b2bQuoteStatusValues = ["draft", "sent", "accepted", "expired", "cancelled"] as const;
export const benefitTypeValues = [
  "discount_code",
  "price_list_access",
  "event_access",
  "product_credit",
  "content_access",
] as const;
export const paymentProviderValues = ["stripe", "manual"] as const;
export const shippingProviderValues = ["shippo", "manual"] as const;
export const consentTypeValues = [
  "newsletter_email",
  "product_updates_email",
  "b2b_email",
  "team_email",
  "sms",
] as const;

export const salesChannelSchema = z.enum(salesChannelValues);
export const organizationTypeSchema = z.enum(organizationTypeValues);
export const organizationMembershipRoleSchema = z.enum(organizationMembershipRoleValues);
export const teamMembershipStatusSchema = z.enum(teamMembershipStatusValues);
export const b2bQuoteStatusSchema = z.enum(b2bQuoteStatusValues);
export const benefitTypeSchema = z.enum(benefitTypeValues);
export const paymentProviderSchema = z.enum(paymentProviderValues);
export const shippingProviderSchema = z.enum(shippingProviderValues);
export const consentTypeSchema = z.enum(consentTypeValues);

export type SalesChannel = z.infer<typeof salesChannelSchema>;
export type OrganizationType = z.infer<typeof organizationTypeSchema>;
export type OrganizationMembershipRole = z.infer<typeof organizationMembershipRoleSchema>;
export type TeamMembershipStatus = z.infer<typeof teamMembershipStatusSchema>;
export type B2bQuoteStatus = z.infer<typeof b2bQuoteStatusSchema>;
export type BenefitType = z.infer<typeof benefitTypeSchema>;
export type PaymentProvider = z.infer<typeof paymentProviderSchema>;
export type ShippingProvider = z.infer<typeof shippingProviderSchema>;
export type ConsentType = z.infer<typeof consentTypeSchema>;
