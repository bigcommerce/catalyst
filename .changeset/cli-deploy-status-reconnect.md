---
'@bigcommerce/catalyst': patch
---

`catalyst deploy` no longer crashes with `TypeError: terminated` when the deployment status stream disconnects. It reconnects until the deployment completes or fails, and no longer reports success when the stream closes before the deployment finishes.
