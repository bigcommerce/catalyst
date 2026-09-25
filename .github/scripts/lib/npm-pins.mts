/* eslint-disable no-console */

import { appendFileSync } from "node:fs";

// Version pins that live as string literals in source rather than as manifest
// entries are invisible to Dependabot. These helpers are the shared machinery
// for the jobs that keep them moving.

export interface Version {
  major: number;
  minor: number;
  patch: number;
}

// Exact stable releases only. A prerelease, or anything that isn't `x.y.z`, is
// not something to point a pin at unattended.
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
  // Newest release on a higher major, if there is one. Reported, never taken:
  // a major can change behaviour for every native-hosted store, so adopting
  // one is a deliberate call.
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
      `Pinned version "${current}" is not an exact x.y.z release; refusing to guess a bump.`,
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

const missingPin = (name: string) =>
  `Could not find \`export const ${name} = '<value>';\` — the pin moved or was renamed.`;

// Every pin these jobs maintain is a single-quoted string literal on an
// `export const NAME = '...';` line. `name` is always a hardcoded identifier.
const pinPattern = (name: string): RegExp =>
  new RegExp(`(export const ${name} = ')([^']+)(';)`);

export function readPin(source: string, name: string): string {
  const match = pinPattern(name).exec(source);

  if (match === null) throw new Error(missingPin(name));

  return match[2];
}

export function replacePin(
  source: string,
  name: string,
  value: string,
): string {
  const pattern = pinPattern(name);

  if (!pattern.test(source)) throw new Error(missingPin(name));

  return source.replace(pattern, `$1${value}$3`);
}

export interface PackumentVersion {
  peerDependencies?: Record<string, string>;
}

export interface Packument {
  versions: Record<string, PackumentVersion>;
}

// The abbreviated packument carries the version list and each version's
// `peerDependencies` in a tiny fraction of the bytes; wrangler's full document
// alone runs to tens of megabytes.
const PACKUMENT_ACCEPT = "application/vnd.npm.install-v1+json";

export async function fetchPackument(name: string): Promise<Packument> {
  const url = `https://registry.npmjs.org/${name}`;
  const response = await fetch(url, { headers: { accept: PACKUMENT_ACCEPT } });

  if (!response.ok) {
    throw new Error(
      `The npm registry answered ${response.status} ${response.statusText} for ${url}.`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const packument = (await response.json()) as Partial<Packument>;

  return { versions: packument.versions ?? {} };
}

const appendToEnvFile = (variable: string, contents: string) => {
  const path = process.env[variable];

  if (path === undefined || path === "") return;

  appendFileSync(path, contents);
};

export const setOutput = (key: string, value: string) =>
  // A newline would break the `key=value` file format and could let a value
  // forge another output. Every value here is single-line by construction, so
  // collapse defensively rather than reach for the heredoc form.
  appendToEnvFile(
    "GITHUB_OUTPUT",
    `${key}=${value.replace(/\s*\n\s*/g, " ")}\n`,
  );

export const addSummary = (markdown: string) =>
  appendToEnvFile("GITHUB_STEP_SUMMARY", `${markdown}\n`);

// A newer major is surfaced rather than taken. Called by every pin job so the
// wording is identical across them.
export const reportHeldBackMajor = (plan: BumpPlan, pinName: string) => {
  if (plan.heldBack === null) return;

  const notice =
    `${pinName} ${plan.heldBack} is available, but this job only tracks ${plan.pinnedMajor}.x. ` +
    "Bump the pin by hand to adopt it.";

  console.warn(notice);
  addSummary(`> [!NOTE]\n> ${notice}`);
};
