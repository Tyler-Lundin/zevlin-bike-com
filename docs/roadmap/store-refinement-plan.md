# Store Refinement Plan

## Objective

Take the existing working store and elevate it from “good functional V1” to a calm, premium commerce experience across mobile, tablet, and desktop. The goal is not to expand features. The goal is to improve confidence, clarity, and conversion from catalog through success.

## Current state

As of March 13, 2026:

- catalog, PDP, cart, checkout, and success routes exist
- cart state persists client-side
- fixed product lineup is implemented
- hosted Stripe checkout handoff is wired
- overall store experience is structurally sound but still needs polish in typography, layout, spacing, product media treatment, and checkout clarity

## Outcome definition

A rider should be able to:

- scan the catalog quickly
- understand a product page without friction
- manage cart quantity and shipping expectations clearly
- complete checkout in a calm, trustworthy flow

## Primary experience principles

- product-first, not marketing-first
- minimal, premium, and serious
- glass only where it adds hierarchy, not everywhere
- clear pricing and shipping expectations
- mobile-first clarity with desktop refinement

## Route-by-route plan

### 1. Catalog home (`/`)

Purpose:
- present the full lineup with minimal friction

Refinement tasks:
- improve section heading typography and spacing
- tune product card hierarchy so image, name, price, and action read instantly
- tighten card hover states and tap states
- confirm 1-up mobile, 2-up tablet, 3-up desktop behavior feels balanced
- ensure the catalog callout does not compete with the products

Success state:
- the page feels calm, controlled, and immediately shoppable

### 2. Product detail (`/products/[slug]`)

Purpose:
- convert interest into add-to-cart confidence

Refinement tasks:
- strengthen media stage presentation
- tighten buy box spacing and hierarchy
- make benefits/proof easier to scan
- tune quantity stepper spacing and affordance
- refine mobile sticky add-to-cart behavior
- ensure shipping/returns note is informative but not noisy

Success state:
- product pages feel premium and decisive, not template-heavy

### 3. Cart (`/cart`)

Purpose:
- clarify what is in the order and what happens next

Refinement tasks:
- improve item row density and spacing
- make quantity/remove actions more obvious
- improve summary hierarchy and shipping threshold explanation
- ensure empty cart state feels intentional, not barren
- tune sticky or stacked behavior by breakpoint

Success state:
- cart is easy to adjust and easy to move forward from

### 4. Checkout (`/checkout`)

Purpose:
- make pre-payment data entry feel trustworthy and controlled

Refinement tasks:
- tighten field group spacing and labeling
- reduce form fatigue visually
- improve summary panel clarity and sticky behavior on larger screens
- ensure same-as-shipping behavior is obvious
- validate cancel/return flows preserve the user’s draft cleanly

Success state:
- checkout reads like serious commerce software rather than app scaffolding

### 5. Success (`/checkout/success`)

Purpose:
- confirm completion and set next expectations

Refinement tasks:
- make the confirmation state feel calm and complete
- present order reference cleanly when available
- clarify next steps and support path
- keep the page useful even when the reference is missing

Success state:
- customer receives reassurance, not ambiguity

## Design system refinement plan

### Typography

- sharpen store heading hierarchy
- keep the store calmer than landing
- reduce decorative type treatments
- improve form labels and summary readability

### Color and surfaces

- stay light-first and restrained
- use glass for header, cards, and summary surfaces only where it improves depth
- keep border and shadow language consistent

### Motion

- minimal card lift and section reveal only
- sticky behavior should aid purchase flow, not feel gimmicky
- no animated distractions

## Component plan

Components likely in scope:
- `ProductCard`
- `ProductDetailView`
- `QuantityStepper`
- `CartView`
- `OrderSummaryPanel`
- `CheckoutView`
- `SuccessView`
- `StoreShell`

Refinement goals per component:
- reduce any awkward spacing or generic defaults
- improve visual consistency across cards and forms
- make touch targets comfortably large on mobile
- ensure all states feel part of one system

## Content plan

- keep product copy short and useful
- avoid marketing overload inside the store
- keep benefit bullets specific to rider use cases
- keep shipping/returns language aligned with actual policy pages

## Technical plan

Likely files:
- `apps/store/app/globals.css`
- `apps/store/app/page.tsx`
- `apps/store/app/products/[slug]/page.tsx`
- `apps/store/app/cart/page.tsx`
- `apps/store/app/checkout/page.tsx`
- `apps/store/app/checkout/success/page.tsx`
- core store components under `apps/store/components/`

Implementation approach:
- keep route structure intact
- refine UI without changing order/session API contract unless clearly necessary
- preserve shared catalog contract

## Analytics plan

Track and verify:
- catalog page view
- PDP view
- add-to-cart
- cart view
- checkout start
- checkout session creation
- success page view
- product-specific purchase funnel drop-off if possible

## QA plan

### Catalog

- all products render consistently
- cards align cleanly across breakpoints

### PDP

- valid and invalid slugs behave correctly
- sticky CTA works on mobile

### Cart

- increment/decrement/remove all behave consistently
- subtotal/shipping threshold updates correctly

### Checkout

- empty cart cannot proceed
- valid forms create checkout sessions
- cancel returns preserve checkout draft state

### Success

- page behaves correctly with and without order reference data

## Acceptance criteria

- store feels premium and disciplined across all primary routes
- mobile/tablet/desktop layouts all feel considered
- cart and checkout are clearer and calmer than the current baseline
- no core commerce behavior regresses during polish

## Dependencies

- stable shared catalog data
- continued use of hosted Stripe checkout
- agreement on final product media style while real assets remain mock state

## Risks

- overdecorating a store that should stay restrained
- optimizing visual polish while missing checkout clarity
- making route-level changes that destabilize the working commerce flow

## Recommended implementation order

1. Catalog and PDP refinement.
2. Cart refinement.
3. Checkout and success refinement.
4. Analytics verification.
5. Full responsive QA pass.
