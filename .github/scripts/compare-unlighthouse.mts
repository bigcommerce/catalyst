#!/usr/bin/env node
/* eslint-disable no-console, no-restricted-syntax, no-plusplus, no-continue */

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

function compareResults(
  productionDesktop: CiResult,
  productionMobile: CiResult,
  previewDesktop: CiResult,
  previewMobile: CiResult,
  threshold: number,
  provider?: string,
): { markdown: string; hasChanges: boolean } {
  const thresholdDecimal = threshold / 100;

  // hasChanges: any summary or category score pair differs by >= threshold
  let hasChanges =
    Math.abs(previewDesktop.summary.score - productionDesktop.summary.score) >=
      thresholdDecimal ||
    Math.abs(previewMobile.summary.score - productionMobile.summary.score) >=
      thresholdDecimal;

  if (!hasChanges) {
    for (const id of CATEGORY_ORDER) {
      const deltaDesktop = Math.abs(
        (previewDesktop.summary.categories[id]?.score ?? 0) -
          (productionDesktop.summary.categories[id]?.score ?? 0),
      );
      const deltaMobile = Math.abs(
        (previewMobile.summary.categories[id]?.score ?? 0) -
          (productionMobile.summary.categories[id]?.score ?? 0),
      );

      if (deltaDesktop >= thresholdDecimal || deltaMobile >= thresholdDecimal) {
        hasChanges = true;
        break;
      }
    }
  }

  const lines: string[] = [];

  const providerLabel = provider
    ? ` — ${provider.charAt(0).toUpperCase()}${provider.slice(1)}`
    : "";

  lines.push(`## Unlighthouse Performance Comparison${providerLabel}`);
  lines.push(
    "Comparing PR preview deployment Unlighthouse scores vs production Unlighthouse scores.",
  );
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

  return { markdown: lines.join("\n"), hasChanges };
}

export { compareResults };
export type { CiResult };

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
      threshold: { type: "string" },
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
      "Usage: compare-unlighthouse.mts --preview-desktop <path> --preview-mobile <path> --production-desktop <path> --production-mobile <path> [--output <path>] [--meta-output <path>] [--threshold <n>] [--provider <name>]",
    );
    process.exit(1);
  }

  const threshold = Number(values.threshold ?? "1");

  const previewDesktop = loadCiResult(resolve(previewDesktopPath));
  const previewMobile = loadCiResult(resolve(previewMobilePath));
  const productionDesktop = loadCiResult(resolve(productionDesktopPath));
  const productionMobile = loadCiResult(resolve(productionMobilePath));

  const { markdown, hasChanges } = compareResults(
    productionDesktop,
    productionMobile,
    previewDesktop,
    previewMobile,
    threshold,
    values.provider,
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
    writeFileSync(
      metaOutputPath,
      `${JSON.stringify({ hasChanges }, null, 2)}\n`,
    );
    console.error(`Meta output written to ${metaOutputPath}`);
  }
}
