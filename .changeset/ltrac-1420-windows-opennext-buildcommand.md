---
"@bigcommerce/catalyst": patch
---

Fix `catalyst build`/`catalyst deploy` failing on native Windows during the OpenNext step. The generated `open-next.config.ts` hardcoded `node_modules/.bin/next build` as its `buildCommand`, which OpenNext runs through `execSync` (cmd.exe on Windows) — where the extensionless POSIX shim and forward-slash path fail to resolve. It now invokes `node ./node_modules/next/dist/bin/next build`, which works identically across sh and cmd.exe while still skipping the project's `generate` step.
