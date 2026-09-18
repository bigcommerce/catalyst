import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  compareVersions,
  parseVersion,
  planBump,
  readPin,
  replacePin,
} from "../lib/npm-pins.mts";

const parse = (version: string) => {
  const parsed = parseVersion(version);

  assert.notEqual(parsed, null, version);

  return parsed!;
};

const pinSource = (name: string, value: string) =>
  `import { Command } from 'commander';\n\nexport const ${name} = '${value}';\n\nexport const other = 1;\n`;

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

describe("readPin", () => {
  it("reads the named pin", () => {
    assert.equal(
      readPin(pinSource("WRANGLER_VERSION", "4.128.0"), "WRANGLER_VERSION"),
      "4.128.0",
    );
  });

  it("reads a pin whose value is a range rather than a version", () => {
    assert.equal(
      readPin(
        pinSource("OPENNEXT_REQUIRED_NEXT_RANGE", ">=15.5.24 <16 || >=16.3.3"),
        "OPENNEXT_REQUIRED_NEXT_RANGE",
      ),
      ">=15.5.24 <16 || >=16.3.3",
    );
  });

  it("does not confuse one pin for another in the same file", () => {
    const source =
      pinSource("OPENNEXT_CLOUDFLARE_VERSION", "1.20.6") +
      pinSource("OPENNEXT_REQUIRED_NEXT_RANGE", ">=16.3.3");

    assert.equal(readPin(source, "OPENNEXT_CLOUDFLARE_VERSION"), "1.20.6");
    assert.equal(readPin(source, "OPENNEXT_REQUIRED_NEXT_RANGE"), ">=16.3.3");
  });

  it("throws when the pin is missing", () => {
    assert.throws(
      () => readPin("export const OTHER = '1.0.0';\n", "WRANGLER_VERSION"),
      /the pin moved or was renamed/,
    );
  });
});

describe("replacePin", () => {
  it("rewrites only the named pin", () => {
    assert.equal(
      replacePin(
        pinSource("WRANGLER_VERSION", "4.128.0"),
        "WRANGLER_VERSION",
        "4.134.0",
      ),
      pinSource("WRANGLER_VERSION", "4.134.0"),
    );
  });

  it("leaves a neighbouring pin untouched", () => {
    const before =
      pinSource("OPENNEXT_CLOUDFLARE_VERSION", "1.20.6") +
      pinSource("OPENNEXT_REQUIRED_NEXT_RANGE", ">=16.3.3");
    const after = replacePin(before, "OPENNEXT_CLOUDFLARE_VERSION", "1.21.0");

    assert.equal(readPin(after, "OPENNEXT_CLOUDFLARE_VERSION"), "1.21.0");
    assert.equal(readPin(after, "OPENNEXT_REQUIRED_NEXT_RANGE"), ">=16.3.3");
  });

  it("throws when the pin is missing", () => {
    assert.throws(
      () =>
        replacePin(
          "export const OTHER = '1.0.0';\n",
          "WRANGLER_VERSION",
          "4.134.0",
        ),
      /the pin moved or was renamed/,
    );
  });
});
