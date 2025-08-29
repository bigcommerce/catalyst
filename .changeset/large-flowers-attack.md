---
"@bigcommerce/catalyst-core": patch
---

Add visual queues when the cart state is being updated in the Cart page. Will also warn about pending state when trying to navigate away from page.

## Migration

1. Update `/core/vibes/soul/sections/cart/client.tsx` to include latest changes:
  - Use `isLineItemActionPending` to track when we need to disable checkout button and add a loading state.
  - Add skeletons to checkout summary fields that will update when the pending state is complete.
  - Add side effects to handle when a user `beforeunload` and when user tries to navigate using a link.
  - Add prop to `lineItemActionPendingLabel` to be able to pass in a translatable label to the window alert.
2. Add label to dictionary of choice.
