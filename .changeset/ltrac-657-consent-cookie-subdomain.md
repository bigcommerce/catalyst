---
"@bigcommerce/catalyst-core": patch
---

Scope the consent manager cookie (`c15t-consent`) to the current host instead of the top-level domain. Previously `crossSubdomain: true` caused the cookie to be set on the root domain (e.g. `.example.com`) for stores running on a sub-domain, so it appeared on both the root domain and the sub-domain. Removing it makes the cookie host-only, so it now exists only on the sub-domain the store runs on.
