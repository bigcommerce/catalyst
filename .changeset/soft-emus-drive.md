---
"@bigcommerce/catalyst-core": patch
---

Add aria-label to currency selector and PDP wishlist buttons

## Migration
1. Copy all changes from the `/messages/en.json` file to get updated translation keys
2. Add the `label` prop to the `Heart` component in `/core/vibes/soul/primitives/favorite/heart.tsx`
3. Add the `label` prop to the `Favorite` component in `/core/vibes/soul/primitives/favorite/index.tsx` and pass it to the `Heart` component
4. Copy all changes in the `/core/vibes/soul/navigation/index.tsx` file to add the `switchCurrencyLabel` property
5. Update `/core/components/header/index.tsx` file to pass the `switchCurrencyLabel` to the `HeaderSection` component
6. Update `/core/app/[locale]/(default)/product/[slug]/_components/wishlist-button/index.tsx` to pass the `label` prop to the `Favorite` component
