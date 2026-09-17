import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildChangeset,
  compareVersions,
  parseVersion,
  planBump,
  readPinnedVersion,
  replacePinnedVersion,
} from "../bump-wrangler-version.mts";

const pinSource = (version: string) =>
  `import { Command } from 'commander';\n\nexport const WRANGLER_VERSION = '${version}';\n\nexport const other = 1;\n`;

describe("parseVersion", () => {
  it("parses an exact release", () => {
    assert.deepEqual(parseVersion("4.128.0"), {
      major: 4,
      minor: 128,
      patch: 0,
    });
  });

  it("rejects prereleases, ranges, and dist-tags", () => {
    ["4.128.0-beta.1", "^4.128.0", "4.128", "latest", ""].forEach((value) => {
      assert.equal(parseVersion(value), null, value);
    });
  });
});

describe("compareVersions", () => {
  it("orders by major, then minor, then patch", () => {
    const parse = (version: string) => {
      const parsed = parseVersion(version);

      assert.notEqual(parsed, null);

      return parsed!;
    };

    assert.ok(compareVersions(parse("5.0.0"), parse("4.200.0")) > 0);
    assert.ok(compareVersions(parse("4.9.0"), parse("4.10.0")) < 0);
    assert.ok(compareVersions(parse("4.10.2"), parse("4.10.10")) < 0);
    assert.equal(compareVersions(parse("4.10.2"), parse("4.10.2")), 0);
  });
});

describe("planBump", () => {
  it("targets the newest release on the pinned major", () => {
    const plan = planBump("4.128.0", [
      "4.127.0",
      "4.128.0",
      "4.134.0",
      "4.9.0",
    ]);

    assert.equal(plan.target, "4.134.0");
    assert.equal(plan.pinnedMajor, 4);
    assert.equal(plan.heldBack, null);
  });

  it("compares numerically rather than lexically", () => {
    assert.equal(planBump("4.9.0", ["4.9.0", "4.10.0"]).target, "4.10.0");
  });

  it("has nothing to do when the pin is already the newest", () => {
    assert.equal(planBump("4.134.0", ["4.128.0", "4.134.0"]).target, null);
  });

  it("never downgrades a pin that is ahead of the registry", () => {
    assert.equal(planBump("4.134.0", ["4.128.0"]).target, null);
  });

  it("ignores prereleases", () => {
    assert.equal(
      planBump("4.128.0", ["4.128.0", "4.135.0-beta.1"]).target,
      null,
    );
  });

  it("reports a newer major without targeting it", () => {
    const plan = planBump("4.128.0", ["4.128.0", "4.134.0", "5.1.0", "5.0.0"]);

    assert.equal(plan.target, "4.134.0");
    assert.equal(plan.heldBack, "5.1.0");
  });

  it("reports a newer major even when the pinned major is current", () => {
    const plan = planBump("4.134.0", ["4.134.0", "5.0.0"]);

    assert.equal(plan.target, null);
    assert.equal(plan.heldBack, "5.0.0");
  });

  it("throws rather than guess when the pin is not an exact release", () => {
    assert.throws(() => planBump("latest", ["4.134.0"]), /not an exact/);
  });
});

describe("readPinnedVersion", () => {
  it("reads the pinned version", () => {
    assert.equal(readPinnedVersion(pinSource("4.128.0")), "4.128.0");
  });

  it("throws when the pin is missing", () => {
    assert.throws(
      () => readPinnedVersion("export const OTHER = '1.0.0';\n"),
      /the pin moved or was renamed/,
    );
  });
});

describe("replacePinnedVersion", () => {
  it("rewrites only the pin", () => {
    assert.equal(
      replacePinnedVersion(pinSource("4.128.0"), "4.134.0"),
      pinSource("4.134.0"),
    );
  });

  it("throws when the pin is missing", () => {
    assert.throws(
      () => replacePinnedVersion("export const OTHER = '1.0.0';\n", "4.134.0"),
      /the pin moved or was renamed/,
    );
  });
});

describe("buildChangeset", () => {
  const changeset = buildChangeset("4.128.0", "4.134.0");

  it("names the file in the shape prevent-invalid-changesets allows", () => {
    assert.match(changeset.filename, /^[a-zA-Z0-9_-]+\.md$/);
    assert.equal(changeset.filename, "bump-wrangler-4-134-0.md");
  });

  it("patches the CLI package and names both versions", () => {
    assert.match(
      changeset.contents,
      /^---\n"@bigcommerce\/catalyst": patch\n---\n/,
    );
    assert.match(changeset.contents, /from 4\.128\.0 to 4\.134\.0/);
    assert.match(changeset.contents, /releases\/tag\/wrangler%404\.134\.0/);
  });
});

describe("the pin it maintains", () => {
  it("is still readable in build.ts", () => {
    const source = readFileSync(
      resolve(
        dirname(fileURLToPath(import.meta.url)),
        "../../../packages/catalyst/src/cli/commands/build.ts",
      ),
      "utf-8",
    );

    assert.notEqual(parseVersion(readPinnedVersion(source)), null);
  });
});
