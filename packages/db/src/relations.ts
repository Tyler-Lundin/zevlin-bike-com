import { relations } from "drizzle-orm";
import {
  customerAddresses,
  customerPreferences,
  customers,
  organizationLocations,
  organizationMemberships,
  organizations,
} from "./schema/identity";
import {
  orderAdjustments,
  orderItems,
  orders,
  paymentAttempts,
  products,
  productVariants,
  refunds,
} from "./schema/commerce";
import {
  inventoryLevels,
  priceListAssignments,
  priceListItems,
  priceLists,
  productCollectionItems,
  productCollections,
  productMediaRefs,
} from "./schema/catalog";
import {
  shipmentRates,
  shipments,
  shipmentTrackingEvents,
  returnRequests,
  returnItems,
} from "./schema/fulfillment";
import {
  b2bApplications,
  b2bQuoteItems,
  b2bQuotes,
  b2bQuoteStatusEvents,
} from "./schema/b2b";
import {
  communityProfiles,
  teamApplications,
  teamEventRegistrations,
  teamEvents,
  teamMemberships,
  teamPrograms,
  teamUpdates,
} from "./schema/team";
import { benefitEntitlements, benefitPrograms, discountCodes } from "./schema/benefits";
import { leadSubmissions, marketingConsents } from "./schema/marketing";
import { fileObjects } from "./schema/platform";

export const customerRelations = relations(customers, ({ many, one }) => ({
  addresses: many(customerAddresses),
  preferences: one(customerPreferences, {
    fields: [customers.id],
    references: [customerPreferences.customerId],
  }),
  organizationMemberships: many(organizationMemberships),
  orders: many(orders),
  teamMemberships: many(teamMemberships),
  communityProfile: one(communityProfiles, {
    fields: [customers.id],
    references: [communityProfiles.customerId],
  }),
  leadSubmissions: many(leadSubmissions),
  consents: many(marketingConsents),
}));

export const organizationRelations = relations(organizations, ({ many }) => ({
  memberships: many(organizationMemberships),
  locations: many(organizationLocations),
  priceLists: many(priceLists),
  priceListAssignments: many(priceListAssignments),
  orders: many(orders),
  b2bApplications: many(b2bApplications),
  b2bQuotes: many(b2bQuotes),
  benefitEntitlements: many(benefitEntitlements),
}));

export const productRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
  media: many(productMediaRefs),
  collectionItems: many(productCollectionItems),
  priceListItems: many(priceListItems),
  orderItems: many(orderItems),
}));

export const productVariantRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  media: many(productMediaRefs),
  inventoryLevels: many(inventoryLevels),
  priceListItems: many(priceListItems),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  buyerOrganization: one(organizations, {
    fields: [orders.buyerOrganizationId],
    references: [organizations.id],
  }),
  items: many(orderItems),
  adjustments: many(orderAdjustments),
  paymentAttempts: many(paymentAttempts),
  refunds: many(refunds),
  shipmentRates: many(shipmentRates),
  shipments: many(shipments),
  returnRequests: many(returnRequests),
}));

export const priceListRelations = relations(priceLists, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [priceLists.organizationId],
    references: [organizations.id],
  }),
  items: many(priceListItems),
  assignments: many(priceListAssignments),
  teamMemberships: many(teamMemberships),
}));

export const shipmentRelations = relations(shipments, ({ one, many }) => ({
  order: one(orders, {
    fields: [shipments.orderId],
    references: [orders.id],
  }),
  shipmentRate: one(shipmentRates, {
    fields: [shipments.shipmentRateId],
    references: [shipmentRates.id],
  }),
  fileObject: one(fileObjects, {
    fields: [shipments.fileObjectId],
    references: [fileObjects.id],
  }),
  trackingEvents: many(shipmentTrackingEvents),
  returnRequests: many(returnRequests),
}));

export const b2bApplicationRelations = relations(b2bApplications, ({ one }) => ({
  organization: one(organizations, {
    fields: [b2bApplications.organizationId],
    references: [organizations.id],
  }),
  submittedByCustomer: one(customers, {
    fields: [b2bApplications.submittedByCustomerId],
    references: [customers.id],
  }),
  leadSubmission: one(leadSubmissions, {
    fields: [b2bApplications.leadSubmissionId],
    references: [leadSubmissions.id],
  }),
}));

export const b2bQuoteRelations = relations(b2bQuotes, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [b2bQuotes.organizationId],
    references: [organizations.id],
  }),
  items: many(b2bQuoteItems),
  statusEvents: many(b2bQuoteStatusEvents),
}));

export const teamProgramRelations = relations(teamPrograms, ({ one, many }) => ({
  priceList: one(priceLists, {
    fields: [teamPrograms.priceListId],
    references: [priceLists.id],
  }),
  updates: many(teamUpdates),
  events: many(teamEvents),
  applications: many(teamApplications),
  memberships: many(teamMemberships),
  benefitPrograms: many(benefitPrograms),
}));

export const teamMembershipRelations = relations(teamMemberships, ({ one, many }) => ({
  customer: one(customers, {
    fields: [teamMemberships.customerId],
    references: [customers.id],
  }),
  program: one(teamPrograms, {
    fields: [teamMemberships.teamProgramId],
    references: [teamPrograms.id],
  }),
  priceList: one(priceLists, {
    fields: [teamMemberships.priceListId],
    references: [priceLists.id],
  }),
  eventRegistrations: many(teamEventRegistrations),
  benefitEntitlements: many(benefitEntitlements),
}));

export const benefitProgramRelations = relations(benefitPrograms, ({ one, many }) => ({
  teamProgram: one(teamPrograms, {
    fields: [benefitPrograms.teamProgramId],
    references: [teamPrograms.id],
  }),
  priceList: one(priceLists, {
    fields: [benefitPrograms.priceListId],
    references: [priceLists.id],
  }),
  entitlements: many(benefitEntitlements),
  discountCodes: many(discountCodes),
}));

export const benefitEntitlementRelations = relations(benefitEntitlements, ({ one }) => ({
  benefitProgram: one(benefitPrograms, {
    fields: [benefitEntitlements.benefitProgramId],
    references: [benefitPrograms.id],
  }),
  customer: one(customers, {
    fields: [benefitEntitlements.customerId],
    references: [customers.id],
  }),
  teamMembership: one(teamMemberships, {
    fields: [benefitEntitlements.teamMembershipId],
    references: [teamMemberships.id],
  }),
  organization: one(organizations, {
    fields: [benefitEntitlements.organizationId],
    references: [organizations.id],
  }),
}));

export const leadSubmissionRelations = relations(leadSubmissions, ({ one, many }) => ({
  customer: one(customers, {
    fields: [leadSubmissions.customerId],
    references: [customers.id],
  }),
  organization: one(organizations, {
    fields: [leadSubmissions.organizationId],
    references: [organizations.id],
  }),
  consents: many(marketingConsents),
}));
