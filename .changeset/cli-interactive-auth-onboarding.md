---
"@bigcommerce/catalyst": patch
---

Make `catalyst auth login` and `catalyst project create` walk first-time users through authentication interactively. When the browser-based device-code flow isn't available, the CLI now offers to fall back to a guided store-hash + access-token prompt (with credential validation against the store profile API). `catalyst project create` no longer requires credentials up front — it kicks off the same interactive login when none are stored.
