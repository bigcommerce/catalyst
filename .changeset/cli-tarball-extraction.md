---
"@bigcommerce/catalyst": minor
---

Replace `git clone` with tarball extraction in `catalyst create`. Merchants now receive a clean standalone project (only `core/`, flattened to the project root) instead of the full monorepo: the tarball is downloaded from GitHub's codeload endpoint, `workspace:` dependencies are resolved to their published npm versions, and a fresh git repository is initialized. The package manager is detected from `npm_config_user_agent` (npm, pnpm, yarn, or bun) and used to install.
