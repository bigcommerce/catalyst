#!/usr/bin/env node
/* eslint-disable no-console */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface CorePackageJson {
  name: string;
  version: string;
  catalyst?: { version: string; ref: string };
  [key: string]: unknown;
}

// `catalyst.version` mirrors the released version; `catalyst.ref` is the git tag
// (`@bigcommerce/catalyst-core@<version>`) the version corresponds to, consumed
// by the future `catalyst upgrade` command.
export function buildCatalystField(
  pkg: Pick<CorePackageJson, "name" | "version">,
): { version: string; ref: string } {
  return { version: pkg.version, ref: `${pkg.name}@${pkg.version}` };
}

// Returns the package.json text with its `catalyst` field synced to `version`.
// Re-serializes with the canonical 2-space + trailing-newline format, so a run
// where nothing changed produces no diff.
export function syncCatalystField(packageJsonText: string): string {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const pkg = JSON.parse(packageJsonText) as CorePackageJson;

  pkg.catalyst = buildCatalystField(pkg);

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function main(): void {
  const corePackageJsonPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../core/package.json",
  );

  const updated = syncCatalystField(readFileSync(corePackageJsonPath, "utf-8"));

  writeFileSync(corePackageJsonPath, updated);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const { catalyst } = JSON.parse(updated) as CorePackageJson;

  console.log(
    `Synced core/package.json catalyst field → ${catalyst?.version} (${catalyst?.ref})`,
  );
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  main();
}
