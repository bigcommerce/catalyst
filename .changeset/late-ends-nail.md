---
"@bigcommerce/catalyst-core": minor
---

Add the ability to redirect from the login page. Developers can now append a relative path to the `?redirectTo=` query param on the `/login` page. When a shopper successfully logs in, it'll redirect them to the given relative path. Defaults to `/account/orders` to prevent a breaking change.
