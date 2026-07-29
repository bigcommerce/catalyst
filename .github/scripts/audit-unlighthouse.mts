#!/usr/bin/env node
/* eslint-disable no-console, no-restricted-syntax, no-plusplus */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { resolve } from "node:path";

interface CiResult {
  summary: {
    score: number;
    categories: Record<string, { score: number }>;
    metrics: Record<string, { displayValue: string }>;
  };
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

function row(label: string, desktop: string, mobile: string): string {
  return `| ${label} | ${desktop} | ${mobile} |`;
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

function buildReport(
  desktop: CiResult,
  mobile: CiResult,
  branch?: string,
): string {
  const branchLabel = branch ? ` — \`${branch}\`` : "";

  const lines: string[] = [];

  lines.push(`## Unlighthouse Audit${branchLabel}`);
  lines.push("Unlighthouse scores for the latest commit on this branch.");
  lines.push("");

  lines.push("### Summary Score");
  lines.push(
    "_Aggregate score across all categories as reported by Unlighthouse._",
  );
  lines.push("");
  lines.push("| | Desktop | Mobile |");
  lines.push("|:-|:--------|:-------|");
  lines.push(row("Score", score(desktop.summary.score), score(mobile.summary.score)));
  lines.push("");

  lines.push("### Category Scores");
  lines.push("");
  lines.push("| Category | Desktop | Mobile |");
  lines.push("|:---------|:--------|:-------|");

  for (const id of CATEGORY_ORDER) {
    lines.push(
      row(
        CATEGORY_LABELS[id] ?? id,
        score(desktop.summary.categories[id]?.score ?? 0),
        score(mobile.summary.categories[id]?.score ?? 0),
      ),
    );
  }

  lines.push("");

  lines.push("### Core Web Vitals");
  lines.push("");
  lines.push("| Metric | Desktop | Mobile |");
  lines.push("|:-------|:--------|:-------|");

  for (const id of METRIC_ORDER) {
    lines.push(
      row(
        METRIC_LABELS[id] ?? id,
        desktop.summary.metrics[id]?.displayValue ?? "—",
        mobile.summary.metrics[id]?.displayValue ?? "—",
      ),
    );
  }

  lines.push("");

  return lines.join("\n");
}

export { buildReport };
export type { CiResult };

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const { values } = parseArgs({
    options: {
      desktop: { type: "string" },
      mobile: { type: "string" },
      branch: { type: "string" },
      output: { type: "string" },
    },
  });

  if (!values.desktop || !values.mobile) {
    console.error(
      "Usage: report-unlighthouse.mts --desktop <path> --mobile <path> [--branch <name>] [--output <path>]",
    );
    process.exit(1);
  }

  const desktop = loadCiResult(resolve(values.desktop));
  const mobile = loadCiResult(resolve(values.mobile));
  const markdown = buildReport(desktop, mobile, values.branch);
  const outputPath = values.output ? resolve(values.output) : null;

  if (outputPath) {
    writeFileSync(outputPath, markdown);
    console.error(`Unlighthouse report written to ${outputPath}`);
  } else {
    process.stdout.write(markdown);
  }
}
