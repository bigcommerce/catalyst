---
"@bigcommerce/catalyst-core": patch
---

Check for `error.type` instead of `error.name` auth error in Login, since `error.name` gets minified in production and the check never returns `true`. Additionally, add a check for the `cause.err` to be of type `BigcommerceGQLError`.

Migration:

- Change `error.name === 'CallbackRouteError'` to `error.type === 'CallbackRouteError'` check in the error handling of the login action and include `error.cause.err instanceof BigCommerceGQLError`.
