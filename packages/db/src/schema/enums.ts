import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "customer",
  "admin",
  "ops",
  "b2b_applicant",
  "b2b_customer",
  "team_editor",
]);

export const salesChannelEnum = pgEnum("sales_channel", [
  "store",
  "b2b",
  "admin",
  "customer",
  "landing",
  "team",
]);

export const organizationTypeEnum = pgEnum("organization_type", [
  "retailer",
  "distributor",
  "cycling_team",
  "sponsor",
  "club",
  "event_partner",
  "internal",
]);

export const organizationMembershipRoleEnum = pgEnum("organization_membership_role", [
  "owner",
  "admin",
  "buyer",
  "finance",
  "rider",
  "coach",
  "member",
]);

export const organizationMembershipStatusEnum = pgEnum("organization_membership_status", [
  "pending",
  "active",
  "inactive",
  "revoked",
]);

export const teamMembershipStatusEnum = pgEnum("team_membership_status", [
  "applied",
  "pending_review",
  "active",
  "paused",
  "retired",
  "rejected",
]);

export const teamApplicationStatusEnum = pgEnum("team_application_status", [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "withdrawn",
]);

export const teamRegistrationStatusEnum = pgEnum("team_registration_status", [
  "pending",
  "confirmed",
  "waitlisted",
  "cancelled",
  "checked_in",
]);

export const benefitTypeEnum = pgEnum("benefit_type", [
  "discount_code",
  "price_list_access",
  "event_access",
  "product_credit",
  "content_access",
]);

export const consentTypeEnum = pgEnum("consent_type", [
  "newsletter_email",
  "product_updates_email",
  "b2b_email",
  "team_email",
  "sms",
]);

export const leadSubmissionKindEnum = pgEnum("lead_submission_kind", [
  "newsletter",
  "contact",
  "b2b_application",
  "team_application",
  "team_event",
  "return_request",
]);

export const leadSubmissionStatusEnum = pgEnum("lead_submission_status", [
  "new",
  "reviewed",
  "qualified",
  "archived",
  "closed",
]);

export const orderPaymentStatusEnum = pgEnum("order_payment_status", [
  "pending",
  "paid",
  "partially_refunded",
  "refunded",
]);

export const orderFulfillmentStatusEnum = pgEnum("order_fulfillment_status", [
  "pending_payment",
  "pending_fulfillment",
  "partially_fulfilled",
  "fulfilled",
  "cancelled",
]);

export const orderShippingStatusEnum = pgEnum("order_shipping_status", [
  "not_shipped",
  "label_purchased",
  "shipped",
  "delivered",
  "returned",
  "lost",
]);

export const orderCheckoutStatusEnum = pgEnum("order_checkout_status", [
  "draft",
  "checkout_created",
  "checkout_expired",
  "completed",
  "cancelled",
]);

export const paymentProviderEnum = pgEnum("payment_provider", ["stripe", "manual"]);
export const shippingProviderEnum = pgEnum("shipping_provider", ["shippo", "manual"]);

export const shipmentStatusEnum = pgEnum("shipment_status", [
  "pending",
  "rate_selected",
  "purchased",
  "voided",
  "in_transit",
  "delivered",
  "returned",
  "error",
]);

export const b2bApplicationStatusEnum = pgEnum("b2b_application_status", [
  "submitted",
  "under_review",
  "approved",
  "rejected",
]);

export const b2bQuoteStatusEnum = pgEnum("b2b_quote_status", [
  "draft",
  "sent",
  "accepted",
  "expired",
  "cancelled",
]);

export const b2bBusinessTypeEnum = pgEnum("b2b_business_type", [
  "bike_shop",
  "retailer",
  "distributor",
  "team_or_club",
  "event_or_community",
  "other",
]);

export const b2bInquiryTypeEnum = pgEnum("b2b_inquiry_type", [
  "wholesale",
  "retail_placement",
  "community_partnership",
  "event_support",
  "team_support",
  "other",
]);

export const productStatusEnum = pgEnum("product_status", ["draft", "active", "archived"]);
export const priceListStatusEnum = pgEnum("price_list_status", ["draft", "active", "archived"]);
export const inventoryLocationKindEnum = pgEnum("inventory_location_kind", [
  "warehouse",
  "retail",
  "third_party",
  "event",
]);

export const inventoryMovementReasonEnum = pgEnum("inventory_movement_reason", [
  "purchase",
  "sale",
  "adjustment",
  "return",
  "damage",
  "transfer",
  "reservation",
  "release",
]);

export const returnRequestStatusEnum = pgEnum("return_request_status", [
  "requested",
  "approved",
  "rejected",
  "received",
  "refunded",
  "closed",
]);

export const syncStatusEnum = pgEnum("sync_status", ["pending", "synced", "failed"]);
export const discountCodeStatusEnum = pgEnum("discount_code_status", [
  "draft",
  "active",
  "expired",
  "disabled",
]);
