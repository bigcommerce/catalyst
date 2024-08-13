---
"@bigcommerce/catalyst-core": minor
---

Fetch shipping zones if access token exists, otherwise regress back to using the geography node on graphql for shipping information. This is part of an effort to remove the need of the `BIGCOMMERCE_ACCESS_TOKEN`.
