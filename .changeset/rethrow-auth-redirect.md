---
'@bigcommerce/catalyst-core': patch
---

Rethrow Next.js redirects from server action `catch` blocks. When a session is invalidated, the GraphQL client redirects to sign out, but actions such as add to cart caught that redirect and showed it as a form error instead.
