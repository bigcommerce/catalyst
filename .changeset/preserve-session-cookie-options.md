---
'@bigcommerce/catalyst-core': patch
---

Preserve configured Auth.js session-token cookie attributes when converting the token to a browser-session cookie. This prevents integrations that use partitioned cookies from creating a second, unpartitioned session token that can survive logout.
