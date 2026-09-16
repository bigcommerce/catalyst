---
"@bigcommerce/catalyst": patch
---

Stop `catalyst upgrade` from reverting the CLI-managed npm scripts, which turned `catalyst start` back into `next start`.

`catalyst create` points `build`, `start` and `deploy` at the CLI so they dispatch on project state (`catalyst start` falls through to `next start` for a project that isn't set up for Commerce Hosting, so the scripts are correct for self-hosted projects too). The upstream tree keeps its own `next`-based commands, so in every created project those lines are a permanent ours-vs-base difference — and `upgrade` had no handling for them, unlike the `@bigcommerce/catalyst` devDependency, which is safe only because it has no upstream counterpart.

That difference is harmless until core edits a neighbouring line. Core 1.11.0 added `"test": "vitest run"` directly below `"start"`, which put a genuine upstream insertion right next to the one line the CLI had rewritten. Neither merge engine can reconcile the two, so `package.json` came out conflicted with `catalyst start` on one side and `next start` plus the new `test` script on the other. Resolving toward the incoming side — the obvious choice, since you do want the new script — silently dropped `catalyst start`. `build` was exposed the same way, and `deploy` was exposed to any upstream script appended at the end of the block.

Both downloaded sides are now pinned to the commands the project already has for those three keys before the merge runs, so the merge sees no change there at all: the project's scripts survive untouched and additions around them still apply cleanly. Only keys the project has actually diverged from its base on are pinned — where it matches base there is no difference to conflict with, and leaving it alone lets a genuine upstream edit through. Whenever the two versions disagree about one of these scripts — core changed the command, introduced it, or dropped it — the upgrade reports it rather than hiding it behind the pin.
