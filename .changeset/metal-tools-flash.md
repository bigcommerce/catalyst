---
"@bigcommerce/catalyst-core": minor
---

Cart ID is now written to a signed JWT to improve security around reading cart IDs. Provides backwards compatibility to reading unsigned cart cookie but signs the value for the next read.
