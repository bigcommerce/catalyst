#!/usr/bin/env node
/* eslint-disable no-console */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { satisfies } from "semver";

import {
  addSummary,
  compareVersions,
  fetchPackument,
  parseVersion,
  planBump,
  readPin,
  replacePin,
  reportHeldBackMajor,
  setOutput,
} from "./lib/npm-pins.mts";

const ADAPTER = "@opennextjs/cloudflare";

// Commerce Hosting builds rest on two versions that are string literals in the
// CLI source rather than manifest entries, so Dependabot can't see either. They
// are maintained together because the adapter declares which Wrangler it
// supports: bumping one without consulting the other is how they drift apart.
const ADAPTER_PIN = "OPENNEXT_CLOUDFLARE_VERSION";
const NEXT_RANGE_PIN = "OPENNEXT_REQUIRED_NEXT_RANGE";
const WRANGLER_PIN = "WRANGLER_VERSION";

export type NextRequirement =
  | { status: "unchanged" }
  | { status: "moved"; from: string; to: string }
  | { status: "absent" };

// The adapter's Next requirement is the part of a bump that needs judgment:
// deciding whether core can satisfy a *new* range means weighing it against
// core's own `next`, and shipping a pin core can't meet is worse than not
// bumping — `reconcileOpenNextVersion` refuses to apply it and tells the
// merchant to upgrade core first. So a moved requirement holds the bump for a
// human. An unchanged one carries the existing, known-good answer forward.
export function classifyNextRequirement(
  pinnedRange: string,
  declaredRange: string | undefined,
): NextRequirement {
  if (declaredRange === undefined) return { status: "absent" };

  return declaredRange === pinnedRange
    ? { status: "unchanged" }
    : { status: "moved", from: pinnedRange, to: declaredRange };
}

export type WranglerSelection =
  | { status: "ok"; version: string }
  | { status: "unsatisfiable" }
  | { status: "ahead-of-adapter"; newest: string };

// Wrangler is chosen as the newest release the adapter still supports, rather
// than the newest that exists: `catalyst build` runs it against that adapter, so
// the adapter's peer range is the authority on what is safe. Staying on the
// pinned major is unchanged policy — a Wrangler major can change bundling for
// every native-hosted store.
export function selectWranglerVersion(
  pinned: string,
  published: string[],
  range: string,
): WranglerSelection {
  const pinnedVersion = parseVersion(pinned);

  if (pinnedVersion === null) {
    throw new Error(
      `Pinned Wrangler version "${pinned}" is not an exact x.y.z release; refusing to guess a bump.`,
    );
  }

  const supported = published
    .map((version) => ({ version, parsed: parseVersion(version) }))
    .filter(
      (
        candidate,
      ): candidate is {
        version: string;
        parsed: ReturnType<typeof parseVersion> & object;
      } =>
        candidate.parsed !== null &&
        candidate.parsed.major === pinnedVersion.major &&
        satisfies(candidate.version, range),
    );

  if (supported.length === 0) return { status: "unsatisfiable" };

  const newest = supported.reduce((best, candidate) =>
    compareVersions(candidate.parsed, best.parsed) > 0 ? candidate : best,
  );

  // The adapter's range has a ceiling below the current pin. Silently walking
  // the pin backwards would be a downgrade nobody asked for.
  return compareVersions(newest.parsed, pinnedVersion) < 0
    ? { status: "ahead-of-adapter", newest: newest.version }
    : { status: "ok", version: newest.version };
}

// The pin only reaches an installed tree through this devDependency, and the
// contract test in `cloudflare-context-symbol.spec.ts` is only meaningful while
// the installed adapter and the pin agree. It is deliberately exact rather than
// a range: a caret would let a new 1.x release move the installed version on its
// own and fail CI before anyone had chosen to adopt it.
//
// The manifest declares the same package as an optional peer too, with a
// deliberately tolerant range, so this anchors on a version starting with a
// digit — leaving both the caret range and the `peerDependenciesMeta` object
// (which holds an object, not a string) untouched. Rewritten as text so the
// manifest's formatting and key order survive.
const DEV_PIN_PATTERN = /("@opennextjs\/cloudflare":\s*")\d[^"]*(")/;

export function replaceAdapterDevPin(source: string, version: string): string {
  if (!DEV_PIN_PATTERN.test(source)) {
    throw new Error(
      `Could not find an exact ${ADAPTER} devDependency in packages/catalyst/package.json.`,
    );
  }

  return source.replace(DEV_PIN_PATTERN, `$1${version}$2`);
}

export interface Moves {
  adapter?: { from: string; to: string };
  wrangler?: { from: string; to: string };
}

export function buildChangeset(moves: Moves): {
  filename: string;
  contents: string;
} {
  const slug = [
    moves.adapter === undefined ? null : `opennext-${moves.adapter.to}`,
    moves.wrangler === undefined ? null : `wrangler-${moves.wrangler.to}`,
  ]
    .filter((part): part is string => part !== null)
    .join("-")
    .replaceAll(".", "-");

  const lines = [
    moves.adapter === undefined
      ? null
      : `Bump the \`@opennextjs/cloudflare\` version new Commerce Hosting projects are pinned to from ${moves.adapter.from} to ${moves.adapter.to}.`,
    moves.wrangler === undefined
      ? null
      : `Bump the Wrangler version \`catalyst build\` builds with from ${moves.wrangler.from} to ${moves.wrangler.to}, the newest release the pinned adapter supports.`,
  ].filter((line): line is string => line !== null);

  return {
    // Matches the `[a-zA-Z0-9_-]+.md` shape `prevent-invalid-changesets` requires.
    filename: `bump-${slug}.md`,
    contents: `---
"@bigcommerce/catalyst": patch
---

${lines.join(" ")}
`,
  };
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const commerceHostingPath = resolve(
  repoRoot,
  "packages/catalyst/src/cli/lib/commerce-hosting.ts",
);
const buildCommandPath = resolve(
  repoRoot,
  "packages/catalyst/src/cli/commands/build.ts",
);
const catalystManifestPath = resolve(
  repoRoot,
  "packages/catalyst/package.json",
);

const hold = (notice: string, level: "WARNING" | "NOTE" = "WARNING") => {
  console.warn(notice);
  addSummary(`> [!${level}]\n> ${notice}`);
  setOutput("updated", "false");
};

async function main(): Promise<void> {
  const hostingSource = readFileSync(commerceHostingPath, "utf-8");
  const buildSource = readFileSync(buildCommandPath, "utf-8");

  const adapterPin = readPin(hostingSource, ADAPTER_PIN);
  const nextRangePin = readPin(hostingSource, NEXT_RANGE_PIN);
  const wranglerPin = readPin(buildSource, WRANGLER_PIN);

  const adapterVersions = await fetchPackument(ADAPTER);
  const adapterPlan = planBump(
    adapterPin,
    Object.keys(adapterVersions.versions),
  );

  reportHeldBackMajor(adapterPlan, ADAPTER);

  // Whether or not the adapter moves, it is the authority on which Wrangler is
  // safe, so the Wrangler pin is always reconciled against whichever adapter
  // this run lands on.
  const adapterTarget = adapterPlan.target ?? adapterPin;
  const adapterPeers =
    adapterVersions.versions[adapterTarget]?.peerDependencies;

  if (adapterPlan.target !== null) {
    const requirement = classifyNextRequirement(
      nextRangePin,
      adapterPeers?.next,
    );

    if (requirement.status === "absent") {
      hold(
        `${ADAPTER} ${adapterTarget} declares no \`next\` peer dependency, which the adapter has ` +
          `always had. Holding both pins until someone confirms that is intentional.`,
      );

      return;
    }

    if (requirement.status === "moved") {
      hold(
        `${ADAPTER} ${adapterTarget} moved its Next.js requirement from \`${requirement.from}\` to ` +
          `\`${requirement.to}\`. Holding both pins: check core's \`next\` satisfies the new range, ` +
          `then update ${ADAPTER_PIN} and ${NEXT_RANGE_PIN} together by hand.`,
      );

      return;
    }
  }

  const wranglerRange = adapterPeers?.wrangler;

  if (wranglerRange === undefined) {
    hold(
      `${ADAPTER} ${adapterTarget} declares no \`wrangler\` peer dependency, so there is nothing ` +
        `to pin ${WRANGLER_PIN} against. Holding both pins.`,
    );

    return;
  }

  const wranglerVersions = await fetchPackument("wrangler");
  const selection = selectWranglerVersion(
    wranglerPin,
    Object.keys(wranglerVersions.versions),
    wranglerRange,
  );

  if (selection.status === "unsatisfiable") {
    hold(
      `${ADAPTER} ${adapterTarget} requires Wrangler \`${wranglerRange}\`, which no release on the ` +
        `pinned ${parseVersion(wranglerPin)?.major}.x line satisfies. Holding both pins: adopting it ` +
        `means moving ${WRANGLER_PIN} to a new major by hand.`,
    );

    return;
  }

  if (selection.status === "ahead-of-adapter") {
    hold(
      `${WRANGLER_PIN} is ${wranglerPin}, but ${ADAPTER} ${adapterTarget} only supports ` +
        `\`${wranglerRange}\` — newest allowed is ${selection.newest}. Holding both pins rather ` +
        `than walking Wrangler backwards.`,
    );

    return;
  }

  const moves: Moves = {
    ...(adapterPlan.target === null
      ? {}
      : { adapter: { from: adapterPin, to: adapterPlan.target } }),
    ...(selection.version === wranglerPin
      ? {}
      : { wrangler: { from: wranglerPin, to: selection.version } }),
  };

  if (moves.adapter === undefined && moves.wrangler === undefined) {
    console.log(
      `Both pins are current: ${ADAPTER} ${adapterPin}, Wrangler ${wranglerPin} ` +
        `(newest satisfying \`${wranglerRange}\`).`,
    );
    setOutput("updated", "false");

    return;
  }

  if (moves.adapter !== undefined) {
    writeFileSync(
      commerceHostingPath,
      replacePin(hostingSource, ADAPTER_PIN, moves.adapter.to),
    );
    writeFileSync(
      catalystManifestPath,
      replaceAdapterDevPin(
        readFileSync(catalystManifestPath, "utf-8"),
        moves.adapter.to,
      ),
    );
    console.log(
      `Bumped ${ADAPTER} ${moves.adapter.from} → ${moves.adapter.to}.`,
    );
  }

  if (moves.wrangler !== undefined) {
    writeFileSync(
      buildCommandPath,
      replacePin(buildSource, WRANGLER_PIN, moves.wrangler.to),
    );
    console.log(
      `Bumped Wrangler ${moves.wrangler.from} → ${moves.wrangler.to} (adapter allows \`${wranglerRange}\`).`,
    );
  }

  const changeset = buildChangeset(moves);
  const changesetPath = resolve(repoRoot, ".changeset", changeset.filename);

  mkdirSync(dirname(changesetPath), { recursive: true });
  writeFileSync(changesetPath, changeset.contents);

  setOutput("updated", "true");
  setOutput("adapter-version", moves.adapter?.to ?? adapterPin);
  setOutput("wrangler-version", moves.wrangler?.to ?? wranglerPin);
  setOutput(
    "title",
    moves.adapter === undefined
      ? `chore(cli): bump Wrangler to ${moves.wrangler?.to}`
      : `chore(cli): bump @opennextjs/cloudflare to ${moves.adapter.to}`,
  );
  setOutput("summary", changeset.contents.split("---\n")[2].trim());
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
