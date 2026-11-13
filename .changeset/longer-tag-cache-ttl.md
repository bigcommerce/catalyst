---
"@bigcommerce/catalyst": patch
---

Keep tag-cache lookups in the regional cache for 60 seconds instead of 5. On low-traffic stores the entry had usually expired, so most cached page renders waited about a second for a Durable Object round trip. Rebuild and redeploy with this CLI version to pick it up.
