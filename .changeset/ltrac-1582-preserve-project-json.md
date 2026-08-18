---
"@bigcommerce/catalyst": patch
---

Stop `catalyst deploy` from wiping stored deployment environment variables. Commerce Hosting setup rebuilt `.bigcommerce/project.json` from scratch, dropping anything it didn't write itself — the `env` block managed by `catalyst env`, the persisted `apiHost`, and stored credentials when setup ran without them. Because `deploy` re-runs setup whenever the project isn't fully transformed, a routine deploy could silently discard variables that are sent as secrets on every deploy, leaving the next one to ship without them. Setup now merges into the existing file.
