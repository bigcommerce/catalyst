---
"@bigcommerce/catalyst-core": patch
---

Update GQL client and auth middleware to handle invalid tokens and invalidate session.

### Summary

This will ensure that if a user is logged out elsewhere, they will be redirected to the /login page when they try to access a protected route.

Previously, the pages would 404 which is misleading.

### Migration

1. Copy all changes from the `/core/client` directory and the `/packages/client` directory
3. Copy translation values
4. Copy all changes from the `/core/app/[locale]/(default)/account/` directory server actions
5. Copy all changes from the `/core/app/[locale]/(default)/checkout/route.ts` file
