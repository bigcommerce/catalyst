# @bigcommerce/catalyst

CLI tool for Catalyst development and deployment.

## Developing the CLI

You'll need two terminal windows:

### Terminal 1 — Watch mode (rebuilds on changes)

```bash
cd packages/catalyst
pnpm dev
```

This runs `tsup --watch` and rebuilds `dist/cli.js` on every source change.

### Terminal 2 — Run the CLI

From the `core/` directory, run the CLI using the absolute path to the built executable:

```bash
cd core
pnpm exec <repo-root>/packages/catalyst/dist/cli.js <command>
```

For example:

```bash
pnpm exec <repo-root>/packages/catalyst/dist/cli.js project list
pnpm exec <repo-root>/packages/catalyst/dist/cli.js logs tail
pnpm exec <repo-root>/packages/catalyst/dist/cli.js logs query --start 2026-06-01T00:00:00Z --end 2026-06-02T00:00:00Z
pnpm exec <repo-root>/packages/catalyst/dist/cli.js deploy
```

Replace `<repo-root>` with the absolute path to your local clone of the `catalyst` repository.
