# Legacy Website Inventory (Marketing Migration)

Generated: 2026-03-05T19:51:43.295Z
Source: `apps/old_website`

## Route inventory

- Total pages: 41
- Marketing pages: 12
- Commerce pages: 4
- Auth pages: 7
- Admin pages: 18
- API routes: 9

### Marketing route map

| Route | Source file |
| --- | --- |
| `/` | apps/old_website/app/page.tsx |
| `/about` | apps/old_website/app/about/page.tsx |
| `/blog` | apps/old_website/app/blog/page.tsx |
| `/blog/[slug]` | apps/old_website/app/blog/[slug]/page.tsx |
| `/contact` | apps/old_website/app/contact/page.tsx |
| `/events` | apps/old_website/app/events/page.tsx |
| `/faq` | apps/old_website/app/faq/page.tsx |
| `/mission` | apps/old_website/app/mission/page.tsx |
| `/privacy` | apps/old_website/app/privacy/page.tsx |
| `/products` | apps/old_website/app/products/page.tsx |
| `/returns` | apps/old_website/app/returns/page.tsx |
| `/shipping` | apps/old_website/app/shipping/page.tsx |

## SEO metadata (legacy root layout)

- Title: Zevlin Bike - Goods for your goods
- Description: The ultimate cream to keep you riding better, harder, and longer.

## Extracted data sets

- Products seeded: 5
- Testimonials in source store: 15
- Forms cataloged: 3

## Form + submission inventory

- newsletter-signup (/ (home sections)) -> fields: email -> server action signUp -> table newsletter_signups
- contact-form (/contact) -> fields: name, email, subject, message -> client-only alert flow (no backend persistence)
- returns-form (/returns) -> fields: orderNumber, name, email, message -> client-only alert flow (no backend persistence)

## Integration signals

- Supabase: 50 source files
- Shippo: 12 source files
- Newsletter Signups: 5 source files
- Brevo Email: 5 source files

## Asset parity against landing

- Old website public files: 8
- Landing public files: 8
- Missing from landing public: 0

- None

## Known source integrity issues

- Missing in old source: `/images/owner-0.png`

## Landing parity summary

- Landing route files currently expose: `/`, `/api/analytics/event`, `/api/contact`, `/api/health`, `/api/newsletter/signup`, `/api/returns`, `/contact`, `/faq`, `/privacy`, `/returns`, `/shipping`
- Marketing routes collapsed into landing home sections: `/`, `/about`, `/blog`, `/blog/[slug]`, `/contact`, `/events`, `/faq`, `/mission`, `/privacy`, `/products`, `/returns`, `/shipping`

For machine-readable inventory, see `apps/landing/lib/legacy-inventory.json`.
