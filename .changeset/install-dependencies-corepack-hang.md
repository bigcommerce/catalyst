---
"@bigcommerce/catalyst": patch
---

Fix the dependency install step hanging indefinitely during `catalyst project link` and the `catalyst deploy` first-run setup. The install ran nypm in silent mode, which pipes the child process's stdio; because nypm routes pnpm/yarn through corepack, corepack's "download this package manager version?" confirmation prompt was left waiting on stdin that never arrived — an invisible, unanswerable deadlock. The install now inherits stdio so prompts and progress are visible and answerable. The `link`/`deploy` setup paths also now detect the project's actual package manager from its lockfile instead of always forcing pnpm.
