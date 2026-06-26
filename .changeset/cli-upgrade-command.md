---
"@bigcommerce/catalyst": minor
---

Add `catalyst upgrade` command for upgrading a Catalyst project to a newer version via a 3-way merge. The command downloads the base and target version tarballs, runs a whole-tree `git merge-tree` merge (falling back to per-file `git merge-file` on older git), and applies the result directly to the project — never aborting, always producing resolvable `<<<ours/===/theirs>>>` markers for conflicts. Clean changes are pre-staged; conflicts are registered as real unmerged index entries so editors surface the merge UI. Supports flat and nested repo layouts, integration tag families (`--ref`), dry-run preview, explicit base override (`--from`), and alternate source repos (`--repository`). Projects without a `catalyst.ref` tracking field are detected automatically and backfilled.
