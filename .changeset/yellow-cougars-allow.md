---
"@bigcommerce/catalyst-core": minor
---

If a customer is already logged in, we want to redirect them back to their account pages if they are trying to hit one of the non-logged-in customer auth routes. The prevents any side effects that may occur trying to re-auth the client. This is done by providing a root layout.tsx page under the (auth) route group.
