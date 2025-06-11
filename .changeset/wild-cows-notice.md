---
"@bigcommerce/catalyst-core": minor
---

Move the anonymous session into it's own cookie, separate from Auth.js in order to have better non-persistent cart support.

### Migration

If you were using `await signIn('anonymous', { redirect: false });`, you'll need to migrate over to using the `await anonymousSignIn()` function. Otherwise, we am only changing the underlying logic in existing API's so pulling in the changes should immediately pick this up.
