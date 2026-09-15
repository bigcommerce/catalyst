---
"@bigcommerce/catalyst": patch
---

`catalyst channels info` no longer asks you to "Select the channel to update." Its channel picker inherited that copy from `channels update`, which implied a write the command never makes — `info` only reports a channel's storefront, canonical and checkout URLs. It now asks "Select a channel."; the update flows keep their own wording.
