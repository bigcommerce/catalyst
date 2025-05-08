---
"@bigcommerce/create-catalyst": minor
---

Expands the supported Node.js version of the `create-catalyst` CLI to `^20` and `^22`. The version of Node.js required to run the CLI is not necessarily tied to the version of Node.js required to run Catalyst; the CLI requires at least version 18 to run because it depends on global Fetch API support being enabled by default. More context in [#2296](https://github.com/bigcommerce/catalyst/pull/2296).
