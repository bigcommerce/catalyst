---
"@bigcommerce/catalyst": patch
---

Stop asking users to log in again after `catalyst create`. Credentials from the initial authentication are now written to the new project's `.bigcommerce/project.json` on every scaffold, not just `--hosting commerce`, so `catalyst deploy` no longer fails with "Missing credentials" and `catalyst project create` no longer re-prompts for login.
