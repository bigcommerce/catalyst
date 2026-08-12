---
"@bigcommerce/catalyst-core": patch
---

Fix session cookie deletion being silently broken after logout. `stripSessionCookieExpiry` was stripping `Expires` from all session token `Set-Cookie` headers, including deletion directives (empty value + `Expires=past`). This turned cookie deletions into permanent empty-value session cookies, so the browser never removed them and stale cookies accumulated across login/logout cycles.
