---
"@bigcommerce/catalyst-core": minor
---

Proxy the UCP (agentic commerce) endpoints to the store's canonical domain. UCP is served by the BigCommerce platform rather than by Catalyst, but agents discover and call it on the storefront's public domain. Requests to `/.well-known/ucp` and `/api/ucp/*` are now passed through to `https://<store>.mybigcommerce.com` and the upstream status, headers and body returned, for every HTTP method. Previously `/api/ucp/*` was excluded from the proxy matcher and 404'd, while `/.well-known/ucp` was locale-redirected before being resolved against BigCommerce's route graph.

Headers are filtered with an allowlist in both directions, derived from the [UCP REST transport spec](https://ucp.dev/2026-04-08/specification/checkout-rest/), so anything the spec does not name is dropped rather than leaked to a separate origin over the public internet. Cookies are dropped in both directions because the UCP endpoints are stateless, and `host`/`x-forwarded-*`/`forwarded` are dropped because Catalyst reaches the canonical domain as an ordinary client, not as a trusted proxy.

Implemented as a new `proxies/with-ucp-proxy` factory, registered first in `proxy.ts` so locale rewriting, route resolution and anonymous session creation are bypassed. The upstream origin comes from the existing build-time `buildConfig.get('urls').vanityUrl`, so no new environment variable is required.

If you have customised `proxy.ts`, add `withUcpProxy` as the first argument to `composeProxies` and add `/api/ucp/:path*` to `config.matcher`.
