---
"@bigcommerce/catalyst-core": patch
---

Prevent breadcrumb array mutation on cached web pages by spreading the React `cache()` result before reversing, and fix an off-by-one in `truncateBreadcrumbs` that incorrectly truncated arrays exactly at the target length. Also defer `ProductReviewSchema` to client-only rendering to avoid a DOMPurify SSR crash.
