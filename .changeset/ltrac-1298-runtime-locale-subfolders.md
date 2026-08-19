---
"@bigcommerce/catalyst-core": patch
---

Resolve merchant-configured locale subfolders at runtime instead of baking them in at build time, so custom locale paths such as `/fr-fr` and `/es-es` resolve consistently.

Previously the subfolder table was captured during `next build` into `build-config.json` and statically imported by `i18n/locales.ts`. If the control panel returned incomplete locale data at build time, every localized URL 404'd until the next deploy — and because next-intl treats a custom subfolder as a *replacement* for the bare locale code rather than an alias, there was no fallback: `/es-es` simply did not match any route.

## What changed

- Added `i18n/locale-config.ts`, which reads locale configuration from BigCommerce at runtime and caches it in KV with the same stale-while-revalidate pattern as `proxies/with-routes.ts`. An empty locale list is never cached.
- **Locales are no longer written to `build-config.json` at all.** A build-time snapshot of merchant-configurable data is either redundant or wrong, and using it as a fallback risked silently serving the stale URL space this change exists to fix. Runtime is now the only source. A warm cache rides out a BigCommerce outage; only a cold cache combined with an unreachable API cannot resolve, and that returns `503` with `retry-after` rather than a 404 that would tell crawlers these pages are gone.
- `proxies/with-intl.ts` now builds its next-intl middleware per request from that configuration. It resolves the configuration once per request and forwards it to the render as `x-bc-locale-routing`, so rendering and redirects reuse exactly what resolved the inbound URL rather than fetching it again — the two can't disagree, and there is no extra round trip. It also passes the matched subfolder as `x-bc-locale-prefix`, which `proxies/with-routes.ts` strips instead of recomputing from build-time data.
- `Link`, `useRouter` and `usePathname` now read the runtime configuration through a new provider in `app/[locale]/layout.tsx`, so generated URLs agree with what the proxy resolves. Canonical and hreflang URLs in `lib/seo/canonical.ts` and the header locale switcher do the same.
- `redirect` and `permanentRedirect` moved from `~/i18n/routing` to `~/i18n/navigation-server` and are now `async` — `await` them. This keeps the GraphQL client and KV out of the client bundle.
- Removed `generateStaticParams` from `app/[locale]/layout.tsx`, which only added a build-time dependency on the locale list — every route under `[locale]` already renders on demand because the tree reads cookies. The build's route rendering modes are unchanged.
- `i18n/locales.ts` is removed. The locale gates in `i18n/request.ts` and `app/[locale]/layout.tsx` now use the runtime list, and the sitemap/robots/favicon routes resolve the default channel directly instead of routing through a locale.

Behaviour change for channel-per-locale stores: `robots.txt`, the sitemap index and the favicon now resolve the default channel directly rather than via the default locale, because they run outside the proxy and have no request locale. Stores that map their default locale to a non-default channel in `channels.config.ts` will see those three served from `BIGCOMMERCE_CHANNEL_ID`.

Locale detection is unchanged: a shopper is still redirected to their language's subfolder, and an explicit choice in the locale switcher still wins on later requests.

Fixed along the way:

- `/xmlsitemap.php` and `/admin` redirected through the locale-aware helper, resolving to `/<locale>/sitemap.xml` and `/<locale>/` whenever every locale carries a prefix. The sitemap target was a 404, since `/sitemap.xml` is excluded from the proxy. Both now use plain redirects; `/admin` also no longer performs an uncached GraphQL request on every hit to a route that is disabled by default.
- Losing the KV cache no longer takes the storefront down. A read failure now degrades to a fetch instead of being treated as unresolvable.
- Locale configuration is validated where it is fetched, so an unusable value can no longer be cached and then rejected on every read, which would have silently turned the cache into a per-request refetch. Subfolders are normalized (surrounding slashes and whitespace trimmed), and locale codes and prefixes are constrained to safe URL shapes.
- An unrecognised locale returns 404 rather than 500 when no message file exists for it.
- A locale whose configured subfolder cannot be expressed in a URL is now skipped individually, with an error logged, instead of making the whole configuration unusable.
- The Playwright URL fixtures asserted `/<locale-code>/...` instead of the configured subfolder, so alternate-locale assertions were wrong for any store whose subfolder differs from its locale code (for example `de` served at `/de-de`). They now resolve the subfolder from the store.
