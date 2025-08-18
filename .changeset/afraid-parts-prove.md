---
"@bigcommerce/catalyst-core": patch
---

The anonymous session cookie had `secure` always set to true regardless if we were prefixing it or not. This change updates the cookie to set `secure` to the same "value" if we prefix the cookie with `__Secure-`.
