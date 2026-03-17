import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  benefitEntitlements,
  b2bQuotes,
  customers,
  fileObjects,
  leadSubmissions,
  orders,
  organizations,
  priceLists,
  productVariants,
  products,
  teamMemberships,
} from "./schema";

export type Customer = InferSelectModel<typeof customers>;
export type NewCustomer = InferInsertModel<typeof customers>;
export type Organization = InferSelectModel<typeof organizations>;
export type NewOrganization = InferInsertModel<typeof organizations>;
export type Product = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;
export type ProductVariant = InferSelectModel<typeof productVariants>;
export type NewProductVariant = InferInsertModel<typeof productVariants>;
export type PriceList = InferSelectModel<typeof priceLists>;
export type NewPriceList = InferInsertModel<typeof priceLists>;
export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;
export type B2bQuote = InferSelectModel<typeof b2bQuotes>;
export type NewB2bQuote = InferInsertModel<typeof b2bQuotes>;
export type TeamMembership = InferSelectModel<typeof teamMemberships>;
export type NewTeamMembership = InferInsertModel<typeof teamMemberships>;
export type BenefitEntitlement = InferSelectModel<typeof benefitEntitlements>;
export type NewBenefitEntitlement = InferInsertModel<typeof benefitEntitlements>;
export type LeadSubmission = InferSelectModel<typeof leadSubmissions>;
export type NewLeadSubmission = InferInsertModel<typeof leadSubmissions>;
export type FileObject = InferSelectModel<typeof fileObjects>;
export type NewFileObject = InferInsertModel<typeof fileObjects>;
