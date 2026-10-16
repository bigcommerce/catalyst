---
'@bigcommerce/catalyst-core': minor
---

Add a `DISABLE_ANALYTICS` env var. When set to `true`, the storefront sends no analytics: no BigCommerce `VisitStarted` or `ProductViewed` events (existing `catalyst.visitorId`, `catalyst.visitId` and `catalyst.productViews` cookies are removed), no Google Analytics, no Script Manager scripts in the Analytics category, and no Vercel Analytics or Speed Insights. Set it at build time, since the root layout reads it while prerendering.

## Migration

Add `core/lib/analytics/is-analytics-disabled.ts`:

```ts
export const isAnalyticsDisabled = () => process.env.DISABLE_ANALYTICS === 'true';
```

Then check it in each place analytics are sent:

- `core/proxies/with-analytics-cookies.ts`: move the cookie deletion from the `declined` branch into a `deleteAnalyticsCookies()` function, and first thing, when `isAnalyticsDisabled()`, call it and return `next(request, event)`.
- `core/proxies/with-routes.ts`: add `!isAnalyticsDisabled() &&` to the condition that calls `recordProductVisit`.
- `core/components/consent-manager/_actions/start-visit.ts`: return early when `isAnalyticsDisabled()`.
- `core/components/consent-manager/index.tsx`: when `isAnalyticsDisabled()`, drop `measurement` scripts before passing `scripts` to `ConsentManagerProvider`, and don't render `<StartVisitOnConsent />`.
- `core/app/[locale]/layout.tsx`: return `null` from `VercelComponents` when `isAnalyticsDisabled()`, and pass `settings={isAnalyticsDisabled() ? null : rootData.data.site.settings}` to `AnalyticsProvider`.
