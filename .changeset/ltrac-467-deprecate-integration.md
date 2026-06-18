---
"@bigcommerce/create-catalyst": minor
---

Deprecate the `create-catalyst integration` command. It now prints a deprecation warning when invoked and is hidden from `--help`. The command builds integration patches by diffing git tags, which won't work once Catalyst projects are distributed as tarballs (no git history) — it will be replaced by the forthcoming `catalyst upgrade` command. The command still functions for now; full removal will follow in a future major version.
