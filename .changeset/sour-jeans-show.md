---
"@bigcommerce/catalyst-core": minor
---

Reorganize and cleanup files:
- Moved `core/context/search-context` to `core/lib/search`.
- Moved `core/client/mutations/add-cart-line-item.ts` and `core/client/mutations/create-cart.ts` into `core/lib/cart/*`.
- Removed `core/client/queries/get-cart.ts` in favor of a smaller, more focused query within `core/lib/cart/validate-cart.ts`.

### Migration
- Replace imports from `~/context/search-context` to `~/lib/search`.
- Replace imports from `~/client/mutations/` to `~/lib/cart/`.
- Remove any direct imports from `~/client/queries/get-cart.ts` and use the new `validate-cart.ts` query instead. If you need the previous `getCart` function, you can copy it from the old file and adapt it to your needs.
