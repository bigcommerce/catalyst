---
"@bigcommerce/create-catalyst": minor
---

BREAKING: Remove `applyIntegrations`. Integrations will now be applied by simply fetching the appropriate remote `integrations/*` branch from upstream, and cherry-picking the integration code
