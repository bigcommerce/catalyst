---
"@bigcommerce/catalyst-core": patch
---

Fix consent-gated cookies being withheld on stores that have cookie consent disabled. c15t grants every consent category client-side when consent is disabled, but only in its in-memory store, so no consent cookie is ever written and server-side checks treated the shopper as having declined — silently dropping the selected currency and preventing the `catalyst.visitorId` / `catalyst.visitId` cookies from being set. Server-side consent checks now fall back to the store's cookie-consent setting when no consent cookie is present: on stores with consent disabled, consent is implicitly granted, so the analytics proxy starts visits on the first request and the currency preference persists.
