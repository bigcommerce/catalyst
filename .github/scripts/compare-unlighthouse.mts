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

// Accessibility and SEO audits read the rendered DOM and score identically on
// matched routes run to run, so any drop is a real regression.
const GATED_CATEGORIES = ["accessibility", "seo"];

// Best practices hasn't been stable long enough to gate on, so it's only
// reported in the details.
const REPORTED_CATEGORIES = ["best-practices"];

interface RouteDrop {
  device: string;
  category: string;
  path: string;
  production: number;
  preview: number;
}

interface CompareOptions {
  // Median per-route performance drop, in points, that fails the check when
  // both devices reach it. A cold page skews one route, not the median.
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

// Median of per-route performance drops, in points, across matched routes.
function medianPerformanceDrop(
  production: CiResult,
  preview: CiResult,
): number | null {
  const productionRoutes = new Map(
    (production.routes ?? []).map((route) => [route.path, route]),
  );
  const drops: number[] = [];

  for (const route of preview.routes ?? []) {
    const before = productionRoutes.get(route.path)?.categories.performance?.score;
    const after = route.categories.performance?.score;

    if (typeof before !== "number" || typeof after !== "number") continue;

    drops.push(Math.round((before - after) * 100));
  }

  if (!drops.length) return null;

  drops.sort((x, y) => x - y);

  const middle = Math.floor(drops.length / 2);

  return drops.length % 2
    ? (drops[middle] ?? 0)
    : ((drops[middle - 1] ?? 0) + (drops[middle] ?? 0)) / 2;
}

function formatChange(drop: number | null): string {
  if (drop === null) return "n/a";
  if (drop === 0) return "0";

  return drop > 0 ? `−${drop}` : `+${-drop}`;
}

function compareResults(
  productionDesktop: CiResult,
  productionMobile: CiResult,
  previewDesktop: CiResult,
  previewMobile: CiResult,
  {
    performanceThreshold = 15,
    expectedRoutes,
    provider,
  }: CompareOptions = {},
): { markdown: string; failed: boolean } {
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

  const reportedDrops = [
    ...findRouteDrops(
      productionDesktop,
      previewDesktop,
      "Desktop",
      REPORTED_CATEGORIES,
    ),
    ...findRouteDrops(
      productionMobile,
      previewMobile,
      "Mobile",
      REPORTED_CATEGORIES,
    ),
  ];

  const desktopPerformanceDrop = medianPerformanceDrop(
    productionDesktop,
    previewDesktop,
  );
  const mobilePerformanceDrop = medianPerformanceDrop(
    productionMobile,
    previewMobile,
  );

  // Requiring both devices keeps one slow runner from failing the check.
  const performanceRegressed =
    (desktopPerformanceDrop ?? 0) >= performanceThreshold &&
    (mobilePerformanceDrop ?? 0) >= performanceThreshold;

  const failed =
    scanProblems.length > 0 || regressions.length > 0 || performanceRegressed;

  const lines: string[] = [];

  const providerLabel = provider
    ? ` — ${provider.charAt(0).toUpperCase()}${provider.slice(1)}`
    : "";

  lines.push(`## Unlighthouse Comparison${providerLabel}`);
  lines.push(
    "Comparing PR preview deployment Unlighthouse scores vs production Unlighthouse scores.",
  );
  lines.push("");

  if (!failed) {
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
    lines.push("### ❌ Accessibility and SEO regressions");
    lines.push(
      "_These scores are stable between runs, so a drop fails the check. Open the full report to see which audits failed. If canary fixed this route since you branched, rebase onto canary._",
    );
    lines.push("");
    lines.push(...dropsTable(regressions));
    lines.push("");
  }

  if (performanceRegressed) {
    lines.push("### ❌ Performance regression");
    lines.push(
      `_The median route lost ${desktopPerformanceDrop} points on desktop and ${mobilePerformanceDrop} on mobile. One slow page can't move the median, so this usually means something slowed down every page._`,
    );
    lines.push("");
  }

  lines.push("<details>");
  lines.push("<summary>Details</summary>");
  lines.push("");

  lines.push("### Performance");
  lines.push(
    `_Median per-route change, preview vs production. Fails at a drop of ${performanceThreshold} points on both devices._`,
  );
  lines.push("");
  lines.push("| Desktop | Mobile |");
  lines.push("|:--------|:-------|");
  lines.push(
    `| ${formatChange(desktopPerformanceDrop)} | ${formatChange(mobilePerformanceDrop)} |`,
  );
  lines.push("");

  if (reportedDrops.length) {
    lines.push("### Best practices drops");
    lines.push("_Not gated yet, so these don't fail the check._");
    lines.push("");
    lines.push(...dropsTable(reportedDrops));
    lines.push("");
  }

  if (uncompared.length) {
    lines.push("### Routes not compared");
    lines.push(
      "_Lighthouse couldn't load these pages on one or both deployments, which usually happens on shared runners. They don't fail the check unless fewer than half the routes are left to compare._",
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

  return { markdown: lines.join("\n"), failed };
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

  const { markdown, failed } = compareResults(
    productionDesktop,
    productionMobile,
    previewDesktop,
    previewMobile,
    {
      performanceThreshold: Number(values["performance-threshold"] ?? "15"),
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
}
