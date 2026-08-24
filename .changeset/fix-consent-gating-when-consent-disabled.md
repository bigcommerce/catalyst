---
"@bigcommerce/catalyst-core": patch
---

Fix consent-gated cookies being withheld on stores that have cookie consent disabled. c15t grants every consent category client-side when consent is disabled, but only in its in-memory store, so no consent cookie was ever written and server-side checks treated the shopper as having declined — silently dropping the selected currency and preventing the `catalyst.visitorId` / `catalyst.visitId` cookies from being set. The consent manager now persists that automatic grant, so the consent cookie stays the single source of truth on both the client and the server.
