---
"@bigcommerce/catalyst-core": patch
---

Coalesce rapid cart line item quantity and delete clicks into at most one in-flight server action. Quantity buttons now update an optimistic pending intent that flushes a single absolute-quantity `update` intent after a short debounce (replacing the per-click `increment`/`decrement` intents), and deletes are serialized instead of queueing unboundedly. This prevents the serial server-action queue buildup that could lock up navigation on the cart page, and unifies cart revalidation on `revalidateTag`.

The cart section is now keyed by cart `entityId` only (previously `entityId`-`version`) and renders line items from the revalidation-refreshed `cart` prop. Remounting on every mutation swallowed clicks landing during the DOM swap and could drop queued actions, leaving the summary skeletons and checkout button stuck in a pending state until hard refresh.

Each quantity/delete control is now its own progressive-enhancement form that posts a real absolute quantity or delete request to the server action; JS intercepts the submit to route through the coalescing dispatcher, but the buttons keep working (as full page round-trips) before hydration or if the app bundle fails to load.

Also fixes the checkout button getting stuck spinning forever if its navigation is cancelled (Esc, "Stay" on the leave-page prompt, a flaky connection). The URL-string checkout action previously awaited a promise that never resolved, leaving retry clicks queued behind a dead action; it now settles after a short timeout and on bfcache restore, re-enabling the button as a retry.
