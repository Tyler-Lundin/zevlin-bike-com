# Team Destination Plan

## Objective

Turn `apps/team` from an event-feed scaffold into a full destination-quality community page for the Zevlin Cycling Team. This surface should justify the homepage team teaser, deepen brand credibility, and provide a clear path for interested riders to engage.

## Current state

As of March 13, 2026:

- `apps/team/app/page.tsx` renders a simple upcoming sessions/events list.
- The current page proves data access but does not yet explain what the team is, who it is for, or why a rider should care.
- The landing homepage already includes a team teaser and links into the team app.

## Outcome definition

The team app should feel like a real public destination, not a development scaffold. A first-time visitor should understand within one screen:

- what the Zevlin Cycling Team is
- what kind of riding/community it represents
- whether the team is open, invitational, local, performance-focused, social, or hybrid
- how to join, inquire, or follow along

## Audience

### Primary audience

- Riders who discovered Zevlin via the landing page and want community proof.
- Local/regional cyclists who may join rides or training sessions.

### Secondary audience

- Existing customers evaluating whether Zevlin is a real community-backed brand.
- Potential collaborators or sponsors evaluating whether the team is credible.

## Page strategy

The team homepage should not be a calendar-first page. It should be a community story page with event utility embedded inside it.

### Recommended section order

1. Team hero
2. Team positioning / what it is
3. Community proof strip
4. Featured ride/training block
5. Upcoming events list
6. Participation/join CTA
7. FAQ or rider expectations
8. Support/contact footer CTA

## Section plan

### 1. Team hero

Purpose:
- Establish the Zevlin Cycling Team as a serious rider/community concept.

Content:
- headline describing the team clearly
- short subheadline focused on riding, training, and community
- one primary CTA such as `See upcoming sessions` or `Join the team list`
- one secondary CTA such as `Contact the team`
- one hero image or strong atmospheric visual

Design:
- lighter, calmer than landing hero but still editorial
- strong type hierarchy and spacious layout
- immediate credibility without overclaiming competitive status

### 2. What the team is

Purpose:
- Explain the team model in plain language.

Content:
- short paragraph on team purpose
- whether sessions are open/public, member-only, or mixed
- what riders can expect: group rides, training sessions, meetups, event support

Rules:
- do not imply a formal race team structure unless true
- do not invent sponsorship scale, results, or membership size

### 3. Community proof strip

Purpose:
- Show why the team matters.

Content ideas:
- consistent ride calendar
- local rider community
- ride-day support mentality
- product/testing feedback loop from real riders

Output shape:
- 3 or 4 compact proof cards

### 4. Featured ride or training block

Purpose:
- Give the page a living focal point without making it a raw event dump.

Content:
- one highlighted ride/training format
- short description
- expected pace/format
- route or location summary if available
- CTA into sign-up or event details when appropriate

Implementation note:
- this can be driven by the next upcoming “featured” event if the data model supports it
- if not, it can be static/mock until the event model is richer

### 5. Upcoming events list

Purpose:
- Preserve the useful part of the current team page

Behavior:
- show the next relevant sessions in clean cards or list rows
- make time/date/location easy to scan
- reduce raw metadata like `source:` unless needed for debugging, not public UX
- empty state should still leave the page useful and alive

### 6. Join / participation CTA

Purpose:
- convert interest into action

Possible actions:
- interest form
- team contact email
- event signup flow
- newsletter/list signup specific to the team

Recommendation:
- keep the initial CTA simple and operationally safe, likely a contact or signup form

### 7. Team FAQ / expectations

Purpose:
- answer practical rider questions before they become support load

Candidate questions:
- who can join?
- do I need to race?
- what bikes/fitness level fit?
- where do rides happen?
- how do I hear about changes?

### 8. Footer CTA

Purpose:
- route users cleanly to landing/support/contact if the team page is not the right fit

## Content model plan

Add or evolve a team-specific content model that can support:

- hero content
- proof strip items
- featured ride/training block
- upcoming events
- CTA block
- FAQ items

This content can begin as fallback data inside `apps/team/lib/content.ts`, but it should be structured so it can later be fed by Directus cleanly.

## UX and design principles

- more editorial than store, less atmospheric than landing hero
- clean white/light base with controlled use of Zevlin accent colors
- serious rider tone, not “club flyer” energy
- events should feel secondary to identity and purpose
- mobile should stack cleanly without dense card walls

## Technical plan

### App scope

Files likely touched:
- `apps/team/app/page.tsx`
- `apps/team/app/globals.css`
- `apps/team/lib/content.ts`
- possibly new components under `apps/team/components/`

### Data plan

- keep `getUpcomingTeamEvents()` for live/event data
- add a stable fallback/static content model for the rest of the page
- separate content sections from event feed logic so the page stays coherent if the feed is empty

### Integration plan

- preserve linkability from landing via `NEXT_PUBLIC_TEAM_URL`
- maintain team health endpoint behavior
- avoid importing landing app components directly

## Analytics plan

Track at minimum:

- team page view
- hero primary CTA click
- event signup CTA click
- contact/join CTA click
- return clicks back to store/landing if those paths are offered

## SEO plan

- add clear metadata for team/community keywords relevant to Zevlin
- include structured page title and description that make the page understandable in search/snippets
- ensure copy explains the team in plain text, not only in decorative headings

## Accessibility plan

- readable contrast in all team cards and event states
- clear semantics for lists of events
- accessible CTA labels
- no critical information communicated only via imagery or motion

## Acceptance criteria

- team app reads as a community destination, not a scaffold
- landing’s team teaser can safely send traffic here
- upcoming events are useful but not the entire story
- the page still feels credible if there are temporarily few/no live events
- mobile/tablet/desktop all remain clean and readable

## Dependencies

- final position of team in landing nav and homepage routing
- any decision on whether team signup uses contact flow or dedicated signup flow
- availability of accurate team framing from the client/business

## Risks

- overpromising community scale
- over-indexing on events while underserving narrative
- building a full signup system before the team operating model is confirmed

## Recommended implementation order

1. Define team content model and page IA.
2. Build hero and identity sections.
3. Rebuild events list as a cleaner secondary section.
4. Add participation CTA path.
5. Add analytics and metadata.
6. QA across breakpoints and empty/live event states.
