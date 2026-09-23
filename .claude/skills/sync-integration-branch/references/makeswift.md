# Reference: `integrations/makeswift`

Load this when the sync target is `integrations/makeswift`. Fill the SKILL.md placeholders with:

- **Upstream (merge from):** `canary`
- **Package identity:** `@bigcommerce/catalyst-makeswift`
- **Sync branch:** `sync-integrations-makeswift`
- **Merge-base pair:** `canary` ↔ `integrations/makeswift`
- **Upstream package (for one-time catch-up tags):** `@bigcommerce/catalyst-core`

## Integration surface (preserve wholesale)

The Makeswift additions layered over `canary`: Makeswift components, builder/runtime registration, and Makeswift config (imports, components, config). Prefer canary's structure everywhere else.

## Branch-specific notes

- This is the **root** integration branch — it syncs directly from `canary`. Sync it before any branch that builds on it (e.g. `integrations/b2b-makeswift`).
- Steady state: this branch tracks `canary` closely, so syncs are usually small and the one-time catch-up flow does not apply.
