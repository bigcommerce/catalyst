---
"@bigcommerce/catalyst-core": patch
---

Wrap IP forwarding headers (`X-Forwarded-For`, `True-Client-IP`) in try/catch for safety inside `unstable_cache` contexts where `headers()` is unavailable.
