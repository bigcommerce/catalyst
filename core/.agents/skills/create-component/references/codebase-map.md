# Codebase map

Where things are in a Catalyst storefront. Paths start at the storefront folder. A fork can move files, so check that a path exists.

## Pages

| Need                              | Where                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Home page                         | `app/[locale]/(default)/page.tsx` and `page-data.ts`                                                    |
| Product page                      | `app/[locale]/(default)/product/[slug]/`                                                                |
| Category, brand, and search pages | `app/[locale]/(default)/(faceted)/`                                                                     |
| Cart page                         | `app/[locale]/(default)/cart/`                                                                          |
| Account pages                     | `app/[locale]/(default)/account/` (addresses, orders, settings, wishlists). There is no dashboard page. |
| Layout, header, and footer        | `app/[locale]/(default)/layout.tsx`, `components/header/`, `components/footer/`                         |
| Server actions                    | `_actions/` next to the page, or `components/<name>/_actions/` for a header part                        |

## Data

| Need                        | Where                                                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Fragment to copy            | `components/featured-products-list/fragment.ts`                                                                            |
| Signed-in data file to copy | `app/[locale]/(default)/account/settings/page-data.tsx`                                                                    |
| Session                     | `getSessionCustomerAccessToken` and `isLoggedIn` in `~/auth`                                                               |
| Currency                    | `getPreferredCurrencyCode` in `~/lib/currency`, type `CurrencyCode` in `~/components/header/fragment`                      |
| Default cache time          | `revalidate` in `~/client/revalidate-target` (3600 seconds)                                                                |
| Product cards               | `components/product-card/fragment.ts`, `~/data-transformers/product-card-transformer`                                      |
| Prices                      | `client/fragments/pricing.ts`, `~/data-transformers/prices-transformer`, `vibes/soul/primitives/price-label`               |
| Search and filters          | `components/header/_actions/search.ts`, `app/[locale]/(default)/(faceted)/fetch-faceted-search.ts`                         |
| Cart writes                 | `addToOrCreateCart` in `~/lib/cart`. Add to cart by product ID: `app/[locale]/(default)/compare/_actions/add-to-cart.tsx`  |
| Merchant HTML               | `rewriteWysiwygContentUrls` in `~/data-transformers/html-content-transformer`                                              |
| Consent                     | `hasConsentFor` in `~/lib/consent-manager/has-consent-for` (server), `useConsentManager` in `@c15t/nextjs/client` (client) |
| Locale and channel          | `client/before-request.ts`, `channels.config.ts`                                                                           |

## UI

| Need                                      | Where                                                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme tokens and fonts                    | `globals.css`, `app/fonts.ts`                                                                                                                     |
| Streamable and Stream                     | `@/vibes/soul/lib/streamable`                                                                                                                     |
| Section wrapper, skeleton, buttons, badge | `vibes/soul/sections/section-layout`, `vibes/soul/primitives/` (`skeleton`, `button`, `button-link`, `badge`)                                     |
| Product rail                              | `vibes/soul/sections/product-carousel`. `featured-product-carousel` wraps it and always shows an empty state.                                     |
| Announcement bar                          | `banner` slot of `vibes/soul/sections/header-section`. It renders `vibes/soul/primitives/banner`.                                                 |
| Header search popup                       | `SearchForm` in `vibes/soul/primitives/navigation/index.tsx`                                                                                      |
| YouTube video                             | `LiteYouTube` in `vibes/soul/sections/product-detail/`                                                                                            |
| Form fields                               | `vibes/soul/form/`                                                                                                                                |
| Toasts                                    | `toast` in `@/vibes/soul/primitives/toaster`                                                                                                      |
| Images and links                          | `Image` in `~/components/image`, `Link` in `~/components/link`. Lint blocks `next/link`.                                                          |
| Radix primitives                          | accordion, checkbox, dialog, dropdown-menu, navigation-menu, popover, radio-group, select, switch, toggle, tooltip. There is no combobox library. |
| Animations                                | Keyframes in `tailwind.config.js`. For a marquee, use `animate-scrollLeft` with `--marquee-duration`.                                             |
| Analytics events                          | `lib/analytics/`                                                                                                                                  |
| Content security policy                   | `lib/content-security-policy.ts`                                                                                                                  |
