---
'@bigcommerce/catalyst': patch
---

Install dependencies with the package manager on your PATH instead of corepack's cached default version, and on pnpm 11+ write the build allowlist to `pnpm-workspace.yaml` so installs don't fail with `ERR_PNPM_IGNORED_BUILDS`.
