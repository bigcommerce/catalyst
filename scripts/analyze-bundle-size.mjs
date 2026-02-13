#!/usr/bin/env node

/**
 * Bundle Size Analyzer for Next.js App Router builds.
 *
 * Reads Next.js build manifests and computes gzip sizes for each route,
 * replicating the logic Next.js uses internally (computeFromManifest / getJsPageSizeInKb).
 *
 * Usage:
 *   node scripts/analyze-bundle-size.mjs --build-dir core/.next --output bundle-baseline.json
 *
 * To update the committed baseline:
 *   pnpm build && node scripts/analyze-bundle-size.mjs --build-dir core/.next --output bundle-baseline.json
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { execSync } from "node:child_process";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    "build-dir": { type: "string", default: "core/.next" },
    output: { type: "string", short: "o" },
    help: { type: "boolean", short: "h" },
  },
});

if (args.help) {
  console.log(`Usage: node scripts/analyze-bundle-size.mjs [options]

Options:
  --build-dir <path>  Path to .next build directory (default: core/.next)
  --output, -o <path> Write JSON to file instead of stdout
  --help, -h          Show this help message

To update the committed baseline:
  pnpm build && node scripts/analyze-bundle-size.mjs --build-dir core/.next --output bundle-baseline.json`);
  process.exit(0);
}

const buildDir = resolve(args["build-dir"]);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function getGzipSize(filePath) {
  if (!existsSync(filePath)) {
    return 0;
  }

  const content = readFileSync(filePath);
  const gzipped = gzipSync(content);

  return gzipped.length;
}

function toKb(bytes) {
  return Math.round((bytes / 1024) * 10) / 10;
}

// Read manifests
const appBuildManifestPath = join(buildDir, "app-build-manifest.json");
const buildManifestPath = join(buildDir, "build-manifest.json");

if (!existsSync(appBuildManifestPath)) {
  console.error(`Error: ${appBuildManifestPath} not found. Run 'pnpm build' first.`);
  process.exit(1);
}

if (!existsSync(buildManifestPath)) {
  console.error(`Error: ${buildManifestPath} not found. Run 'pnpm build' first.`);
  process.exit(1);
}

const appBuildManifest = readJson(appBuildManifestPath);
const buildManifest = readJson(buildManifestPath);

// Compute shared chunk sizes (rootMainFiles = webpack runtime + main-app)
// This matches Next.js computeFromManifest which computes the "shared" first-load JS
const sharedChunks = buildManifest.rootMainFiles || [];
const chunkSizeCache = new Map();

function getChunkGzipSize(chunkRelPath) {
  if (chunkSizeCache.has(chunkRelPath)) {
    return chunkSizeCache.get(chunkRelPath);
  }

  const size = getGzipSize(join(buildDir, chunkRelPath));

  chunkSizeCache.set(chunkRelPath, size);

  return size;
}

// Compute shared (first-load) JS size from rootMainFiles
let sharedJsBytes = 0;

for (const chunk of sharedChunks) {
  sharedJsBytes += getChunkGzipSize(chunk);
}

// Process each route from app-build-manifest
const routes = {};
let totalJsBytes = sharedJsBytes;
let totalCssBytes = 0;

// Track which JS chunks we've already counted toward totalJs
const countedJsChunks = new Set(sharedChunks);

for (const [route, chunks] of Object.entries(appBuildManifest.pages)) {
  let routeJsBytes = 0;
  let routeCssBytes = 0;

  for (const chunk of chunks) {
    const size = getChunkGzipSize(chunk);

    if (chunk.endsWith(".css")) {
      routeCssBytes += size;
      totalCssBytes += size;
    } else {
      // Route-specific JS excludes shared chunks (they're in firstLoadJs)
      if (sharedChunks.includes(chunk)) {
        continue;
      }

      routeJsBytes += size;

      if (!countedJsChunks.has(chunk)) {
        countedJsChunks.add(chunk);
        totalJsBytes += size;
      }
    }
  }

  routes[route] = {
    size: toKb(routeJsBytes),
    firstLoadJs: toKb(routeJsBytes + sharedJsBytes),
  };
}

// Get commit SHA
let commitSha = "unknown";

try {
  commitSha = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
} catch {
  // Not in a git repo or git not available
}

const result = {
  commitSha,
  updatedAt: new Date().toISOString().split("T")[0],
  firstLoadJs: toKb(sharedJsBytes),
  routes,
  totalJs: toKb(totalJsBytes),
  totalCss: toKb(totalCssBytes),
};

const json = JSON.stringify(result, null, 2) + "\n";

if (args.output) {
  writeFileSync(resolve(args.output), json);
  console.log(`Bundle analysis written to ${args.output}`);
  console.log(`  First Load JS (shared): ${result.firstLoadJs} kB`);
  console.log(`  Total JS: ${result.totalJs} kB`);
  console.log(`  Total CSS: ${result.totalCss} kB`);
  console.log(`  Routes: ${Object.keys(routes).length}`);
} else {
  process.stdout.write(json);
}
