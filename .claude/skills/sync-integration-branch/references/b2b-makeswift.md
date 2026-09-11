# Reference: `integrations/b2b-makeswift`

Load this when the sync target is `integrations/b2b-makeswift`. Fill the SKILL.md placeholders with:

- **Upstream (merge from):** `integrations/makeswift`
- **Package identity:** `@bigcommerce/catalyst-b2b-makeswift`
- **Sync branch:** `sync-integrations-b2b-makeswift`
- **Merge-base pair:** `integrations/makeswift` ↔ `integrations/b2b-makeswift`
- **Upstream package (for one-time catch-up tags):** `@bigcommerce/catalyst-makeswift`

## Integration surface (preserve wholesale)

The B2B Edition + Buyer Portal surface layered over `integrations/makeswift`:

- `core/b2b/*`
- `core/proxies/with-b2b.ts` and the `withB2B` wiring in `core/proxy.ts`
- `core/next.config.ts` (the `B2B_API_HOST` handling)
- `core/app/[locale]/layout.tsx` (the `B2BLoader`, defined in `core/b2b/loader.tsx`)
- `core/auth/index.ts` + `core/auth/types.ts` (B2B token fields)
- `core/app/[locale]/(default)/(auth)/register/route.ts`
- the cart "add to quote" and PDP quote vibes components: `core/vibes/soul/sections/cart/add-cart-to-quote-button/index.tsx`, `core/vibes/soul/sections/cart/client.tsx`, and `core/vibes/soul/sections/product-detail/product-detail-form.tsx`
- the B2B keys in `core/messages/en.json` (`addToQuote`, `addToQuoteFromCart`, `addToShoppingList`)

## Branch-specific notes

- b2b-makeswift builds on `integrations/makeswift`, so it syncs from there (**not** `canary` directly). Run this **after** syncing `integrations/makeswift`.
- **Never** let the upstream's `@bigcommerce/catalyst-makeswift` name win in `core/package.json`. Unlike a plain mispublish, regressing this name would republish over the **real, in-use Makeswift package**.
- Steady state: this branch is level with `integrations/makeswift` and is synced as part of each release, so the one-time catch-up flow does not apply. Confirm before assuming either way — compare the merge base against the upstream's latest release commit rather than trusting this note.
