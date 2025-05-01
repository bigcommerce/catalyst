---
"@bigcommerce/catalyst-core": patch
---

Remove `error.name` check for auth error in Login, since `error.name` gets minified in production and the check never returns `true`.

Migration:

- Remove `error.name === 'CallbackRouteError'` check in the error handling of the login action.
