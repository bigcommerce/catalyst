# Catalyst verification map

This directory is the maintained source for verifying shopper-facing behavior. Read this index before driving the storefront, then use the matching feature file as the recipe. Handles below come from the stock Catalyst UI (`vibes/soul`) with English messages. If your storefront has a customized UI or another default locale, run `verify explore` and update the files.

## Baseline preconditions

- Run `verify doctor` with no `FAIL`, against a server you started with `verify launch` (or one you were explicitly given via `--url`).
- The store has at least one visible, purchasable product. Find one with the search popup or a category page. Do not assume a product URL, because catalogs differ per store.
- Signed-in journeys need `TEST_CUSTOMER_EMAIL` and `TEST_CUSTOMER_PASSWORD` in `.env.test.local`. Journeys receive these as `env`.
- Cookie consent: if the store enables a consent banner, it can cover the bottom of the page. Accept or dismiss it in the first step and capture that step.

## Driving conventions

- Navigate with `page.goto('/path')`; the base URL is set for you. With the default locale, paths have no locale prefix (`/cart`, not `/en/cart`).
- Locate by role and accessible name. Tailwind class names are not stable handles.
- Wait for UI state with `expect(...)` assertions, never fixed sleeps. Server actions and streamed (Suspense) sections finish after `load`.
- One `step` per shopper action, named by what it proves.
- Every mutation (cart, wishlist, account) touches the live store. Prefer flows that are reversible, and restore state at the end: remove the cart line you added.

## Proof and skip reporting

- UI proof is the step screenshot plus an `expect` on the visible result. For mutations, add a second, read-only view, such as reloading `/cart` after adding a line.
- Responsive or layout changes need captures at both `--device desktop` and `--device mobile`.
- Report an unreachable path with the attempted action and the unmet precondition (for example "store has no country without states").
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections, in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with verify.mjs` (starting with `Preconditions:`), and `Gotchas`. Keep implementation details out; name only user paths, stable handles, required state, and observable proof.

## Features

- [Search](./search.md) covers the header search popup, the search results page, and empty results.
- [Product detail page](./product-detail.md) covers the gallery, quantity, add to cart, and the added-to-cart toast.
- [Cart](./cart.md) covers line items, quantity changes, removal, the summary, and the checkout handoff.
- [Account](./account.md) covers log in, registration (including State/Province rules), and the signed-in account area.
