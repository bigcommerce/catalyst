---
"@bigcommerce/catalyst-core": patch
---

Style the promotion callouts with Storefront Kit's built-in `warning` variant instead of custom Tailwind classes. Bumps `storefront-kit` to `^0.32.3` (whose `styles` stylesheet is now plain CSS, so it imports cleanly under Turbopack) and wires up `storefront-kit/styles` plus the Storefront Kit `dist` content path so the Callout's design-system tokens resolve out of the box.
