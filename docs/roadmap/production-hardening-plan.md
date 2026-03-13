# Production Hardening Plan

## Objective

Convert the current dev-ready experience into a release-ready system that can stand up to client scrutiny, real traffic, operational mistakes, and basic audit expectations. This is the launch gate for the Zevlin public surfaces.

## Current state

As of March 13, 2026:

- branch-driven deployment model exists with `development` and `production`
- Coolify deployment guidance exists
- security/privacy/legal pages and intake surfaces exist on landing
- analytics scaffolding exists
- testing blocks and core operational policies/runbooks exist
- final launch QA and release governance have not yet been run end to end against the polished experience set

## Scope

This workstream covers:

- QA execution
- analytics verification
- production environment validation
- branch protection and deploy rules
- legal/support/public trust review
- launch checklists and go/no-go criteria

It does not cover major UI redesign. It assumes product-facing surfaces are close enough to final to stabilize.

## Hardening pillars

### 1. Experience QA

Purpose:
- verify the public experience across landing, store, team, and B2B before production cutover

Coverage:
- mobile, tablet, desktop
- landing -> store path
- landing -> team path
- landing/B2B support/contact paths
- store catalog -> PDP -> cart -> checkout -> success path
- empty/edge/error states that are user-visible

Outputs:
- QA matrix with pass/fail and blocking severity
- screenshot/notes evidence where useful

### 2. Analytics verification

Purpose:
- ensure key business events are measurable before launch

Coverage:
- landing page view
- hero CTA clicks
- product showcase/store clicks
- team teaser/team CTA clicks
- add-to-cart
- checkout start
- checkout success
- support/contact/newsletter/B2B inquiry clicks or submissions where relevant

Tasks:
- confirm `NEXT_PUBLIC_GA_MEASUREMENT_ID` behavior in each environment
- verify event names and payloads are stable
- validate that no broken events or duplicate fires occur on primary CTAs

### 3. Environment and integration validation

Purpose:
- make sure production infrastructure values are correct and safe

Checklist:
- production `NEXT_PUBLIC_SITE_URL`
- production `NEXT_PUBLIC_STORE_URL`
- production `NEXT_PUBLIC_TEAM_URL`
- SMTP relay values
- intake/support/security email values
- Stripe configuration
- database and redis configuration
- migration status
- health endpoints

Tasks:
- verify Coolify env values match docs
- run required DB migrations before release
- confirm app startup/build on production branch

### 4. Deployment governance

Purpose:
- prevent ad hoc release mistakes

Tasks:
- verify `development` and `production` branch protections
- require CI/security checks on merge
- confirm promotion flow from `development` to `production`
- verify rollback procedure is documented and realistic
- confirm only the intended branch deploys to each environment

### 5. Support/legal/public trust review

Purpose:
- align public promises with actual behavior

Review areas:
- shipping page
- returns page
- privacy page and privacy request flow
- contact page
- terms/security page
- security.txt
- any public support/response wording in landing/store/team/B2B

Tasks:
- remove any claims not supported operationally
- ensure contact points are correct
- ensure links resolve and forms submit correctly

### 6. Release readiness checklist

Purpose:
- define the final go/no-go gate

Checklist areas:
- product-facing UI complete enough for launch
- analytics verified
- envs verified
- branch protections live
- smoke tests pass
- no critical launch blocker open
- rollback plan understood

## Deliverables

- launch QA checklist and results
- analytics validation notes
- env verification checklist
- branch protection/deploy verification
- launch signoff checklist with explicit blockers/non-blockers

## Technical execution plan

### Apps in scope

- `apps/landing`
- `apps/store`
- `apps/team`
- `apps/b2b`

### Docs in scope

- `docs/operations/coolify-branch-deployment.md`
- `docs/operations/branch-protection.md`
- `docs/operations/environment-strategy.md`
- `docs/templates/release-checklist.md`
- this roadmap folder

### Validation surfaces

- public app routes
- form submissions and intake flows
- checkout session creation
- health routes
- analytics hooks

## QA matrix outline

### Landing

- hero/navbar behavior
- body section flow and CTA accuracy
- support/contact/newsletter forms
- legal/privacy/shipping/returns pages

### Store

- catalog responsiveness
- PDP behavior
- cart persistence
- checkout path
- success handling

### Team

- hero/CTA behavior
- events rendering or empty state
- join/contact path

### B2B

- page credibility
- inquiry CTA or form behavior

## Acceptance criteria

- all production-facing routes load and behave correctly in production-like configuration
- primary conversion analytics are verified
- no broken public links or dead-end CTAs remain
- branch/deploy governance is active, not just documented
- no unresolved critical/high launch blocker remains open

## Risks

- polishing UI faster than operations can validate claims
- shipping without trustworthy analytics
- production branch deploys being mutable or weakly controlled
- legal/support pages drifting from actual support behavior

## Recommended implementation order

1. Freeze major UI churn for the release candidate window.
2. Execute QA across all public apps.
3. Verify analytics and environment configuration.
4. Validate branch protection and promotion flow.
5. Review support/legal/public trust surfaces.
6. Run final go/no-go checklist before production promotion.
