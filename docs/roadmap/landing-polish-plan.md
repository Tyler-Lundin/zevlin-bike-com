# Landing Polish Plan

## Objective

Bring the entire landing homepage up to the same quality level as the current hero. The landing page should become a disciplined conversion surface that routes visitors clearly into the store, the team page, support, and contact without any leftover “migration” or placeholder feel.

## Current state

As of March 13, 2026:

- The hero has received multiple design passes and is now the strongest part of the page.
- The homepage body structure has already been reorganized, but it still needs a final polish pass for typography, hierarchy, spacing, mobile readability, and cross-section consistency.
- The landing page already routes to store, team, support, privacy, shipping, returns, and contact paths.

## Outcome definition

The landing page should do four things well:

- explain what Zevlin is
- send shoppers into the store
- show brand/community proof without overloading the page
- establish trust around support, shipping, returns, and privacy

## Audience

### Primary audience

- new visitors discovering the brand for the first time
- shoppers not yet ready to go directly to the store

### Secondary audience

- returning users validating trust/support before buying
- riders interested in the team/community signal
- partners/retailers looking for a safe path to contact

## Page role within the system

- `landing` is the brand acquisition surface
- `store` is the product/transaction surface
- `team` is the community proof surface
- `b2b` is a small inquiry surface

The landing page should route into those surfaces clearly rather than trying to be all of them.

## Section-by-section execution plan

### 1. Hero refinement follow-up

Purpose:
- Preserve the stronger editorial hero and ensure the rest of the page matches it.

Tasks:
- confirm final hero copy density
- align CTA row with the newer typography
- review chip density and visibility on mobile
- keep hero visually strong without carrying the whole page alone

### 2. Proof strip

Purpose:
- Immediately justify why Zevlin deserves attention.

Tasks:
- tighten proof card titles and body copy
- normalize card heights and spacing
- reduce any “equal-weight panel wall” feeling
- ensure proof items feel like business reasons, not ad slogans

Desired outputs:
- 3 to 4 compact, high-clarity cards
- clean visual rhythm across mobile/tablet/desktop

### 3. Product showcase

Purpose:
- Move visitors from understanding to shopping.

Tasks:
- tighten product section heading and intro copy
- make cards feel more obviously connected to the store
- verify every CTA opens the correct product path on the store app
- reduce duplicate copy between hero and showcase
- ensure the 5-product lineup reads quickly on small screens

### 4. Use-case guide

Purpose:
- Help users self-select the right product without support friction.

Tasks:
- simplify decision guidance into fewer, clearer statements
- map each guide card to one or more real products
- keep guide language customer-facing and practical
- avoid turning this section into a support FAQ duplicate

### 5. Team teaser

Purpose:
- Provide community proof and a clean route into the team app.

Tasks:
- make the teaser more obviously connected to the real team destination
- keep copy short and credibility-focused
- ensure visual tone is editorial and brand-consistent
- validate the CTA hierarchy against the final team page

### 6. Brand proof section

Purpose:
- Show the founder/brand story without derailing conversion.

Tasks:
- reduce copy density if the section feels self-indulgent
- keep one strong quote and one visual anchor
- ensure this section supports trust rather than taking over the page
- remove or avoid unverified operational facts

### 7. Review strip

Purpose:
- Provide social proof without reverting to an e-commerce testimonial wall.

Tasks:
- simplify the review card format
- make the strongest proof points scannable
- reduce repeated visual patterns that compete with the rest of the page
- keep the section short and high-confidence

### 8. Support + trust section

Purpose:
- Resolve trust questions before they become friction.

Tasks:
- tighten shipping/returns/privacy/contact summaries
- keep links obvious and low-friction
- place the B2B partnership callout here as a minimal signal
- review mobile density carefully because this section can become too text-heavy fast

### 9. FAQ

Purpose:
- Handle the highest-frequency objections efficiently.

Tasks:
- remove repeated questions already answered better elsewhere on the page
- keep answers concise and practical
- align wording with the actual support/legal routes

### 10. Footer CTA

Purpose:
- Close the page with a clean next step rather than a loud interruption.

Tasks:
- keep newsletter and contact secondary to store/team/support
- ensure the footer CTA does not overwhelm mobile screens
- align visual tone with the lighter, calmer lower-page system

## Typography and design plan

### Typography

- preserve the new editorial hero tone
- use a calmer, more restrained hierarchy below the fold
- reduce heading styles that all fight equally for attention
- make body copy shorter and more confident

### Layout

- center content widths below the hero
- increase consistency in vertical spacing between sections
- reduce stacked card fatigue
- keep mobile sections mostly single-column and obvious

### Visual system

- light, premium body surfaces
- one consistent card language for proof/product/review/support sections
- minimal decorative noise below the hero
- subtle motion only where it improves clarity

## Content governance plan

- remove remaining placeholder copy if any appears publicly
- do not surface fake address, phone, warehouse, or operational facts
- keep mock product imagery acceptable until real assets exist
- align all trust statements with actual shipping/returns/privacy behavior

## Technical plan

Likely files:
- `apps/landing/app/page.tsx`
- `apps/landing/app/globals.css`
- `apps/landing/lib/content.ts`
- possibly extracted section components under `apps/landing/components/`

Implementation approach:
- keep section data in the landing content model
- extract page sections into components if `page.tsx` becomes overly dense
- preserve existing schema/metadata logic but verify URLs and text after changes

## Analytics plan

Track:
- hero primary CTA click
- product showcase CTA click
- per-product click to store
- team teaser CTA click
- support/contact/newsletter CTA clicks
- scroll depth or section view events if useful and not overengineered

## SEO plan

- keep homepage metadata aligned with brand and product purpose
- ensure product schema points to store PDPs
- ensure homepage copy is readable by crawlers without relying on JS-only interactions
- keep team/store/support routes discoverable through navigation and internal links

## Accessibility plan

- confirm readable contrast for every lower-page card type
- keep section headings semantically clean
- ensure CTA labels are explicit and non-duplicative
- verify accordion/FAQ behavior if interactive

## Acceptance criteria

- landing body quality no longer lags behind the hero
- page clearly routes to store and team without confusion
- support/trust information is accessible without bloating the page
- no visible placeholder or migration-era content remains
- mobile experience feels intentional rather than compressed

## Dependencies

- final team page direction
- stable store product URLs and catalog slugs
- confirmation of any copy claims the client wants kept

## Risks

- overdesigning sections that should stay quiet
- repeating too much hero messaging below the fold
- letting the homepage become too long again

## Recommended implementation order

1. Finalize section copy model in `content.ts`.
2. Refine proof, product, and guide sections first.
3. Align team teaser to the real team destination.
4. Tighten brand proof, reviews, support, and FAQ.
5. Finalize footer CTA.
6. Run responsive and conversion-path QA.
