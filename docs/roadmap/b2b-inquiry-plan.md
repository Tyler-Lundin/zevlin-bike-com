# B2B Inquiry Plan

## Objective

Create the smallest credible B2B surface Zevlin can publicly stand behind right now. The goal is not to launch a wholesale portal. The goal is to provide a serious inquiry page for retail, wholesale, and partnership conversations.

## Current state

As of March 13, 2026:

- `apps/b2b/app/page.tsx` is still a scaffold with placeholder text.
- Landing intentionally keeps B2B small because there is not yet a safe destination.
- Contact and intake infrastructure already exists on the landing app.

## Outcome definition

The B2B app should answer three questions immediately:

- what kind of business conversations Zevlin is open to
- who the page is for
- how an interested buyer/partner should contact the company

It should be narrow, credible, and free of fake scale signals.

## Audience

- retail buyers
- boutique bike shops
- distributors or local partners
- event/club/community collaborators

## Positioning rules

- do not imply enterprise-scale B2B operations if they do not exist
- do not imply live wholesale ordering, accounts, or dashboards unless built
- frame the page as inquiry-first and relationship-first
- keep copy serious, direct, and sparse

## Page structure

Recommended order:

1. B2B hero
2. Who we work with
3. What Zevlin can support
4. Why partner with Zevlin
5. Inquiry CTA
6. FAQ / response expectations

## Section plan

### 1. B2B hero

Purpose:
- set expectations immediately

Content:
- headline around wholesale, retail, or partnership inquiries
- short subheadline on the fixed lineup and direct communication
- primary CTA to contact or apply
- optional secondary CTA to view the consumer store lineup

### 2. Who we work with

Purpose:
- tell the right people they are in the right place

Candidate groups:
- independent bike shops
- select retailers
- local partners and ride communities
- event organizers or team/community collaborations

### 3. What Zevlin can support

Purpose:
- clarify the scope without overstating maturity

Possible items:
- retail placement inquiries
- sample/product conversations
- event/community partnership discussions
- team/community support inquiries

### 4. Why partner with Zevlin

Purpose:
- add selective commercial proof

Possible proof points:
- focused lineup
- strong rider-use case clarity
- direct communication
- community/team credibility

Rules:
- avoid made-up distribution scale, revenue, or retailer count

### 5. Inquiry CTA

Purpose:
- convert qualified interest into a real contact path

Implementation options:
- route to landing contact form with B2B context preselected
- create a dedicated B2B inquiry form in the B2B app

Recommendation for current phase:
- use a dedicated B2B inquiry form only if it maps directly into existing validated intake handling
- otherwise route to the existing landing contact flow with clear instructions

### 6. FAQ / response expectations

Purpose:
- reduce low-quality inquiries and set expectations

Topics:
- response window
- geographies serviced if known
- whether online resale is considered
- whether custom/private label is offered or not

## Design plan

- very restrained and serious
- lighter than landing hero, cleaner than store marketing surfaces
- spacious typography, sparse cards, high legibility
- no playful or loud brand gestures

## Technical plan

Likely files:
- `apps/b2b/app/page.tsx`
- `apps/b2b/app/globals.css`
- optional `apps/b2b/lib/content.ts`
- optional dedicated inquiry route/components if built

Implementation principle:
- keep B2B self-contained
- reuse shared contracts if an inquiry form is added
- do not import landing page components directly

## Data and intake plan

### Minimum version

- page routes users to `/contact` on landing with B2B framing

### Better version

- add a B2B inquiry form that captures:
  - business name
  - contact name
  - email
  - business type
  - location
  - inquiry type
  - notes

Any new form should:
- validate input
- rate limit submissions
- log/audit like existing intake routes
- notify the intake email path safely

## Analytics plan

Track:
- B2B page view
- inquiry CTA click
- form start / submit if a dedicated form is built
- outbound clicks to store or landing support paths if present

## SEO plan

- keep the page indexable once it is credible
- use plain-language metadata for wholesale/retail/partnership intent
- avoid stuffing keywords into weak copy

## Accessibility plan

- very strong form readability if the page includes form fields
- clear field labels and error states
- minimal interaction complexity

## Acceptance criteria

- landing can safely link to B2B when needed
- page reads as credible to a retailer or partner
- inquiry path is operationally real
- no portal/account/dashboard expectations are implied

## Dependencies

- decision on whether to reuse landing contact vs dedicated B2B form
- accurate statement of what kinds of partnerships are actually open
- support capacity for handling inquiries

## Risks

- overselling B2B maturity
- creating a form flow that operations are not ready to service
- turning a simple inquiry page into an underbuilt account system

## Recommended implementation order

1. Finalize positioning and scope.
2. Build the content-first page.
3. Decide and implement the safest inquiry CTA path.
4. Add analytics and metadata.
5. Only then decide whether landing should surface B2B more prominently.
