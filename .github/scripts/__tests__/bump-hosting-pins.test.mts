import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { parseVersion, readPin } from "../lib/npm-pins.mts";
import {
  buildChangeset,
  classifyNextRequirement,
  replacePeerRange,
  selectWranglerVersion,
} from "../bump-hosting-pins.mts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (relative: string) =>
  readFileSync(resolve(repoRoot, relative), "utf-8");

describe("classifyNextRequirement", () => {
  const pinned = ">=15.5.24 <16 || >=16.3.3";

  it("clears a bump that carries the same requirement forward", () => {
    assert.deepEqual(classifyNextRequirement(pinned, pinned), {
      status: "unchanged",
    });
  });

  it("holds a bump that moved the requirement", () => {
    assert.deepEqual(classifyNextRequirement(pinned, ">=17.0.0"), {
      status: "moved",
      from: pinned,
      to: ">=17.0.0",
    });
  });

  it("treats even a cosmetic difference as moved, rather than guessing", () => {
    // Deciding that a reworded range is equivalent needs judgment about core's
    // own `next`, so a human confirms it instead.
    assert.equal(
      classifyNextRequirement(pinned, ">=15.5.24 <16.0.0 || >=16.3.3").status,
      "moved",
    );
  });

  it("holds a bump that dropped the requirement altogether", () => {
    assert.deepEqual(classifyNextRequirement(pinned, undefined), {
      status: "absent",
    });
  });
});

describe("selectWranglerVersion", () => {
  const published = [
    "3.114.17",
    "4.120.0",
    "4.125.0",
    "4.128.0",
    "4.134.0",
    "4.135.0-beta.1",
    "5.0.0",
  ];

  it("takes the newest release the adapter supports, not the newest that exists", () => {
    assert.deepEqual(
      selectWranglerVersion("4.128.0", published, ">=4.125.0 <4.130.0"),
      { status: "ok", version: "4.128.0" },
    );
  });

  it("moves up to the newest release when the adapter allows the whole major", () => {
    assert.deepEqual(selectWranglerVersion("4.128.0", published, "^4.125.0"), {
      status: "ok",
      version: "4.134.0",
    });
  });

  it("stays on the pinned major even when a newer one satisfies the range", () => {
    assert.deepEqual(selectWranglerVersion("4.128.0", published, ">=4.125.0"), {
      status: "ok",
      version: "4.134.0",
    });
  });

  it("ignores prereleases even when one is the newest thing published", () => {
    assert.deepEqual(
      selectWranglerVersion(
        "4.128.0",
        ["4.128.0", "4.135.0-beta.1"],
        "^4.125.0",
      ),
      { status: "ok", version: "4.128.0" },
    );
  });

  it("reports when the adapter needs a Wrangler major this job doesn't track", () => {
    assert.deepEqual(selectWranglerVersion("4.128.0", published, "^5.0.0"), {
      status: "unsatisfiable",
    });
  });

  it("refuses to walk the pin backwards under a new ceiling", () => {
    assert.deepEqual(
      selectWranglerVersion("4.134.0", published, ">=4.120.0 <4.130.0"),
      { status: "ahead-of-adapter", newest: "4.128.0" },
    );
  });

  it("is a no-op when the pin is already the newest supported release", () => {
    assert.deepEqual(selectWranglerVersion("4.134.0", published, "^4.125.0"), {
      status: "ok",
      version: "4.134.0",
    });
  });

  it("throws rather than guess when the pin is not an exact release", () => {
    assert.throws(
      () => selectWranglerVersion("latest", published, "^4.125.0"),
      /not an exact/,
    );
  });
});

describe("replacePeerRange", () => {
  it("rewrites the caret range", () => {
    const manifest = JSON.stringify(
      { peerDependencies: { "@opennextjs/cloudflare": "^1.17.3" } },
      null,
      2,
    );

    assert.match(
      replacePeerRange(manifest, "1.21.0"),
      /"@opennextjs\/cloudflare": "\^1\.21\.0"/,
    );
  });

  it("leaves the peerDependenciesMeta entry for the same package alone", () => {
    const manifest = JSON.stringify(
      {
        peerDependencies: { "@opennextjs/cloudflare": "^1.17.3" },
        peerDependenciesMeta: { "@opennextjs/cloudflare": { optional: true } },
      },
      null,
      2,
    );
    const updated = JSON.parse(replacePeerRange(manifest, "1.21.0"));

    assert.equal(updated.peerDependencies["@opennextjs/cloudflare"], "^1.21.0");
    assert.deepEqual(updated.peerDependenciesMeta["@opennextjs/cloudflare"], {
      optional: true,
    });
  });

  it("throws when there is no range to rewrite", () => {
    assert.throws(
      () => replacePeerRange('{ "peerDependencies": {} }', "1.21.0"),
      /Could not find a caret range/,
    );
  });
});

describe("buildChangeset", () => {
  it("covers both pins when both moved", () => {
    const changeset = buildChangeset({
      adapter: { from: "1.20.6", to: "1.21.0" },
      wrangler: { from: "4.128.0", to: "4.134.0" },
    });

    assert.equal(
      changeset.filename,
      "bump-opennext-1-21-0-wrangler-4-134-0.md",
    );
    assert.match(changeset.contents, /from 1\.20\.6 to 1\.21\.0/);
    assert.match(changeset.contents, /from 4\.128\.0 to 4\.134\.0/);
  });

  it("mentions only the pin that moved", () => {
    const changeset = buildChangeset({
      wrangler: { from: "4.128.0", to: "4.134.0" },
    });

    assert.equal(changeset.filename, "bump-wrangler-4-134-0.md");
    assert.doesNotMatch(changeset.contents, /opennextjs/);
  });

  it("names the file in the shape prevent-invalid-changesets allows", () => {
    const both = buildChangeset({
      adapter: { from: "1.20.6", to: "1.21.0" },
      wrangler: { from: "4.128.0", to: "4.134.0" },
    });

    assert.match(both.filename, /^[a-zA-Z0-9_-]+\.md$/);
    assert.match(both.contents, /^---\n"@bigcommerce\/catalyst": patch\n---\n/);
  });
});

describe("the pins it maintains", () => {
  const hosting = read("packages/catalyst/src/cli/lib/commerce-hosting.ts");
  const build = read("packages/catalyst/src/cli/commands/build.ts");

  it("are all still readable in the CLI source", () => {
    assert.notEqual(
      parseVersion(readPin(hosting, "OPENNEXT_CLOUDFLARE_VERSION")),
      null,
    );
    assert.ok(readPin(hosting, "OPENNEXT_REQUIRED_NEXT_RANGE").length > 0);
    assert.notEqual(parseVersion(readPin(build, "WRANGLER_VERSION")), null);
  });

  it("agree with the peer range the manifest declares", () => {
    // The adapter pin is installed through this range, so a range that admits
    // older releases would let the contract spec verify one the CLI never
    // targets.
    const manifest = read("packages/catalyst/package.json");

    assert.equal(
      replacePeerRange(
        manifest,
        readPin(hosting, "OPENNEXT_CLOUDFLARE_VERSION"),
      ),
      manifest,
    );
  });
});
