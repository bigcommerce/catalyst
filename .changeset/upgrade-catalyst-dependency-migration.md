---
"@bigcommerce/catalyst": minor
---

`catalyst upgrade` now keeps your `@bigcommerce/catalyst*` dependencies up to date.

Until now these versions never moved during an upgrade, so a project stayed pinned to whatever it was created with. The upgrade now brings them to the versions that shipped with the release you're upgrading to, handled like any other change: applied automatically, or flagged as a conflict if you'd pinned one on purpose.

If your project still references these packages with `workspace:^`, the upgrade offers to swap them for published versions so your package manager can keep them current from then on. Declining, running without a terminal, or using `--dry-run` changes nothing; `--yes` accepts.

Two new reminders round it out: run an install when the upgrade touched your `package.json`, and update `@bigcommerce/catalyst` itself when a newer version is out.
