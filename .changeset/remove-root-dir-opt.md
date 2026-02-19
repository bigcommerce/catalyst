---
"@bigcommerce/catalyst": minor
---

Remove `--root-dir` flag from `project create` and `project link` commands. Use `process.cwd()` as a hardcoded default for usage simplicity.
