---
'@bigcommerce/catalyst': patch
---

`catalyst logs tail` no longer drops log events when it rotates its connection, and no longer prints the same event twice after reconnecting.
