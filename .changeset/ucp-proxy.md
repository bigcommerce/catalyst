---
"@bigcommerce/catalyst-core": minor
---

Serve the UCP (agentic commerce) endpoints. Agents discover and call UCP on the storefront's public domain, but it is served by the BigCommerce platform rather than by Catalyst, so `/.well-known/ucp` and `/api/ucp/*` are now proxied through to BigCommerce for every HTTP method. Previously `/api/ucp/*` 404'd and `/.well-known/ucp` was locale-redirected.

Only the headers the [UCP REST transport spec](https://ucp.dev/2026-04-08/specification/checkout-rest/) defines are passed in either direction, so nothing outside the spec is exchanged with a separate origin. No new environment variable is required.

If you have customised `proxy.ts`, add `withUcpProxy` as the first argument to `composeProxies` and add `/api/ucp/:path*` to `config.matcher`.
