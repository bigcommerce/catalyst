---
"@bigcommerce/catalyst-core": patch
---

Gate `catalyst.visitorId`, `catalyst.visitId`, and `currencyCode` cookies behind shopper consent. The visitor and visit cookies now require measurement consent and the currency preference cookie requires functionality consent. When consent is absent, existing analytics cookies are deleted on the next request. When measurement consent is granted mid-session, a new `startVisit` server action sets the cookies and fires the server-side `visitStartedEvent` immediately rather than waiting for the next full-page navigation.
