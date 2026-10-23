---
"@bigcommerce/catalyst-core": patch
---

Only set the Google Analytics script `nonce` when one is configured. Assigning `undefined` set the attribute to the string `"undefined"`.

Catalyst now lints with [oxlint](https://oxc.rs/docs/guide/usage/linter), formats with [oxfmt](https://oxc.rs/docs/guide/usage/formatter) and type-checks with [tsrs](https://github.com/oxc-project/tsrs) (a Rust port of the TypeScript 7.1 compiler) in place of ESLint, Prettier and `tsc`.

## Migration

- `.eslintrc.cjs`, `.eslintignore` and `prettier.config.js` are replaced by `oxlint.config.mts` and `.oxfmtrc.jsonc`. If you added custom ESLint rules, move them into the `overrides` in `oxlint.config.mts`.
- `pnpm lint` runs `oxlint`, `pnpm typecheck` runs `scripts/typecheck.mjs` (tsrs, or TypeScript 7.1 on Windows and Intel macOS), and the new `pnpm format` / `pnpm format:check` run oxfmt.
- `typescript` is bumped to 6.0. It's still used by `next build` and editors; type-checking runs on tsrs.
- `tsconfig.json` drops `baseUrl` (removed in TypeScript 7) and lists `types` explicitly. Add any other `@types/*` packages whose globals you rely on to `types`.
- `eslint-disable` comments keep working; oxlint reads them.
