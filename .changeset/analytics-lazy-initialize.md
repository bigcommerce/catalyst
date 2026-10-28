---
'@bigcommerce/catalyst-core': patch
---

Initialize analytics providers before the first event. Events like `productViewed` fire from child effects that run before `AnalyticsProvider` calls `initialize()`, so the Google Analytics provider called `gtag` before it was defined.
