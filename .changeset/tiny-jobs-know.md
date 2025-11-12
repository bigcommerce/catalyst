---
"@bigcommerce/catalyst-core": patch
---

Minor refactor to improve the performance when navigating from the cart to the checkout.
- [#2680](https://github.com/bigcommerce/catalyst/pull/2680)
- [#2681](https://github.com/bigcommerce/catalyst/pull/2681)

### Migration

Use the above PR diffs as a reference.

1. Remove `core/app/[locale]/(default)/cart/_actions/redirect-to-checkout.ts`
2. Update `checkoutAction` in `core/app/[locale]/(default)/cart/page.tsx` to `"/checkout"`
3. Copy changes to `core/app/[locale]/(default)/checkout/route.ts`
4. Update `core/lib/server-toast.ts` and set the cookie `maxAge` to `1` - this ensures any toast errors live through the redirect back to the `/cart` page
5. Copy changes in `core/vibes/soul/sections/cart/client.tsx`
6. Update `en.json` with the updated translation values (optional)
