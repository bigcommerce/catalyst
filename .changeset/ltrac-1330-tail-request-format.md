---
"@bigcommerce/catalyst": patch
---

Print every request under `catalyst logs tail --format request`, including requests that emitted no log messages. Previously each line was tied to a log entry, so a request that logged nothing disappeared from the stream. The `request` format now reads `[timestamp] METHOD URL (status) [LEVEL] message`, moving the level after the request details in both `logs tail` and `logs query`. `catalyst logs tail --help` now documents each format and notes that `default` and `short` only show requests with a message body.
