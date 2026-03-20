---
'@bigcommerce/create-catalyst': patch
---

Align Node.js engine requirement with v24. The `engines.node` field in `create-catalyst` now matches the runtime version gate (`^24.0.0`), ensuring `pnpm create @bigcommerce/catalyst` correctly rejects unsupported Node versions before installation begins.
