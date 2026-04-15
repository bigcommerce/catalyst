---
"@bigcommerce/catalyst-client": major
"@bigcommerce/catalyst-core": major
---

Redesign `@bigcommerce/catalyst-client` API for `unstable_cache` and `use cache` compatibility.

Breaking changes:
- Remove `beforeRequest` callback — replaced by sync `getHeaders()` config
- Remove `fetchOptions` parameter from `client.fetch()` — caching is the caller's responsibility
- Remove `getChannelId` callback — replaced by `channelIdsByLocale` config map
- Remove `FetcherRequestInit` generic type parameter
- `channelId` is now required in `ClientConfig`

New features:
- `locale` parameter on `client.fetch()` — sets `Accept-Language` header and resolves channel via `channelIdsByLocale`
- `headers` parameter on `client.fetch()` — per-request headers (e.g. IP forwarding)
- `getHeaders()` config — sync callback for global headers (e.g. correlation ID)
- `channelIdsByLocale` config — declarative locale-to-channel mapping
