#!/usr/bin/env node
/* eslint-disable no-console, no-restricted-syntax, no-plusplus, no-continue */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { resolve } from "node:path";

interface CiRoute {
  path: string;
  score?: number;
  categories: Record<string, { score: number | null } | undefined>;
  metrics?: Record<string, { numericValue?: number } | undefined>;
}

// Unlighthouse 0.19 copies the last route's `score` and `displayValue` into the
// summary; the real means are `averageScore` and `averageNumericValue`.
interface CiResult {
  summary: {
    score: number;
    categories: Record<string, { score: number; averageScore?: number }>;
    metrics: Record<
      string,
      { displayValue: string; averageNumericValue?: number }
    >;
  };
  routes?: CiRoute[];
}

function averageScore(result: CiResult, id: string): number {
  const category = result.summary.categories[id];

  return category?.averageScore ?? category?.score ?? 0;
}

function averageMetric(result: CiResult, id: string): string {
  const metric = result.summary.metrics[id];
  const value = metric?.averageNumericValue;

  if (typeof value !== "number") return metric?.displayValue ?? "—";
  if (id === "cumulative-layout-shift") return value.toFixed(3);
  if (id === "total-blocking-time" || id === "max-potential-fid") {
    return `${Math.round(value)} ms`;
  }

  return `${(value / 1000).toFixed(1)} s`;
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
  "| | Before Desktop | Before Mobile | After Desktop | After Mobile |";
const COL_SEP =
  "|:-|:--------------|:-------------|:-------------|:------------|";

// These score identically on matched routes run to run, so any drop is a real
// regression.
const GATED_CATEGORIES = ["accessibility", "seo", "best-practices"];

interface RouteDrop {
  device: string;
  category: string;
  path: string;
  baseline: number;
  deployment: number;
}

interface CompareOptions {
  // Median per-route performance drop, in points, that fails the check when
  // both devices reach it. A cold page skews one route, not the median.
  performanceThreshold?: number;
  // Routes both sides were asked to scan. Defaults to every route either side
  // reported.
  expectedRoutes?: string[];
  // Describes what the deployment is compared against, e.g. "canary at 1a2b3c4".
  baselineLabel?: string;
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
  baseline: CiResult,
  deployment: CiResult,
  device: string,
  expectedRoutes: string[] | undefined,
): UncomparedRoute[] {
  const baselinePaths = new Set(
    (baseline.routes ?? []).map((route) => route.path),
  );
  const deploymentPaths = new Set(
    (deployment.routes ?? []).map((route) => route.path),
  );
  const expected =
    expectedRoutes ?? [...new Set([...baselinePaths, ...deploymentPaths])];

  return expected.flatMap((path) => {
    const inBaseline = baselinePaths.has(path);
    const inDeployment = deploymentPaths.has(path);

    if (inBaseline && inDeployment) return [];

    const reason =
      !inBaseline && !inDeployment
        ? "failed on both"
        : inBaseline
          ? "failed on this deployment"
          : "failed on the baseline";

    return [{ device, path, reason }];
  });
}

function findRouteDrops(
  baseline: CiResult,
  deployment: CiResult,
  device: string,
  categories: string[],
): RouteDrop[] {
  const baselineRoutes = new Map(
    (baseline.routes ?? []).map((route) => [route.path, route]),
  );
  const drops: RouteDrop[] = [];

  for (const route of deployment.routes ?? []) {
    const baselineRoute = baselineRoutes.get(route.path);

    if (!baselineRoute) continue;

    for (const category of categories) {
      const before = baselineRoute.categories[category]?.score;
      const after = route.categories[category]?.score;

      if (typeof before !== "number" || typeof after !== "number") continue;

      if (Math.round(after * 100) < Math.round(before * 100)) {
        drops.push({
          device,
          category,
          path: route.path,
          baseline: before,
          deployment: after,
        });
      }
    }
  }

  return drops;
}

function dropsTable(drops: RouteDrop[]): string[] {
  return [
    "| Route | Device | Category | Before | After |",
    "|:------|:-------|:---------|:-----------|:--------|",
    ...drops.map(
      (drop) =>
        `| \`${drop.path}\` | ${drop.device} | ${CATEGORY_LABELS[drop.category] ?? drop.category} | ${score(drop.baseline)} | ${score(drop.deployment)} |`,
    ),
  ];
}

// Median of per-route performance drops, in points, across matched routes.
function medianPerformanceDrop(
  baseline: CiResult,
  deployment: CiResult,
): number | null {
  const baselineRoutes = new Map(
    (baseline.routes ?? []).map((route) => [route.path, route]),
  );
  const drops: number[] = [];

  for (const route of deployment.routes ?? []) {
    const before = baselineRoutes.get(route.path)?.categories.performance?.score;
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

function mean(values: number[]): number | undefined {
  return values.length
    ? values.reduce((total, value) => total + value, 0) / values.length
    : undefined;
}

// Recomputes each summary over the routes both scans reported, so a route that
// failed to load on one side doesn't skew the comparison.
function restrictToSharedRoutes(
  baseline: CiResult,
  deployment: CiResult,
): [CiResult, CiResult] {
  if (!baseline.routes?.length || !deployment.routes?.length) {
    return [baseline, deployment];
  }

  const deploymentPaths = new Set(deployment.routes.map((route) => route.path));
  const sharedPaths = new Set(
    baseline.routes
      .map((route) => route.path)
      .filter((path) => deploymentPaths.has(path)),
  );

  const summarize = (result: CiResult): CiResult => {
    const routes = (result.routes ?? []).filter((route) =>
      sharedPaths.has(route.path),
    );
    const numbers = (values: (number | null | undefined)[]) =>
      values.filter((value): value is number => typeof value === "number");

    return {
      ...result,
      summary: {
        score:
          mean(numbers(routes.map((route) => route.score))) ??
          result.summary.score,
        categories: Object.fromEntries(
          CATEGORY_ORDER.map((id) => [
            id,
            {
              score: result.summary.categories[id]?.score ?? 0,
              averageScore: mean(
                numbers(routes.map((route) => route.categories[id]?.score)),
              ),
            },
          ]),
        ),
        metrics: Object.fromEntries(
          METRIC_ORDER.map((id) => [
            id,
            {
              displayValue: result.summary.metrics[id]?.displayValue ?? "—",
              averageNumericValue: mean(
                numbers(routes.map((route) => route.metrics?.[id]?.numericValue)),
              ),
            },
          ]),
        ),
      },
    };
  };

  return [summarize(baseline), summarize(deployment)];
}

function compareResults(
  baselineDesktop: CiResult,
  baselineMobile: CiResult,
  deploymentDesktop: CiResult,
  deploymentMobile: CiResult,
  {
    performanceThreshold = 15,
    expectedRoutes,
    baselineLabel = "the baseline deployment",
    provider,
  }: CompareOptions = {},
): { markdown: string; failed: boolean } {
  const scanProblems = [
    ...validateScan(baselineDesktop, "Baseline desktop", 1),
    ...validateScan(baselineMobile, "Baseline mobile", 1),
    ...validateScan(deploymentDesktop, "Deployment desktop", 1),
    ...validateScan(deploymentMobile, "Deployment mobile", 1),
  ];

  const uncompared: UncomparedRoute[] = [];

  for (const [device, baseline, deployment] of [
    ["Desktop", baselineDesktop, deploymentDesktop],
    ["Mobile", baselineMobile, deploymentMobile],
  ] as const) {
    const missing = findUncomparedRoutes(
      baseline,
      deployment,
      device,
      expectedRoutes,
    );
    const total =
      expectedRoutes?.length ??
      new Set([
        ...(baseline.routes ?? []).map((route) => route.path),
        ...(deployment.routes ?? []).map((route) => route.path),
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
      baselineDesktop,
      deploymentDesktop,
      "Desktop",
      GATED_CATEGORIES,
    ),
    ...findRouteDrops(
      baselineMobile,
      deploymentMobile,
      "Mobile",
      GATED_CATEGORIES,
    ),
  ];

  const desktopPerformanceDrop = medianPerformanceDrop(
    baselineDesktop,
    deploymentDesktop,
  );
  const mobilePerformanceDrop = medianPerformanceDrop(
    baselineMobile,
    deploymentMobile,
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
    `Comparing this deployment's Unlighthouse scores against ${baselineLabel}.`,
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
    lines.push("### ❌ Accessibility, SEO, and best practices regressions");
    lines.push(
      "_These scores are stable between runs, so a drop fails the check. Open the full report to see which audits failed._",
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
    `_Median per-route change against the baseline. Fails at a drop of ${performanceThreshold} points on both devices._`,
  );
  lines.push("");
  lines.push("| Desktop | Mobile |");
  lines.push("|:--------|:-------|");
  lines.push(
    `| ${formatChange(desktopPerformanceDrop)} | ${formatChange(mobilePerformanceDrop)} |`,
  );
  lines.push("");

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


  const [baselineDesktopShared, deploymentDesktopShared] =
    restrictToSharedRoutes(baselineDesktop, deploymentDesktop);
  const [baselineMobileShared, deploymentMobileShared] =
    restrictToSharedRoutes(baselineMobile, deploymentMobile);

  lines.push("### Summary Score");
  lines.push(
    "_Averages across the routes both scans reported, so a route that failed on one side doesn't skew them._",
  );
  lines.push("");
  lines.push(COL_HEADER);
  lines.push(COL_SEP);
  lines.push(
    row(
      "Score",
      score(baselineDesktopShared.summary.score),
      score(baselineMobileShared.summary.score),
      score(deploymentDesktopShared.summary.score),
      score(deploymentMobileShared.summary.score),
    ),
  );
  lines.push("");

  lines.push("### Category Scores");
  lines.push("");
  lines.push(
    "| Category | Before Desktop | Before Mobile | After Desktop | After Mobile |",
  );
  lines.push(
    "|:---------|:--------------|:-------------|:-------------|:------------|",
  );

  for (const id of CATEGORY_ORDER) {
    lines.push(
      row(
        CATEGORY_LABELS[id] ?? id,
        score(averageScore(baselineDesktopShared, id)),
        score(averageScore(baselineMobileShared, id)),
        score(averageScore(deploymentDesktopShared, id)),
        score(averageScore(deploymentMobileShared, id)),
      ),
    );
  }

  lines.push("");

  lines.push("### Core Web Vitals");
  lines.push("");
  lines.push(
    "| Metric | Before Desktop | Before Mobile | After Desktop | After Mobile |",
  );
  lines.push(
    "|:-------|:--------------|:-------------|:-------------|:------------|",
  );

  for (const id of METRIC_ORDER) {
    lines.push(
      row(
        METRIC_LABELS[id] ?? id,
        averageMetric(baselineDesktopShared, id),
        averageMetric(baselineMobileShared, id),
        averageMetric(deploymentDesktopShared, id),
        averageMetric(deploymentMobileShared, id),
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
      "deployment-desktop": { type: "string" },
      "deployment-mobile": { type: "string" },
      "baseline-desktop": { type: "string" },
      "baseline-mobile": { type: "string" },
      output: { type: "string" },
      "meta-output": { type: "string" },
      "performance-threshold": { type: "string" },
      "expected-routes": { type: "string" },
      "baseline-label": { type: "string" },
      provider: { type: "string" },
    },
  });

  const deploymentDesktopPath = values["deployment-desktop"] ?? "";
  const deploymentMobilePath = values["deployment-mobile"] ?? "";
  const baselineDesktopPath = values["baseline-desktop"] ?? "";
  const baselineMobilePath = values["baseline-mobile"] ?? "";

  if (
    !deploymentDesktopPath ||
    !deploymentMobilePath ||
    !baselineDesktopPath ||
    !baselineMobilePath
  ) {
    console.error(
      "Usage: compare-unlighthouse.mts --deployment-desktop <path> --deployment-mobile <path> --baseline-desktop <path> --baseline-mobile <path> [--output <path>] [--meta-output <path>] [--performance-threshold <n>] [--expected-routes <json array>] [--baseline-label <text>] [--provider <name>]",
    );
    process.exit(1);
  }

  const deploymentDesktop = loadCiResult(resolve(deploymentDesktopPath));
  const deploymentMobile = loadCiResult(resolve(deploymentMobilePath));
  const baselineDesktop = loadCiResult(resolve(baselineDesktopPath));
  const baselineMobile = loadCiResult(resolve(baselineMobilePath));

  const { markdown, failed } = compareResults(
    baselineDesktop,
    baselineMobile,
    deploymentDesktop,
    deploymentMobile,
    {
      performanceThreshold: Number(values["performance-threshold"] ?? "15"),
      expectedRoutes: values["expected-routes"]
        ? (JSON.parse(values["expected-routes"]) as string[])
        : undefined,
      baselineLabel: values["baseline-label"],
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
