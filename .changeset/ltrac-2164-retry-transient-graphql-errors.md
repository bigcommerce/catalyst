---
"@bigcommerce/catalyst-client": patch
---

Retry Storefront GraphQL queries that fail on a dropped connection or a `502`, `503`, or `504`. Previously a single upstream hiccup threw straight to the error page ("There was a server error!"). Queries are now retried up to twice, after 100ms and 300ms, including when the connection drops while the response body is being read (`TypeError: terminated`). Mutations are never retried, since they aren't idempotent, and 4xx responses, GraphQL errors, and aborted requests fail immediately as before. Each retry logs a `console.warn` naming the operation, the attempt, and the failure (for example `[BigCommerce] Retrying query GetSite after HTTP 502 (attempt 2 of 3)`), so recovered failures still show up in server logs.
