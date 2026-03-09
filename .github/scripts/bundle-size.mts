#!/usr/bin/env node
/* eslint-disable no-console, no-restricted-syntax, no-plusplus, no-continue */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { gzipSync } from "node:zlib";

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));
const CORE_DIR = resolve(__dirname, "..", "..", "core");

interface ChunkSizes {
  js: number;
  css: number;
}

interface RouteMetric {
  js: number;
  css: number;
  firstLoadJs: number;
}

interface BundleReport {
  commitSha: string;
  updatedAt: string;
  firstLoadJs: number;
  totalJs: number;
  totalCss: number;
  shared?: { js: number; css: number };
  routes?: Record<string, RouteMetric>;
}

interface CompareOptions {
  threshold?: number;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

const sizeCache = new Map<string, number>();

function clearSizeCache(): void {
  sizeCache.clear();
}

function getGzipSize(filePath: string): number {
  if (sizeCache.has(filePath)) return sizeCache.get(filePath)!;

  if (!existsSync(filePath)) {
    sizeCache.set(filePath, 0);

    return 0;
  }

  const data = readFileSync(filePath);
  const gzipped = gzipSync(data, { level: 6 });
  const sizeKb = gzipped.length / 1024;

  sizeCache.set(filePath, sizeKb);

  return sizeKb;
}

function sumChunkSizes(chunks: Iterable<string>, dir: string): ChunkSizes {
  let js = 0;
  let css = 0;

  for (const chunk of chunks) {
    const size = getGzipSize(join(dir, chunk));

    if (chunk.endsWith(".css")) {
      css += size;
    } else {
      js += size;
    }
  }

  return { js, css };
}

function parseManifestEntries(entries: Record<string, string[]>): {
  layouts: Record<string, string[]>;
  pages: Record<string, string[]>;
} {
  const layouts: Record<string, string[]> = {};
  const pages: Record<string, string[]> = {};

  for (const [route, chunks] of Object.entries(entries)) {
    if (route.endsWith("/layout")) {
      layouts[route] = chunks;
    } else if (route.endsWith("/page")) {
      pages[route] = chunks;
    }
  }

  return { layouts, pages };
}

function computeRootLayout(
  layoutPaths: string[],
  layouts: Record<string, string[]>,
  sharedChunks: Set<string>,
  nextDir: string,
): {
  rootLayoutPath: string | null;
  rootLayoutChunks: Set<string>;
  rootLayoutJs: number;
  rootLayoutCss: number;
} {
  const sorted = [...layoutPaths].sort(
    (a, b) => a.split("/").length - b.split("/").length,
  );
  const rootLayoutPath = sorted[0] ?? null;
  const rootLayoutChunks = new Set<string>();
  let rootLayoutJs = 0;
  let rootLayoutCss = 0;

  if (rootLayoutPath) {
    const uniqueChunks = layouts[rootLayoutPath].filter(
      (c) => !sharedChunks.has(c),
    );
    const sizes = sumChunkSizes(uniqueChunks, nextDir);

    rootLayoutJs = sizes.js;
    rootLayoutCss = sizes.css;
    uniqueChunks.forEach((c) => rootLayoutChunks.add(c));
  }

  return { rootLayoutPath, rootLayoutChunks, rootLayoutJs, rootLayoutCss };
}

function computeRouteMetrics(
  pages: Record<string, string[]>,
  layouts: Record<string, string[]>,
  sharedChunks: Set<string>,
  rootLayoutPath: string | null,
  rootLayoutChunks: Set<string>,
  firstLoadJs: number,
  nextDir: string,
): Record<string, RouteMetric> {
  const routes: Record<string, RouteMetric> = {};

  for (const [route, chunks] of Object.entries(pages)) {
    const segments = route.split("/");

    segments.pop(); // remove 'page'

    const ancestorLayouts: string[] = [];

    for (let i = segments.length; i >= 1; i--) {
      const parentPath = `${segments.slice(0, i).join("/")}/layout`;

      if (layouts[parentPath]) {
        ancestorLayouts.push(parentPath);
      }
    }

    const routeChunks = new Set<string>();

    for (const chunk of chunks.filter((c) => !sharedChunks.has(c))) {
      if (!rootLayoutChunks.has(chunk)) {
        routeChunks.add(chunk);
      }
    }

    for (const layoutPath of ancestorLayouts) {
      if (layoutPath === rootLayoutPath) continue;

      for (const chunk of layouts[layoutPath].filter(
        (c) => !sharedChunks.has(c),
      )) {
        if (!rootLayoutChunks.has(chunk)) {
          routeChunks.add(chunk);
        }
      }
    }

    const sizes = sumChunkSizes(routeChunks, nextDir);

    routes[route] = {
      js: round1(sizes.js),
      css: round1(sizes.css),
      firstLoadJs: round1(firstLoadJs + sizes.js + sizes.css),
    };
  }

  return routes;
}

function readTurbopackEntries(serverAppDir: string): Record<string, string[]> {
  const entries: Record<string, string[]> = {};

  function scanDir(dir: string): void {
    const items = readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = join(dir, item.name);

      if (item.isDirectory()) {
        scanDir(fullPath);
      } else if (item.name.endsWith("_client-reference-manifest.js")) {
        try {
          const content = readFileSync(fullPath, "utf-8");
          const g: Record<string, unknown> = {};
          // eslint-disable-next-line no-new-func
          const fn = new Function("globalThis", "self", `${content}\nreturn globalThis;`);
          const result = fn(g, g) as {
            __RSC_MANIFEST?: Record<
              string,
              { clientModules?: Record<string, { chunks?: string[] }> }
            >;
          };
          const manifest = result.__RSC_MANIFEST;

          if (!manifest) continue;

          for (const [routeKey, entry] of Object.entries(manifest)) {
            if (!routeKey.endsWith("/page")) continue;

            const chunks = new Set<string>();

            for (const mod of Object.values(entry.clientModules ?? {})) {
              for (const chunk of mod.chunks ?? []) {
                // Normalize: "/_next/static/chunks/xxx.js" → "static/chunks/xxx.js"
                chunks.add(chunk.replace(/^\/_next\//, ""));
              }
            }

            entries[routeKey] = [...chunks];
          }
        } catch {
          // Skip malformed manifest files
        }
      }
    }
  }

  scanDir(serverAppDir);

  return entries;
}

function compareReport(
  baseline: BundleReport,
  current: BundleReport,
  { threshold = 5 }: CompareOptions = {},
): string {
  function hasChanged(base: number, curr: number): boolean {
    if (round1(curr - base) === 0) return false;
    const pct = base > 0 ? ((curr - base) / base) * 100 : null;
    if (pct !== null && round1(pct) === 0) return false;
    return true;
  }

  function formatDelta(base: number, curr: number): string {
    const delta = curr - base;
    const rounded = round1(delta);
    const sign = delta >= 0 ? "+" : "";
    const pct = base > 0 ? (delta / base) * 100 : 0;
    const pctStr = base > 0 ? ` (${sign}${round1(pct)}%)` : "";
    return `${sign}${rounded} kB${pctStr}`;
  }

  function isWarning(base: number, curr: number): boolean {
    const delta = curr - base;
    const pct = base > 0 ? (delta / base) * 100 : 0;

    return delta > 1 && pct > threshold;
  }

  function displayRoute(route: string): string {
    return route.replace(/^\/\[locale\]/, "");
  }

  const lines: string[] = [];

  lines.push("## Bundle Size Report");
  lines.push("");
  lines.push(
    `Comparing against baseline from \`${baseline.commitSha}\` (${baseline.updatedAt}).`,
  );
  lines.push("");

  const changedMetrics = [
    {
      name: "First Load JS",
      base: baseline.firstLoadJs,
      curr: current.firstLoadJs,
    },
    { name: "Total JS", base: baseline.totalJs, curr: current.totalJs },
    { name: "Total CSS", base: baseline.totalCss, curr: current.totalCss },
  ].filter((m) => hasChanged(m.base, m.curr));

  const allRoutes = new Set([
    ...Object.keys(baseline.routes ?? {}),
    ...Object.keys(current.routes ?? {}),
  ]);

  const sortedRoutes = [...allRoutes].sort();
  const routeLines: string[] = [];

  for (const route of sortedRoutes) {
    const display = displayRoute(route);
    const base = baseline.routes?.[route];
    const curr = current.routes?.[route];

    if (!base && curr) {
      routeLines.push(
        `| ${display} | -- | ${round1(curr.firstLoadJs)} kB | ✨ NEW | |`,
      );
    } else if (base && !curr) {
      routeLines.push(
        `| ${display} | ${round1(base.firstLoadJs)} kB | -- | REMOVED | |`,
      );
    } else if (base && curr && hasChanged(base.firstLoadJs, curr.firstLoadJs)) {
      const d = formatDelta(base.firstLoadJs, curr.firstLoadJs);
      const warn = isWarning(base.firstLoadJs, curr.firstLoadJs) ? " ⚠️" : "";

      routeLines.push(
        `| ${display} | ${round1(base.firstLoadJs)} kB | ${round1(curr.firstLoadJs)} kB | ${d} |${warn} |`,
      );
    }
  }

  if (changedMetrics.length === 0 && routeLines.length === 0) {
    lines.push("No bundle size changes detected.");
    lines.push("");
    return lines.join("\n");
  }

  if (changedMetrics.length > 0) {
    lines.push("| Metric | Baseline | Current | Delta | |");
    lines.push("|:-------|:---------|:--------|:------|:-|");

    for (const m of changedMetrics) {
      const d = formatDelta(m.base, m.curr);
      const warn = isWarning(m.base, m.curr) ? " ⚠️" : "";

      lines.push(
        `| ${m.name} | ${round1(m.base)} kB | ${round1(m.curr)} kB | ${d} |${warn} |`,
      );
    }

    lines.push("");
  }

  lines.push("### Per-Route First Load JS");
  lines.push("");

  if (routeLines.length > 0) {
    lines.push("| Route | Baseline | Current | Delta | |");
    lines.push("|:------|:---------|:--------|:------|:-|");
    lines.push(...routeLines);
    lines.push("");
    lines.push(
      `> Threshold: ${threshold}% increase. Routes with ⚠️ exceed the threshold.`,
    );
  } else {
    lines.push("_No route changes detected._");
  }

  lines.push("");

  return lines.join("\n");
}

function generate(
  nextDir: string,
  values: Record<string, string | undefined>,
): void {
  const appManifestPath = join(nextDir, "app-build-manifest.json");
  const buildManifestPath = join(nextDir, "build-manifest.json");
  const serverAppDir = join(nextDir, "server", "app");

  const isWebpack = existsSync(appManifestPath);
  const isTurbopack = !isWebpack && existsSync(serverAppDir);

  if (!isWebpack && !isTurbopack) {
    console.error(
      "Error: No build output found (.next/app-build-manifest.json or .next/server/app/). Run `next build` first.",
    );
    process.exit(1);
  }

  const buildManifest = JSON.parse(
    readFileSync(buildManifestPath, "utf-8"),
  ) as {
    rootMainFiles?: string[];
    polyfillFiles?: string[];
  };

  const rootMainFiles = new Set(buildManifest.rootMainFiles ?? []);
  const polyfillFiles = new Set(buildManifest.polyfillFiles ?? []);
  const sharedChunks = new Set([...rootMainFiles, ...polyfillFiles]);

  let entries: Record<string, string[]>;

  if (isWebpack) {
    const appManifest = JSON.parse(readFileSync(appManifestPath, "utf-8")) as {
      pages?: Record<string, string[]>;
    };

    entries = appManifest.pages ?? {};
  } else {
    entries = readTurbopackEntries(serverAppDir);
  }
  const { layouts, pages } = parseManifestEntries(entries);

  // Shared JS = sum of rootMainFiles gzipped sizes
  const sharedSizes = sumChunkSizes(rootMainFiles, nextDir);
  const sharedJs = round1(sharedSizes.js);

  // Root layout
  const { rootLayoutPath, rootLayoutChunks, rootLayoutJs, rootLayoutCss } =
    computeRootLayout(Object.keys(layouts), layouts, sharedChunks, nextDir);

  const sharedCss = round1(rootLayoutCss);
  const firstLoadJs = round1(sharedJs + rootLayoutJs + rootLayoutCss);

  // Total JS and CSS across all unique chunks
  const allChunksSet = new Set<string>();

  for (const chunks of Object.values(entries)) {
    for (const chunk of chunks) {
      allChunksSet.add(chunk);
    }
  }

  const totals = sumChunkSizes(allChunksSet, nextDir);
  const totalJs = round1(totals.js);
  const totalCss = round1(totals.css);

  // Per-route metrics
  const routes = computeRouteMetrics(
    pages,
    layouts,
    sharedChunks,
    rootLayoutPath,
    rootLayoutChunks,
    firstLoadJs,
    nextDir,
  );

  const result: BundleReport = {
    commitSha: values.sha ?? "unknown",
    updatedAt: new Date().toISOString().split("T")[0],
    firstLoadJs,
    shared: { js: sharedJs, css: sharedCss },
    routes,
    totalJs,
    totalCss,
  };

  const output = values.output ?? null;
  const json = `${JSON.stringify(result, null, 2)}\n`;

  if (output) {
    writeFileSync(resolve(output), json);
    console.error(`Bundle size report written to ${output}`);
  } else {
    process.stdout.write(json);
  }
}

function compare(
  nextDir: string,
  values: Record<string, string | undefined>,
): void {
  const baselinePath = resolve(
    values.baseline ?? join(CORE_DIR, "bundle-baseline.json"),
  );
  const currentPath = resolve(values.current ?? "");
  const threshold = Number(values.threshold ?? "5");

  if (!currentPath || !existsSync(currentPath)) {
    console.error("Error: --current <path> is required and must exist");
    process.exit(1);
  }

  if (!existsSync(baselinePath)) {
    console.error(`Error: baseline not found at ${baselinePath}`);
    process.exit(1);
  }

  const baseline = JSON.parse(
    readFileSync(baselinePath, "utf-8"),
  ) as BundleReport;
  const current = JSON.parse(
    readFileSync(currentPath, "utf-8"),
  ) as BundleReport;

  process.stdout.write(compareReport(baseline, current, { threshold }));
}

export {
  round1,
  getGzipSize,
  sumChunkSizes,
  parseManifestEntries,
  computeRootLayout,
  computeRouteMetrics,
  compareReport,
  clearSizeCache,
  readTurbopackEntries,
};

export type { BundleReport, RouteMetric, ChunkSizes, CompareOptions };

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      output: { type: "string" },
      baseline: { type: "string" },
      current: { type: "string" },
      threshold: { type: "string" },
      sha: { type: "string" },
      dir: { type: "string" },
    },
  });

  const NEXT_DIR = values.dir ? resolve(values.dir) : join(CORE_DIR, ".next");
  const command = positionals.at(0);

  if (command === "generate") {
    generate(NEXT_DIR, values);
  } else if (command === "compare") {
    compare(NEXT_DIR, values);
  } else {
    console.error("Usage: bundle-size.mts <generate|compare> [options]");
    console.error("");
    console.error("Commands:");
    console.error(
      "  generate  Analyze .next/ build output and produce bundle size JSON",
    );
    console.error("    --output <path>  Write JSON to file instead of stdout");
    console.error("");
    console.error("  compare   Compare current bundle against a baseline");
    console.error(
      "    --baseline <path>  Path to baseline JSON (default: ./bundle-baseline.json)",
    );
    console.error(
      "    --current <path>   Path to current bundle JSON (required)",
    );
    console.error(
      "    --threshold <n>    Warning threshold percentage (default: 5)",
    );
    process.exit(1);
  }
}
