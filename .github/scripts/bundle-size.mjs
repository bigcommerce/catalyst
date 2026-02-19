#!/usr/bin/env node
/* eslint-disable no-console, no-restricted-syntax, no-plusplus, no-continue */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { gzipSync } from 'node:zlib';

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));
const CORE_DIR = resolve(__dirname, '../../core');
const NEXT_DIR = join(CORE_DIR, '.next');

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    output:    { type: 'string' },
    baseline:  { type: 'string' },
    current:   { type: 'string' },
    threshold: { type: 'string' },
    sha:       { type: 'string' },
  },
});
const command = positionals[0];

function round1(n) {
  return Math.round(n * 10) / 10;
}

const sizeCache = new Map();

function getGzipSize(filePath) {
  if (sizeCache.has(filePath)) return sizeCache.get(filePath);

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

function sumChunkSizes(chunks, dir) {
  let js = 0;
  let css = 0;

  for (const chunk of chunks) {
    const size = getGzipSize(join(dir, chunk));

    if (chunk.endsWith('.css')) {
      css += size;
    } else {
      js += size;
    }
  }

  return { js, css };
}

function parseManifestEntries(entries) {
  const layouts = {};
  const pages = {};

  for (const [route, chunks] of Object.entries(entries)) {
    if (route.endsWith('/layout')) {
      layouts[route] = chunks;
    } else if (route.endsWith('/page')) {
      pages[route] = chunks;
    }
  }

  return { layouts, pages };
}

function computeRootLayout(layoutPaths, layouts, sharedChunks) {
  const sorted = [...layoutPaths].sort((a, b) => a.split('/').length - b.split('/').length);
  const rootLayoutPath = sorted[0] || null;
  const rootLayoutChunks = new Set();
  let rootLayoutJs = 0;
  let rootLayoutCss = 0;

  if (rootLayoutPath) {
    const uniqueChunks = layouts[rootLayoutPath].filter((c) => !sharedChunks.has(c));
    const sizes = sumChunkSizes(uniqueChunks, NEXT_DIR);

    rootLayoutJs = sizes.js;
    rootLayoutCss = sizes.css;
    uniqueChunks.forEach((c) => rootLayoutChunks.add(c));
  }

  return { rootLayoutPath, rootLayoutChunks, rootLayoutJs, rootLayoutCss };
}

function computeRouteMetrics(
  pages,
  layouts,
  sharedChunks,
  rootLayoutPath,
  rootLayoutChunks,
  firstLoadJs,
) {
  const routes = {};

  for (const [route, chunks] of Object.entries(pages)) {
    const segments = route.split('/');

    segments.pop(); // remove 'page'

    const ancestorLayouts = [];

    for (let i = segments.length; i >= 1; i--) {
      const parentPath = `${segments.slice(0, i).join('/')}/layout`;

      if (layouts[parentPath]) {
        ancestorLayouts.push(parentPath);
      }
    }

    const routeChunks = new Set();

    for (const chunk of chunks.filter((c) => !sharedChunks.has(c))) {
      if (!rootLayoutChunks.has(chunk)) {
        routeChunks.add(chunk);
      }
    }

    for (const layoutPath of ancestorLayouts) {
      if (layoutPath === rootLayoutPath) continue;

      for (const chunk of layouts[layoutPath].filter((c) => !sharedChunks.has(c))) {
        if (!rootLayoutChunks.has(chunk)) {
          routeChunks.add(chunk);
        }
      }
    }

    const sizes = sumChunkSizes(routeChunks, NEXT_DIR);

    routes[route] = {
      js: round1(sizes.js),
      css: round1(sizes.css),
      firstLoadJs: round1(firstLoadJs + sizes.js + sizes.css),
    };
  }

  return routes;
}

function generate() {
  const appManifestPath = join(NEXT_DIR, 'app-build-manifest.json');
  const buildManifestPath = join(NEXT_DIR, 'build-manifest.json');

  if (!existsSync(appManifestPath)) {
    console.error('Error: .next/app-build-manifest.json not found. Run `next build` first.');
    process.exit(1);
  }

  const appManifest = JSON.parse(readFileSync(appManifestPath, 'utf-8'));
  const buildManifest = JSON.parse(readFileSync(buildManifestPath, 'utf-8'));

  const rootMainFiles = new Set(buildManifest.rootMainFiles || []);
  const polyfillFiles = new Set(buildManifest.polyfillFiles || []);
  const sharedChunks = new Set([...rootMainFiles, ...polyfillFiles]);

  const entries = appManifest.pages || {};
  const { layouts, pages } = parseManifestEntries(entries);

  // Shared JS = sum of rootMainFiles gzipped sizes
  const sharedSizes = sumChunkSizes(rootMainFiles, NEXT_DIR);
  const sharedJs = round1(sharedSizes.js);

  // Root layout
  const { rootLayoutPath, rootLayoutChunks, rootLayoutJs, rootLayoutCss } = computeRootLayout(
    Object.keys(layouts),
    layouts,
    sharedChunks,
  );

  const sharedCss = round1(rootLayoutCss);
  const firstLoadJs = round1(sharedJs + rootLayoutJs + rootLayoutCss);

  // Total JS and CSS across all unique chunks
  const allChunksSet = new Set();

  for (const chunks of Object.values(entries)) {
    for (const chunk of chunks) {
      allChunksSet.add(chunk);
    }
  }

  const totals = sumChunkSizes(allChunksSet, NEXT_DIR);
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
  );

  const result = {
    commitSha: values.sha ?? 'unknown',
    updatedAt: new Date().toISOString().split('T')[0],
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

function compare() {
  const baselinePath = resolve(values.baseline ?? join(CORE_DIR, 'bundle-baseline.json'));
  const currentPath = resolve(values.current ?? '');
  const threshold = Number(values.threshold ?? '5');

  if (!currentPath || !existsSync(currentPath)) {
    console.error('Error: --current <path> is required and must exist');
    process.exit(1);
  }

  if (!existsSync(baselinePath)) {
    console.error(`Error: baseline not found at ${baselinePath}`);
    process.exit(1);
  }

  const baseline = JSON.parse(readFileSync(baselinePath, 'utf-8'));
  const current = JSON.parse(readFileSync(currentPath, 'utf-8'));

  function hasChanged(base, curr) {
    return round1(curr - base) !== 0;
  }

  function formatDelta(base, curr) {
    const delta = curr - base;
    const rounded = round1(delta);
    const sign = delta >= 0 ? '+' : '';
    const pct = base > 0 ? (delta / base) * 100 : 0;
    const pctStr = base > 0 ? ` (${sign}${round1(pct)}%)` : '';
    return `${sign}${rounded} kB${pctStr}`;
  }

  function isWarning(base, curr) {
    const delta = curr - base;
    const pct = base > 0 ? (delta / base) * 100 : 0;

    return delta > 1 && pct > threshold;
  }

  function displayRoute(route) {
    return route.replace(/^\/\[locale\]/, '');
  }

  const lines = [];

  lines.push('## Bundle Size Report');
  lines.push('');
  lines.push(`Comparing against baseline from \`${baseline.commitSha}\` (${baseline.updatedAt}).`);
  lines.push('');

  const changedMetrics = [
    { name: 'First Load JS', base: baseline.firstLoadJs, curr: current.firstLoadJs },
    { name: 'Total JS', base: baseline.totalJs, curr: current.totalJs },
    { name: 'Total CSS', base: baseline.totalCss, curr: current.totalCss },
  ].filter((m) => hasChanged(m.base, m.curr));

  if (changedMetrics.length > 0) {
    lines.push('| Metric | Baseline | Current | Delta | |');
    lines.push('|:-------|:---------|:--------|:------|:-|');

    for (const m of changedMetrics) {
      const d = formatDelta(m.base, m.curr);
      const warn = isWarning(m.base, m.curr) ? ' ⚠️' : '';

      lines.push(`| ${m.name} | ${round1(m.base)} kB | ${round1(m.curr)} kB | ${d} |${warn} |`);
    }

    lines.push('');
  }

  lines.push('### Per-Route First Load JS');
  lines.push('');

  const allRoutes = new Set([
    ...Object.keys(baseline.routes || {}),
    ...Object.keys(current.routes || {}),
  ]);

  const sortedRoutes = [...allRoutes].sort();

  const routeLines = [];

  for (const route of sortedRoutes) {
    const display = displayRoute(route);
    const base = baseline.routes?.[route];
    const curr = current.routes?.[route];

    if (!base && curr) {
      routeLines.push(`| ${display} | -- | ${round1(curr.firstLoadJs)} kB | ✨ NEW | |`);
    } else if (base && !curr) {
      routeLines.push(`| ${display} | ${round1(base.firstLoadJs)} kB | -- | REMOVED | |`);
    } else if (base && curr && hasChanged(base.firstLoadJs, curr.firstLoadJs)) {
      const d = formatDelta(base.firstLoadJs, curr.firstLoadJs);
      const warn = isWarning(base.firstLoadJs, curr.firstLoadJs) ? ' ⚠️' : '';

      routeLines.push(
        `| ${display} | ${round1(base.firstLoadJs)} kB | ${round1(curr.firstLoadJs)} kB | ${d} |${warn} |`,
      );
    }
  }

  if (routeLines.length > 0) {
    lines.push('| Route | Baseline | Current | Delta | |');
    lines.push('|:------|:---------|:--------|:------|:-|');
    lines.push(...routeLines);
  } else {
    lines.push('_No route changes detected._');
  }

  lines.push('');
  lines.push(`> Threshold: ${threshold}% increase. Routes with ⚠️ exceed the threshold.`);
  lines.push('');

  process.stdout.write(lines.join('\n'));
}

if (command === 'generate') {
  generate();
} else if (command === 'compare') {
  compare();
} else {
  console.error('Usage: bundle-size.mjs <generate|compare> [options]');
  console.error('');
  console.error('Commands:');
  console.error('  generate  Analyze .next/ build output and produce bundle size JSON');
  console.error('    --output <path>  Write JSON to file instead of stdout');
  console.error('');
  console.error('  compare   Compare current bundle against a baseline');
  console.error('    --baseline <path>  Path to baseline JSON (default: ./bundle-baseline.json)');
  console.error('    --current <path>   Path to current bundle JSON (required)');
  console.error('    --threshold <n>    Warning threshold percentage (default: 5)');
  process.exit(1);
}
