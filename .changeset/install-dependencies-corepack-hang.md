---
"@bigcommerce/catalyst": patch
---

Fix the dependency install step hanging indefinitely during `catalyst project link` and the `catalyst deploy` first-run setup. nypm runs the install through tinyexec, which in silent mode drains the child's stdout to completion before it reads stderr; pnpm floods stderr with Node warnings (on Node 26, thousands of `File descriptor N opened in unmanaged mode` lines), filling the stderr pipe buffer while tinyexec is still on stdout, so pnpm blocks writing and the install deadlocks. The install now runs the child with `NODE_NO_WARNINGS` (and pins `COREPACK_ENABLE_DOWNLOAD_PROMPT` off) so stderr never fills. The `link`/`deploy` setup paths also now detect the project's actual package manager from its lockfile instead of always forcing pnpm.
