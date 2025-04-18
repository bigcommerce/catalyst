---
"@bigcommerce/catalyst-core": minor
---

Rename `/vibes/soul/` to `/ui/`, replacing all imports and configuration rules to match new pathname.

## Migration instructions

### Rebase conflicts

- Custom components in `/vibes/soul/*` need to be moved to `/ui/`.
- Change import name from `@/vibes/soul/` to `@/ui/`.
- If import order errors occur, run `pnpm run lint -- --fix` to fix import order or fix manually.

### Manual migration

- Replace `/vibes/soul/` for `/ui/`.
- Rename all imports from `@/vibes/soul/` to `@/ui/`.
- Update `tsconfig.json` to point to the `@/ui` path.
- Update `next.config.ts` to replaces `vibes` with `ui` in the included eslint dirs.
- Update `global.css` to replace `./vibes` with `./ui`.
- Run `pnpm run lint -- --fix` to auto fix import order.
