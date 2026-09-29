---
'@bigcommerce/catalyst': patch
---

`catalyst deploy` now sends `CATALYST_HOSTING=native` as a plain-text deployment variable so the storefront can identify itself as native hosted.
