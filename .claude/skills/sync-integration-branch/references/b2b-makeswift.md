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
- `core/middlewares/with-b2b.ts` and the `withB2B` wiring in `core/middleware.ts`
- `core/next.config.ts` (B2B hooks)
- the `app/[locale]/**/layout.tsx` files (the `B2BLoader`)
- `core/auth/index.ts` + `core/auth/types.ts` (B2B token fields)
- the register `route.ts`
- the cart "add to quote" + PDP quote vibes components
- the B2B keys in `core/messages/en.json`

## Branch-specific notes

- b2b-makeswift builds on `integrations/makeswift`, so it syncs from there (**not** `canary` directly). Run this **after** syncing `integrations/makeswift`.
- **Never** let the upstream's `@bigcommerce/catalyst-makeswift` name win in `core/package.json`. Unlike a plain mispublish, regressing this name would republish over the **real, in-use Makeswift package**.
- **Currently in one-time catch-up.** b2b-makeswift trails makeswift by several minors. Follow the "One-time catch-up" section in SKILL.md: merge `@bigcommerce/catalyst-makeswift` **minor** tags one at a time (`@1.7.0` → `@1.8.0` → `@1.9.0`) until level, then resume steady-state syncs that merge `origin/integrations/makeswift` directly.
