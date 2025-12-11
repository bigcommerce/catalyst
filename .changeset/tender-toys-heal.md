---
"@bigcommerce/catalyst-core": minor
---

Add the following messages to each line item on cart page based on store inventory settings:
- Fully/partially out-of-stock message if enabled on the store and the line item is currently out of stock
- Ready-to-ship quantity if enabled on the store
- Backordered quantity if enabled on the store

## Migration
For existing Catalyst stores, to get the newly added feature, simply rebase the existing code with the new release code. The files to be rebased for this change to be applied are:
- core/app/[locale]/(default)/cart/page-data.ts
- core/app/[locale]/(default)/cart/page.tsx
- core/messages/en.json
- core/vibes/soul/sections/cart/client.tsx
