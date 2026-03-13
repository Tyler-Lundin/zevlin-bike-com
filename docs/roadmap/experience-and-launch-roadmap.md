# Experience and Launch Roadmap

## Purpose

This roadmap defines the next major Zevlin execution track after the initial landing/store foundation. The objective is to turn the current proof-of-concept surfaces into a coherent, launch-capable brand system that can support:

- direct-to-consumer conversion through the store
- brand/community credibility through the team experience
- low-friction wholesale and partnership intake
- operations that can survive audits, incidents, and customer growth

This document is the sequencing layer for five linked workstreams:

1. Team destination
2. Landing body polish
3. Minimal B2B inquiry page
4. Store refinement
5. Production hardening

Each workstream has a dedicated sub-plan in this folder.

## Current baseline as of March 13, 2026

### Landing

- Hero has been iterated into a premium light-mode concept with a stronger editorial heading treatment.
- Below-the-fold landing structure exists, but still needs a final conversion-quality system for spacing, hierarchy, mobile density, and consistency with the store.
- Landing support/legal/privacy/newsletter/contact surfaces exist and are functional.

### Store

- Route-based store flow exists for catalog, product detail, cart, checkout, and success.
- Catalog is fixed and shared from the Zevlin lineup.
- Checkout handoff exists, but the store still needs experience polish before it reads like a finished premium commerce surface.

### Team

- Team app currently shows upcoming sessions/events and proves the data path, but it is not yet a destination-quality brand/community page.
- Landing already teases the team, so the homepage is ready to send traffic into a stronger team surface.

### B2B

- B2B app is still a scaffold.
- No serious wholesale/retail/partnership intake page exists yet.
- Homepage should not overexpose B2B until the inquiry page is credible and operationally safe.

### Operations

- Dev and production branch model is in place.
- Coolify deployment guidance exists.
- Security/legal/privacy groundwork is already stronger than a typical marketing site baseline.
- Final QA, analytics validation, deploy governance, and launch evidence still need to be systematized.

## Program goals

### Business goals

- Increase confidence that Zevlin is a real, disciplined business rather than a legacy site retrofit.
- Improve direct conversion from landing to store.
- Build a credible public path for community/team participation.
- Create a safe path for partnership and wholesale inquiries without pretending the B2B system is mature.
- Reduce launch risk by hardening deploy, analytics, QA, and operational controls.

### User goals

- Shoppers can understand the product lineup quickly and move to checkout without friction.
- Riders can understand what the Zevlin Cycling Team is and how to engage.
- Retailers/partners can understand whether Zevlin is worth contacting.
- Visitors can trust support, shipping, returns, and privacy handling.

### Brand goals

- Keep the Zevlin voice cheeky in the right places, but remove amateur or placeholder energy.
- Make the site family feel like one serious system: landing, store, team, and B2B should feel related without becoming visually identical.
- Shift visual language from “legacy site inspiration” to “deliberate premium brand.”

## Locked strategic decisions

- `store` is the primary commerce destination.
- `landing` remains the primary brand and acquisition surface.
- `team` becomes the primary community credibility surface.
- `b2b` stays intentionally narrow until the wholesale motion is operationally real.
- Marketing and design work remain in mock state until confirmed, but architecture and routing should be built as if the surfaces will launch.
- Operational hardening is not optional cleanup; it is a parallel delivery track needed for a client-grade launch.

## Workstream order and rationale

### 1. Team destination

The team page should go first because the landing homepage already references it. Sending traffic from the landing page into a weak team page undermines the brand story. The team surface also has a clearer public-purpose role than B2B at this stage.

### 2. Landing body polish

Once the team destination is real, the landing page can be finalized as the conversion and routing layer between store, team, support, and contact. This pass should bring the rest of the homepage up to the same standard as the hero.

### 3. Minimal B2B inquiry page

After team and landing routing are credible, build the smallest serious B2B surface possible. This should not become a portal or catalog. It should exist to capture the right inquiries without making false claims about B2B maturity.

### 4. Store refinement

The store is already working, so it is not a blocking architecture problem. It is now a quality problem. Refine it after upstream acquisition/routing is in place so store polish is informed by the final landing and brand system.

### 5. Production hardening

Operational hardening runs in parallel, but the final hardening and release gate should happen after the product-facing experiences settle. There is no value in polishing launch governance against an interface that is still changing materially week to week.

## Phased execution model

## Phase 1: Destination credibility

Focus:

- Team destination plan
- Landing body polish plan

Outputs:

- Team homepage that can credibly receive traffic from landing
- Landing homepage whose body matches the hero quality level
- Clean routing from landing into store and team

Exit criteria:

- No major section on the landing homepage feels like placeholder content
- Team page reads like a real brand/community destination
- Mobile and desktop quality are both acceptable on landing and team

## Phase 2: Partnership/commercial expansion

Focus:

- B2B inquiry plan
- Store refinement plan

Outputs:

- A serious B2B inquiry landing page with operationally safe contact flow
- A refined store experience that feels premium from catalog through checkout

Exit criteria:

- Landing can safely mention B2B without sending users to a scaffold
- Store experience is visually and behaviorally consistent across mobile, tablet, and desktop
- Cart and checkout no longer feel like “functional V1” surfaces

## Phase 3: Launch governance

Focus:

- Production hardening plan

Outputs:

- QA matrix executed
- analytics and conversion events validated
- deploy controls and release checklist finalized
- support/legal/security/public trust surfaces reviewed against launch requirements

Exit criteria:

- No unresolved critical launch blocker in product, analytics, deploy, or legal/support surfaces
- Branch protection and deployment rules are live
- Production environment variables and integrations are validated end to end

## Cross-workstream constraints

### Content discipline

- Remove public placeholder business facts rather than polishing them.
- Keep mock design state acceptable where needed, but do not publish fake operational claims.
- Product claims should stay conservative unless verified.

### Design discipline

- Landing and team can be more expressive.
- Store should stay more restrained and product-first.
- B2B should feel serious and sparse.
- All surfaces must share typography, spacing discipline, and trust tone.

### Technical discipline

- Prefer shared typed data where a concept spans multiple apps.
- Do not import full app code directly across app boundaries.
- Preserve branch-based deploy assumptions in Coolify.
- Keep external API contract changes minimal unless they unlock real value.

### Operational discipline

- Every launch-facing workstream should have acceptance criteria.
- Analytics and QA must be treated as deliverables, not “after design.”
- Legal/privacy/support surfaces must stay aligned with whatever the homepage and store promise publicly.

## Major dependencies

### Team depends on

- stable route and content model in `apps/team`
- agreed CTA and community framing from landing
- safe fallback data if live content is incomplete

### Landing depends on

- final destination URLs for store/team
- stable product lineup and product copy baseline
- clear support/trust/contact routes

### B2B depends on

- contact/intake flow already functioning
- acceptable business framing for retail/wholesale/partnership requests
- decision on whether to add a dedicated B2B form later

### Store depends on

- stable product catalog and mock media
- confirmed cart/checkout interaction model
- Stripe session handoff remaining the hosted payment model

### Production hardening depends on

- enough UI stability to make QA and analytics durable
- environment and branch model already in place
- final-ish public claims on shipping, returns, and support

## Success metrics

### Experience metrics

- landing -> store click-through rate improves
- landing -> team click-through rate is measurable and intentional
- bounce from landing hero decreases after body polish
- cart-to-checkout and checkout-to-success rates improve after store refinement

### Operational metrics

- zero critical blockers in pre-launch QA
- analytics coverage for primary conversion paths is verified
- production branch deploys are gated and reproducible
- required support/legal/privacy routes remain reachable and accurate

### Quality metrics

- mobile/tablet/desktop all pass manual review
- no section appears visibly placeholder or internally inconsistent
- design language feels intentional and coherent across apps

## Risks and failure modes

### Overbuilding B2B too early

Risk:
- spending time on wholesale UX before the inquiry motion is operationally ready

Response:
- keep B2B inquiry-only in this phase

### Landing/store visual drift

Risk:
- landing becomes editorial while store feels generic or disconnected

Response:
- use the store refinement plan to align type, spacing, color restraint, and CTA language

### Team page becomes an event dump

Risk:
- shipping a “calendar feed” rather than a brand/community page

Response:
- prioritize story, purpose, and participation paths over pure event listing

### Hardening happens too late

Risk:
- operational cleanup gets squeezed after UI work

Response:
- keep production hardening as a dedicated workstream with explicit exit criteria

## Immediate next actions

1. Execute the Team Destination Plan.
2. Execute the Landing Polish Plan.
3. Use those outputs to finalize routing and CTA hierarchy.
4. Execute the B2B Inquiry Plan.
5. Execute the Store Refinement Plan.
6. Run the Production Hardening Plan as the release gate before production cutover.

## Sub-plan index

- [Team Destination Plan](./team-destination-plan.md)
- [Landing Polish Plan](./landing-polish-plan.md)
- [B2B Inquiry Plan](./b2b-inquiry-plan.md)
- [Store Refinement Plan](./store-refinement-plan.md)
- [Production Hardening Plan](./production-hardening-plan.md)
