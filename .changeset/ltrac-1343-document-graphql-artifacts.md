---
'@bigcommerce/catalyst-core': patch
---

Document the two generated GraphQL files that show up untracked in a fresh project, and settle whether to commit them.

`pnpm run generate` writes `bigcommerce.graphql` and `bigcommerce-graphql.d.ts` to the project root. `catalyst create` makes its initial commit before anything runs `generate`, so both files appear as untracked the first time you run `pnpm run dev` — with nothing in the project saying what they are, whether they matter at runtime, or which of "commit" and "gitignore" was intended.

## What changed

- `README.md` gains a **GraphQL Schema and Types** section: what each file is, that neither is read at request time, `pnpm run generate` as the command that produces them, and an explicit instruction to commit both. It also covers regeneration — `dev`, `build`, and `deploy` each run `generate` first, deployments always use the schema live on the channel rather than the committed copy, and a lint/typecheck-only CI job needs no store credentials precisely because the files are committed.
- `core/.gitignore` gains a comment recording that the two files are left out on purpose, so the next person to read it doesn't "fix" the omission.
- Monorepo-side, `CONTRIBUTING.md` explains why the root `.gitignore` does the opposite for contributors — they work against unreleased schemas on their own test stores, and CI regenerates before it lints and typechecks.
