---
'@bigcommerce/catalyst-core': minor
---

Add a `DISABLE_ANALYTICS` env var. When set to `true`, the storefront sends no analytics: no BigCommerce `VisitStarted` or `ProductViewed` events (and no `catalyst.visitorId`, `catalyst.visitId` or `catalyst.productViews` cookies), no Google Analytics, and no Vercel Analytics or Speed Insights. Set it at build time, since the root layout reads it while prerendering.

## Migration

Add `core/lib/analytics/is-analytics-disabled.ts`:

```ts
export const isAnalyticsDisabled = () => process.env.DISABLE_ANALYTICS === 'true';
```

Then check it in each place analytics are sent:

- `core/proxies/with-analytics-cookies.ts`: return `next(request, event)` first thing when `isAnalyticsDisabled()`.
- `core/proxies/with-routes.ts`: add `!isAnalyticsDisabled() &&` to the condition that calls `recordProductVisit`.
- `core/components/consent-manager/_actions/start-visit.ts`: return early when `isAnalyticsDisabled()`.
- `core/components/consent-manager/index.tsx`: render `<StartVisitOnConsent />` only when `!isAnalyticsDisabled()`.
- `core/app/[locale]/layout.tsx`: return `null` from `VercelComponents` when `isAnalyticsDisabled()`, and pass `settings={isAnalyticsDisabled() ? null : rootData.data.site.settings}` to `AnalyticsProvider`.
