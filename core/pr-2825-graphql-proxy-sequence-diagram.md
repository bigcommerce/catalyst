# PR #2825 Analysis: GraphQL Proxy Middleware

This document analyzes [bigcommerce/catalyst#2825](https://github.com/bigcommerce/catalyst/pull/2825) and models the request flow introduced by `withGraphqlProxy`.

## Summary of behavior changes

- Adds a new middleware: `withGraphqlProxy` (`core/middlewares/with-graphql-proxy.ts`).
- Inserts it in `core/middleware.ts` after `withChannelId` and before `withRoutes`.
- Intercepts only requests to `/graphql` with an allowed requester header.
- Proxies valid GraphQL POST payloads through the existing Catalyst GraphQL client.
- Preserves browser cookie context and passes optional customer auth token to Storefront API requests.
- Falls through to `withRoutes` when request path or requester header does not match proxy criteria.

## Middleware order after PR #2825

1. `withAuth`
2. `withIntl`
3. `withAnalyticsCookies`
4. `withChannelId`
5. `withGraphqlProxy` (new)
6. `withRoutes`

## Sequence diagram

```mermaid
sequenceDiagram
    autonumber
    participant Client as Browser / checkout-sdk-js
    participant AuthMW as withAuth
    participant IntlMW as withIntl
    participant AnalyticsMW as withAnalyticsCookies
    participant ChannelMW as withChannelId
    participant ProxyMW as withGraphqlProxy
    participant RoutesMW as withRoutes
    participant AuthWrap as auth(...) in withGraphqlProxy
    participant GqlClient as client.fetch(...)
    participant Storefront as BigCommerce Storefront GraphQL API

    Client->>AuthMW: Incoming request
    AuthMW->>IntlMW: next(request, event)
    IntlMW->>AnalyticsMW: set x-bc-locale, continue
    AnalyticsMW->>ChannelMW: set visitor/visit cookies, continue
    ChannelMW->>ProxyMW: set x-bc-channel-id, continue

    alt Request path is not /graphql
        ProxyMW->>RoutesMW: next(request, event)
        RoutesMW-->>Client: rewrite/redirect/response
    else Request path is /graphql
        ProxyMW->>ProxyMW: Read x-catalyst-graphql-proxy-requester
        alt Missing or disallowed requester
            ProxyMW->>RoutesMW: next(request, event)
            RoutesMW-->>Client: route handling response
        else Allowed requester
            alt HTTP method is not POST
                ProxyMW-->>Client: 405 Method not allowed
            else HTTP method is POST
                ProxyMW->>AuthWrap: auth(handler)(request, event)
                AuthWrap-->>ProxyMW: req.auth?.user?.customerAccessToken
                ProxyMW->>ProxyMW: Parse JSON body with zod
                alt query is missing
                    ProxyMW-->>Client: 400 { error: "Missing query" }
                else query present
                    ProxyMW->>GqlClient: client.fetch({document, variables, customerAccessToken, Cookie, revalidate: 0})
                    GqlClient->>Storefront: GraphQL request (channel resolved by client)
                    Storefront-->>GqlClient: GraphQL payload/errors
                    GqlClient-->>ProxyMW: response object
                    ProxyMW-->>Client: 200 JSON(response)
                end
                opt Any parse/fetch/runtime error
                    ProxyMW-->>Client: 500 JSON(error)
                end
            end
        end
    end
```

## Key implementation notes

- **Guard rails:** proxying is constrained by both route (`/graphql`) and requester allowlist (`x-catalyst-graphql-proxy-requester`).
- **Auth context:** middleware wraps proxy handling in `auth(...)` to obtain `customerAccessToken` when available.
- **Channel + locale continuity:** placing proxy middleware after `withChannelId` ensures channel context is resolved before API calls.
- **Cookie forwarding:** original request cookies are forwarded to emulate browser-originated Storefront API behavior.
- **No-cache fetch option:** `next: { revalidate: 0 }` is used for proxy requests to avoid stale responses.
