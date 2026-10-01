#!/usr/bin/env node
/* eslint-disable no-console, no-restricted-syntax, no-plusplus, no-continue */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { resolve } from "node:path";

interface CiRoute {
  path: string;
  categories: Record<string, { score: number | null } | undefined>;
}

interface CiResult {
  summary: {
    score: number;
    categories: Record<string, { score: number }>;
    metrics: Record<string, { displayValue: string }>;
  };
  routes?: CiRoute[];
}

function loadCiResult(filePath: string): CiResult {
  if (!existsSync(filePath)) {
    console.error(`Error: file not found: ${filePath}`);
    process.exit(1);
  }

  return JSON.parse(readFileSync(filePath, "utf-8")) as CiResult;
}

function score(value: number): string {
  return String(Math.round(value * 100));
}

function row(
  label: string,
  prodDesktop: string,
  prodMobile: string,
  prevDesktop: string,
  prevMobile: string,
): string {
  return `| ${label} | ${prodDesktop} | ${prodMobile} | ${prevDesktop} | ${prevMobile} |`;
}

const CATEGORY_ORDER = ["performance", "accessibility", "best-practices", "seo"];

const CATEGORY_LABELS: Record<string, string> = {
  performance: "Performance",
  accessibility: "Accessibility",
  "best-practices": "Best Practices",
  seo: "SEO",
};

const METRIC_ORDER = [
  "largest-contentful-paint",
  "cumulative-layout-shift",
  "first-contentful-paint",
  "total-blocking-time",
  "max-potential-fid",
  "interactive",
];

const METRIC_LABELS: Record<string, string> = {
  "largest-contentful-paint": "LCP",
  "cumulative-layout-shift": "CLS",
  "first-contentful-paint": "FCP",
  "total-blocking-time": "TBT",
  "max-potential-fid": "Max Potential FID",
  interactive: "Time to Interactive",
};

const COL_HEADER =
  "| | Prod Desktop | Prod Mobile | Preview Desktop | Preview Mobile |";
const COL_SEP =
  "|:-|:------------|:------------|:----------------|:---------------|";

// Accessibility audits are DOM-based and score identically on matched routes
// run to run, so any drop is treated as a real regression.
const GATED_CATEGORIES = ["accessibility"];

// SEO and best practices have flaky audits (e.g. meta-description timing), so
// drops only warn.
const WARNED_CATEGORIES = ["seo", "best-practices"];

interface RouteDrop {
  device: string;
  category: string;
  path: string;
  production: number;
  preview: number;
}

interface CompareOptions {
  // Minimum drop, in points, in the overall performance score to warn about.
  performanceThreshold?: number;
  // Routes both sides were asked to scan. Defaults to every route either side
  // reported.
  expectedRoutes?: string[];
  provider?: string;
}

function validateScan(
  result: CiResult,
  label: string,
  minRoutes: number,
): string[] {
  const routes = result.routes ?? [];
  const problems: string[] = [];

  if (routes.length < minRoutes) {
    problems.push(
      `${label}: scanned ${routes.length} route(s), expected at least ${minRoutes}`,
    );
  }

  for (const route of routes) {
    const missing = CATEGORY_ORDER.filter(
      (id) => typeof route.categories[id]?.score !== "number",
    );

    if (missing.length) {
      problems.push(
        `${label}: \`${route.path}\` has no ${missing.join(", ")} score`,
      );
    }
  }

  return problems;
}

interface UncomparedRoute {
  device: string;
  path: string;
  reason: string;
}

// Lighthouse sometimes fails to load a page on shared runners, and Unlighthouse
// drops it from the results. Those routes can't be compared, but that alone
// isn't a regression.
function findUncomparedRoutes(
  production: CiResult,
  preview: CiResult,
  device: string,
  expectedRoutes: string[] | undefined,
): UncomparedRoute[] {
  const productionPaths = new Set(
    (production.routes ?? []).map((route) => route.path),
  );
  const previewPaths = new Set(
    (preview.routes ?? []).map((route) => route.path),
  );
  const expected =
    expectedRoutes ?? [...new Set([...productionPaths, ...previewPaths])];

  return expected.flatMap((path) => {
    const inProduction = productionPaths.has(path);
    const inPreview = previewPaths.has(path);

    if (inProduction && inPreview) return [];

    const reason =
      !inProduction && !inPreview
        ? "failed on both"
        : inProduction
          ? "failed on preview"
          : "failed on production";

    return [{ device, path, reason }];
  });
}

function findRouteDrops(
  production: CiResult,
  preview: CiResult,
  device: string,
  categories: string[],
): RouteDrop[] {
  const productionRoutes = new Map(
    (production.routes ?? []).map((route) => [route.path, route]),
  );
  const drops: RouteDrop[] = [];

  for (const route of preview.routes ?? []) {
    const productionRoute = productionRoutes.get(route.path);

    if (!productionRoute) continue;

    for (const category of categories) {
      const before = productionRoute.categories[category]?.score;
      const after = route.categories[category]?.score;

      if (typeof before !== "number" || typeof after !== "number") continue;

      if (Math.round(after * 100) < Math.round(before * 100)) {
        drops.push({
          device,
          category,
          path: route.path,
          production: before,
          preview: after,
        });
      }
    }
  }

  return drops;
}

function dropsTable(drops: RouteDrop[]): string[] {
  return [
    "| Route | Device | Category | Production | Preview |",
    "|:------|:-------|:---------|:-----------|:--------|",
    ...drops.map(
      (drop) =>
        `| \`${drop.path}\` | ${drop.device} | ${CATEGORY_LABELS[drop.category] ?? drop.category} | ${score(drop.production)} | ${score(drop.preview)} |`,
    ),
  ];
}

function compareResults(
  productionDesktop: CiResult,
  productionMobile: CiResult,
  previewDesktop: CiResult,
  previewMobile: CiResult,
  {
    performanceThreshold = 10,
    expectedRoutes,
    provider,
  }: CompareOptions = {},
): { markdown: string; failed: boolean; warnings: string[] } {
  const scanProblems = [
    ...validateScan(productionDesktop, "Production desktop", 1),
    ...validateScan(productionMobile, "Production mobile", 1),
    ...validateScan(previewDesktop, "Preview desktop", 1),
    ...validateScan(previewMobile, "Preview mobile", 1),
  ];

  const uncompared: UncomparedRoute[] = [];

  for (const [device, production, preview] of [
    ["Desktop", productionDesktop, previewDesktop],
    ["Mobile", productionMobile, previewMobile],
  ] as const) {
    const missing = findUncomparedRoutes(
      production,
      preview,
      device,
      expectedRoutes,
    );
    const total =
      expectedRoutes?.length ??
      new Set([
        ...(production.routes ?? []).map((route) => route.path),
        ...(preview.routes ?? []).map((route) => route.path),
      ]).size;
    const compared = total - missing.length;

    // With fewer than half the routes compared, a clean result means little.
    if (compared < Math.ceil(total / 2)) {
      scanProblems.push(
        `${device}: only ${compared} of ${total} routes could be compared`,
      );
    }

    uncompared.push(...missing);
  }

  const regressions = [
    ...findRouteDrops(
      productionDesktop,
      previewDesktop,
      "Desktop",
      GATED_CATEGORIES,
    ),
    ...findRouteDrops(
      productionMobile,
      previewMobile,
      "Mobile",
      GATED_CATEGORIES,
    ),
  ];

  const warningDrops = [
    ...findRouteDrops(
      productionDesktop,
      previewDesktop,
      "Desktop",
      WARNED_CATEGORIES,
    ),
    ...findRouteDrops(
      productionMobile,
      previewMobile,
      "Mobile",
      WARNED_CATEGORIES,
    ),
  ];

  const performanceDrops = (
    [
      ["Desktop", productionDesktop, previewDesktop],
      ["Mobile", productionMobile, previewMobile],
    ] as const
  ).filter(
    ([, production, preview]) =>
      Math.round(
        ((production.summary.categories.performance?.score ?? 0) -
          (preview.summary.categories.performance?.score ?? 0)) *
          100,
      ) >= performanceThreshold,
  );

  const failed = scanProblems.length > 0 || regressions.length > 0;
  const hasIssues =
    failed ||
    warningDrops.length > 0 ||
    performanceDrops.length > 0 ||
    uncompared.length > 0;
  const annotations = [
    ...uncompared.map(
      (route) =>
        `${route.path} (${route.device.toLowerCase()}) wasn't compared: ${route.reason}`,
    ),
    ...warningDrops.map(
      (drop) =>
        `${CATEGORY_LABELS[drop.category] ?? drop.category} dropped on ${drop.path} (${drop.device.toLowerCase()}): ${score(drop.production)} → ${score(drop.preview)}`,
    ),
    ...performanceDrops.map(
      ([device]) =>
        `Performance on ${device.toLowerCase()} dropped by ${performanceThreshold}+ points`,
    ),
  ];

  const lines: string[] = [];

  const providerLabel = provider
    ? ` — ${provider.charAt(0).toUpperCase()}${provider.slice(1)}`
    : "";

  lines.push(`## Unlighthouse Comparison${providerLabel}`);
  lines.push(
    "Comparing PR preview deployment Unlighthouse scores vs production Unlighthouse scores.",
  );
  lines.push("");

  if (!hasIssues) {
    lines.push("✅ No regressions found.");
    lines.push("");
  }

  if (scanProblems.length) {
    lines.push("### ❌ Incomplete scans");
    lines.push(
      "_These results can't be trusted. Re-run the workflow, and check the deployment if it keeps failing._",
    );
    lines.push("");
    lines.push(...scanProblems.map((problem) => `- ${problem}`));
    lines.push("");
  }

  if (regressions.length) {
    lines.push("### ❌ Accessibility regressions");
    lines.push(
      "_Accessibility scores are stable between runs, so these fail the check. Open the full report to see which audits failed. If canary fixed this route since you branched, rebase onto canary._",
    );
    lines.push("");
    lines.push(...dropsTable(regressions));
    lines.push("");
  }

  if (warningDrops.length) {
    lines.push("### ⚠️ SEO and best practices drops");
    lines.push(
      "_Some of these audits are flaky, so drops don't fail the check. Worth a look if a route you changed shows up here._",
    );
    lines.push("");
    lines.push(...dropsTable(warningDrops));
    lines.push("");
  }

  if (uncompared.length) {
    lines.push("### ⚠️ Routes not compared");
    lines.push(
      "_Lighthouse couldn't load these pages on one or both deployments, which usually happens on shared runners. They don't fail the check unless too few routes are left to compare._",
    );
    lines.push("");
    lines.push("| Route | Device | Reason |");
    lines.push("|:------|:-------|:-------|");
    lines.push(
      ...uncompared.map(
        (route) => `| \`${route.path}\` | ${route.device} | ${route.reason} |`,
      ),
    );
    lines.push("");
  }

  if (performanceDrops.length) {
    lines.push("### ⚠️ Performance drop");
    lines.push(
      `_Performance on ${performanceDrops.map(([device]) => device.toLowerCase()).join(" and ")} dropped by ${performanceThreshold}+ points. Lab scores from a cold preview are noisy, so confirm before acting on it._`,
    );
    lines.push("");
  }

  lines.push("<details>");
  lines.push("<summary>All scores</summary>");
  lines.push("");

  lines.push("### Summary Score");
  lines.push(
    "_Aggregate score across all categories as reported by Unlighthouse._",
  );
  lines.push("");
  lines.push(COL_HEADER);
  lines.push(COL_SEP);
  lines.push(
    row(
      "Score",
      score(productionDesktop.summary.score),
      score(productionMobile.summary.score),
      score(previewDesktop.summary.score),
      score(previewMobile.summary.score),
    ),
  );
  lines.push("");

  lines.push("### Category Scores");
  lines.push("");
  lines.push(
    "| Category | Prod Desktop | Prod Mobile | Preview Desktop | Preview Mobile |",
  );
  lines.push(
    "|:---------|:------------|:------------|:----------------|:---------------|",
  );

  for (const id of CATEGORY_ORDER) {
    lines.push(
      row(
        CATEGORY_LABELS[id] ?? id,
        score(productionDesktop.summary.categories[id]?.score ?? 0),
        score(productionMobile.summary.categories[id]?.score ?? 0),
        score(previewDesktop.summary.categories[id]?.score ?? 0),
        score(previewMobile.summary.categories[id]?.score ?? 0),
      ),
    );
  }

  lines.push("");

  lines.push("### Core Web Vitals");
  lines.push("");
  lines.push(
    "| Metric | Prod Desktop | Prod Mobile | Preview Desktop | Preview Mobile |",
  );
  lines.push(
    "|:-------|:------------|:------------|:----------------|:---------------|",
  );

  for (const id of METRIC_ORDER) {
    lines.push(
      row(
        METRIC_LABELS[id] ?? id,
        productionDesktop.summary.metrics[id]?.displayValue ?? "—",
        productionMobile.summary.metrics[id]?.displayValue ?? "—",
        previewDesktop.summary.metrics[id]?.displayValue ?? "—",
        previewMobile.summary.metrics[id]?.displayValue ?? "—",
      ),
    );
  }

  lines.push("");
  lines.push("</details>");
  lines.push("");

  return { markdown: lines.join("\n"), failed, warnings: annotations };
}

export { compareResults, validateScan };
export type { CiResult, CiRoute };

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const { values } = parseArgs({
    options: {
      "preview-desktop": { type: "string" },
      "preview-mobile": { type: "string" },
      "production-desktop": { type: "string" },
      "production-mobile": { type: "string" },
      output: { type: "string" },
      "meta-output": { type: "string" },
      "performance-threshold": { type: "string" },
      "expected-routes": { type: "string" },
      provider: { type: "string" },
    },
  });

  const previewDesktopPath = values["preview-desktop"] ?? "";
  const previewMobilePath = values["preview-mobile"] ?? "";
  const productionDesktopPath = values["production-desktop"] ?? "";
  const productionMobilePath = values["production-mobile"] ?? "";

  if (
    !previewDesktopPath ||
    !previewMobilePath ||
    !productionDesktopPath ||
    !productionMobilePath
  ) {
    console.error(
      "Usage: compare-unlighthouse.mts --preview-desktop <path> --preview-mobile <path> --production-desktop <path> --production-mobile <path> [--output <path>] [--meta-output <path>] [--performance-threshold <n>] [--expected-routes <json array>] [--provider <name>]",
    );
    process.exit(1);
  }

  const previewDesktop = loadCiResult(resolve(previewDesktopPath));
  const previewMobile = loadCiResult(resolve(previewMobilePath));
  const productionDesktop = loadCiResult(resolve(productionDesktopPath));
  const productionMobile = loadCiResult(resolve(productionMobilePath));

  const { markdown, failed, warnings } = compareResults(
    productionDesktop,
    productionMobile,
    previewDesktop,
    previewMobile,
    {
      performanceThreshold: Number(values["performance-threshold"] ?? "10"),
      expectedRoutes: values["expected-routes"]
        ? (JSON.parse(values["expected-routes"]) as string[])
        : undefined,
      provider: values.provider,
    },
  );

  const outputPath = values.output ? resolve(values.output) : null;
  const metaOutputPath = values["meta-output"]
    ? resolve(values["meta-output"])
    : null;

  if (outputPath) {
    writeFileSync(outputPath, markdown);
    console.error(`Unlighthouse comparison report written to ${outputPath}`);
  } else {
    process.stdout.write(markdown);
  }

  if (metaOutputPath) {
    writeFileSync(metaOutputPath, `${JSON.stringify({ failed }, null, 2)}\n`);
    console.error(`Meta output written to ${metaOutputPath}`);
  }

  for (const warning of warnings) {
    console.log(`::warning title=Unlighthouse::${warning}`);
  }
}
