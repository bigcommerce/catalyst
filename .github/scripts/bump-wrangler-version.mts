#!/usr/bin/env node
/* eslint-disable no-console */

import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// `catalyst build` interpolates this pin into `pnpm dlx wrangler@<version>`, so
// it is a plain string literal in the CLI source rather than a manifest entry —
// which is why Dependabot can't see it and this script exists.
const PIN_PATTERN = /(export const WRANGLER_VERSION = ')([^']+)(';)/;

const PACKUMENT_URL = "https://registry.npmjs.org/wrangler";

// The abbreviated packument lists the same versions as the full document in a
// tiny fraction of the bytes; wrangler's full one runs to tens of megabytes.
const PACKUMENT_ACCEPT = "application/vnd.npm.install-v1+json";

export interface Version {
  major: number;
  minor: number;
  patch: number;
}

// Exact stable releases only. A prerelease, or anything that isn't `x.y.z`, is
// not something to point every customer's deploy at unattended.
export function parseVersion(version: string): Version | null {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);

  if (match === null) return null;

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function compareVersions(a: Version, b: Version): number {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch;
}

export interface BumpPlan {
  current: string;
  pinnedMajor: number;
  // Newest release on the pinned major, or null when the pin is already it.
  target: string | null;
  // Newest release on a higher major, if there is one. Reported, never taken: a
  // Wrangler major can change bundling and compatibility behaviour for every
  // native-hosted store, so adopting one is a deliberate call.
  heldBack: string | null;
}

interface Candidate {
  version: string;
  parsed: Version;
}

const newest = (candidates: Candidate[]): Candidate | null =>
  candidates.reduce<Candidate | null>(
    (best, candidate) =>
      best === null || compareVersions(candidate.parsed, best.parsed) > 0
        ? candidate
        : best,
    null,
  );

export function planBump(current: string, published: string[]): BumpPlan {
  const pinned = parseVersion(current);

  if (pinned === null) {
    throw new Error(
      `Pinned Wrangler version "${current}" is not an exact x.y.z release; refusing to guess a bump.`,
    );
  }

  const stable = published
    .map((version) => ({ version, parsed: parseVersion(version) }))
    .filter((candidate): candidate is Candidate => candidate.parsed !== null);

  const onPinnedMajor = newest(
    stable.filter((candidate) => candidate.parsed.major === pinned.major),
  );
  const onHigherMajor = newest(
    stable.filter((candidate) => candidate.parsed.major > pinned.major),
  );

  return {
    current,
    pinnedMajor: pinned.major,
    target:
      onPinnedMajor !== null &&
      compareVersions(onPinnedMajor.parsed, pinned) > 0
        ? onPinnedMajor.version
        : null,
    heldBack: onHigherMajor === null ? null : onHigherMajor.version,
  };
}

export function readPinnedVersion(source: string): string {
  const match = PIN_PATTERN.exec(source);

  if (match === null) {
    throw new Error(
      "Could not find `export const WRANGLER_VERSION = '<version>';` — the pin moved or was renamed.",
    );
  }

  return match[2];
}

export function replacePinnedVersion(source: string, version: string): string {
  if (!PIN_PATTERN.test(source)) {
    throw new Error(
      "Could not find `export const WRANGLER_VERSION = '<version>';` — the pin moved or was renamed.",
    );
  }

  return source.replace(PIN_PATTERN, `$1${version}$3`);
}

export function buildChangeset(
  previous: string,
  version: string,
): { filename: string; contents: string } {
  return {
    // Matches the `[a-zA-Z0-9_-]+.md` shape `prevent-invalid-changesets` requires.
    filename: `bump-wrangler-${version.replaceAll(".", "-")}.md`,
    contents: `---
"@bigcommerce/catalyst": patch
---

Bump the Wrangler version \`catalyst build\` builds with from ${previous} to ${version}. See the [Wrangler ${version} release notes](https://github.com/cloudflare/workers-sdk/releases/tag/wrangler%40${version}) for what changed.
`,
  };
}

const appendToEnvFile = (variable: string, contents: string) => {
  const path = process.env[variable];

  if (path === undefined || path === "") return;

  appendFileSync(path, contents);
};

const setOutput = (key: string, value: string) =>
  appendToEnvFile("GITHUB_OUTPUT", `${key}=${value}\n`);

const addSummary = (markdown: string) =>
  appendToEnvFile("GITHUB_STEP_SUMMARY", `${markdown}\n`);

async function fetchPublishedVersions(): Promise<string[]> {
  const response = await fetch(PACKUMENT_URL, {
    headers: { accept: PACKUMENT_ACCEPT },
  });

  if (!response.ok) {
    throw new Error(
      `The npm registry answered ${response.status} ${response.statusText} for ${PACKUMENT_URL}.`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const packument = (await response.json()) as {
    versions?: Record<string, unknown>;
  };

  return Object.keys(packument.versions ?? {});
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const buildCommandPath = resolve(
  repoRoot,
  "packages/catalyst/src/cli/commands/build.ts",
);

async function main(): Promise<void> {
  const source = readFileSync(buildCommandPath, "utf-8");
  const current = readPinnedVersion(source);
  const plan = planBump(current, await fetchPublishedVersions());

  if (plan.heldBack !== null) {
    const notice =
      `Wrangler ${plan.heldBack} is available, but this job only tracks ${plan.pinnedMajor}.x. ` +
      "Bump `WRANGLER_VERSION` by hand to adopt it.";

    console.warn(notice);
    addSummary(`> [!NOTE]\n> ${notice}`);
  }

  if (plan.target === null) {
    console.log(
      `Wrangler pin is already the newest ${plan.pinnedMajor}.x release (${current}).`,
    );
    setOutput("updated", "false");
    setOutput("version", current);

    return;
  }

  writeFileSync(buildCommandPath, replacePinnedVersion(source, plan.target));

  const changeset = buildChangeset(current, plan.target);
  const changesetPath = resolve(repoRoot, ".changeset", changeset.filename);

  mkdirSync(dirname(changesetPath), { recursive: true });
  writeFileSync(changesetPath, changeset.contents);

  console.log(`Bumped the Wrangler pin ${current} → ${plan.target}.`);
  setOutput("updated", "true");
  setOutput("previous", current);
  setOutput("version", plan.target);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
