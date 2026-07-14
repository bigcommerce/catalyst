---
"@bigcommerce/catalyst": patch
---

The CLI now follows `.env.example` as the source of truth when writing `.env.local`. Generated env files preserve the documented ordering and per-key comment blocks, render documented-but-unsupplied keys as blank/default active keys, and append any CLI-only variables in a clearly separated trailing section. Existing `.env.local` values are reconciled rather than clobbered on re-runs (e.g. `channel link`), so user-set values are preserved while newly documented keys are added in their canonical position.
