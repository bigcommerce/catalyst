#!/usr/bin/env node

/**
 * Bundle Size Comparison — produces a Markdown delta report.
 *
 * Usage:
 *   node scripts/compare-bundle-size.mjs --baseline bundle-baseline.json --current /tmp/bundle-current.json --output /tmp/bundle-report.md
 *   node scripts/compare-bundle-size.mjs --no-baseline --current /tmp/bundle-current.json --output /tmp/bundle-report.md
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    baseline: { type: "string", short: "b" },
    current: { type: "string", short: "c" },
    output: { type: "string", short: "o" },
    "no-baseline": { type: "boolean", default: false },
    "threshold-pct": { type: "string", default: "5" },
    "threshold-kb": { type: "string", default: "10" },
    help: { type: "boolean", short: "h" },
  },
});

if (args.help) {
  console.log(`Usage: node scripts/compare-bundle-size.mjs [options]

Options:
  --baseline, -b <path>    Baseline JSON from analyze-bundle-size.mjs
  --current, -c <path>     Current JSON from analyze-bundle-size.mjs
  --output, -o <path>      Write Markdown report to file (default: stdout)
  --no-baseline            First-run mode (no baseline to compare against)
  --threshold-pct <n>      Percentage increase threshold for warnings (default: 5)
  --threshold-kb <n>       KB increase threshold for warnings (default: 10)
  --help, -h               Show this help message`);
  process.exit(0);
}

const thresholdPct = parseFloat(args["threshold-pct"]);
const thresholdKb = parseFloat(args["threshold-kb"]);

function readJson(filePath) {
  return JSON.parse(readFileSync(resolve(filePath), "utf-8"));
}

function formatDelta(baseline, current) {
  const delta = current - baseline;
  const sign = delta >= 0 ? "+" : "";
  const pct = baseline > 0 ? ((delta / baseline) * 100).toFixed(1) : "N/A";
  const pctStr = baseline > 0 ? ` (${sign}${pct}%)` : "";

  return `${sign}${delta.toFixed(1)} kB${pctStr}`;
}

function shouldWarn(baseline, current) {
  if (baseline <= 0) return false;

  const deltaKb = current - baseline;
  const deltaPct = (deltaKb / baseline) * 100;

  // Both thresholds must be exceeded to trigger a warning
  return deltaKb > thresholdKb && deltaPct > thresholdPct;
}

function shortenRoute(route) {
  // Shorten long route paths for readability
  return route.replace(/\/\[locale\]\//, "/.../");
}

const current = readJson(args.current);

let hasWarnings = false;
const lines = [];

lines.push("## Bundle Size Report\n");

if (args["no-baseline"]) {
  // First run — just show absolute sizes
  lines.push("*No baseline found. Showing absolute sizes only.*\n");

  lines.push("| Metric | Current |");
  lines.push("|--------|---------|");
  lines.push(`| First Load JS (shared) | ${current.firstLoadJs} kB |`);
  lines.push(`| Total JS | ${current.totalJs} kB |`);
  lines.push(`| Total CSS | ${current.totalCss} kB |`);
  lines.push("");

  const routeEntries = Object.entries(current.routes).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  lines.push(
    `<details><summary>Route Details (${routeEntries.length} routes)</summary>\n`,
  );
  lines.push("| Route | Size | First Load JS |");
  lines.push("|-------|------|---------------|");

  for (const [route, data] of routeEntries) {
    lines.push(
      `| ${shortenRoute(route)} | ${data.size} kB | ${data.firstLoadJs} kB |`,
    );
  }

  lines.push("\n</details>");
} else {
  const baseline = readJson(args.baseline);

  // Summary table
  lines.push("| Metric | Baseline | Current | Delta | |");
  lines.push("|--------|----------|---------|-------|-|");

  const summaryRows = [
    ["First Load JS (shared)", baseline.firstLoadJs, current.firstLoadJs],
    ["Total JS", baseline.totalJs, current.totalJs],
    ["Total CSS", baseline.totalCss, current.totalCss],
  ];

  for (const [label, base, curr] of summaryRows) {
    const warn = shouldWarn(base, curr);

    if (warn) hasWarnings = true;
    lines.push(
      `| ${label} | ${base} kB | ${curr} kB | ${formatDelta(base, curr)} | ${warn ? "warning" : ""} |`,
    );
  }

  lines.push("");

  // Route details
  const allRoutes = new Set([
    ...Object.keys(baseline.routes),
    ...Object.keys(current.routes),
  ]);
  const sortedRoutes = [...allRoutes].sort((a, b) => a.localeCompare(b));

  lines.push(
    `<details><summary>Route Details (${sortedRoutes.length} routes)</summary>\n`,
  );
  lines.push("| Route | Baseline | Current | Delta | |");
  lines.push("|-------|----------|---------|-------|-|");

  for (const route of sortedRoutes) {
    const base = baseline.routes[route];
    const curr = current.routes[route];
    const short = shortenRoute(route);

    if (!base) {
      // New route
      lines.push(
        `| ${short} | — | ${curr.size} kB | NEW | |`,
      );
    } else if (!curr) {
      // Removed route
      lines.push(
        `| ${short} | ${base.size} kB | — | REMOVED | |`,
      );
    } else {
      const warn = shouldWarn(base.size, curr.size);

      if (warn) hasWarnings = true;
      lines.push(
        `| ${short} | ${base.size} kB | ${curr.size} kB | ${formatDelta(base.size, curr.size)} | ${warn ? "warning" : ""} |`,
      );
    }
  }

  lines.push("\n</details>");
}

const markdown = lines.join("\n") + "\n";

if (args.output) {
  writeFileSync(resolve(args.output), markdown);
  console.log(`Report written to ${args.output}`);
} else {
  process.stdout.write(markdown);
}

// Exit with code 0 always — warnings are informational, not blocking.
// The CI workflow reads the markdown to detect warnings.
if (hasWarnings) {
  // Write a marker file so the workflow can detect warnings without parsing markdown
  if (args.output) {
    writeFileSync(resolve(args.output + ".warnings"), "true");
  }

  console.error("Warning: Bundle size increased significantly for one or more metrics.");
}
