---
'@bigcommerce/catalyst': patch
---

`catalyst build` and `catalyst deploy --env-path <file>` now use only that file. A `.env.local` or `.env` on disk is no longer read by the build or baked into the deployed worker as a runtime fallback.

`catalyst deploy --env-path <file>` also sends the file's variables to the deployment, overriding values saved with `catalyst env add`. `--secret` still wins over both. Previously, saved values overrode the `--env-path` file at runtime.
