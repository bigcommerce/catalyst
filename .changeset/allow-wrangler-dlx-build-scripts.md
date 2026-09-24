---
"@bigcommerce/catalyst": patch
---

Fix `catalyst build` and `catalyst deploy` failing on pnpm 12 with `ERR_PNPM_IGNORED_BUILDS`. pnpm 12 stops `pnpm dlx` when a package has build scripts that haven't been approved, and Wrangler depends on `esbuild` and `workerd`, which both have one. The Wrangler dry-run now passes `--allow-build` for those two packages. Older pnpm versions accept the same flags.
