---
"@bigcommerce/create-catalyst": major
---

Reduce `create-catalyst` to a thin wrapper that delegates to `catalyst create`. `pnpm create catalyst` / `npx create-catalyst` still scaffold a project — now by invoking `@bigcommerce/catalyst` under the hood — so the scaffolding UX is unchanged. The standalone `init`, `integration`, and `telemetry` subcommands are removed; use `catalyst channel link` and `catalyst telemetry` from the consolidated CLI instead.
