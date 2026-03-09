import { describe, it, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, rmSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  round1,
  getGzipSize,
  parseManifestEntries,
  computeRootLayout,
  computeRouteMetrics,
  compareReport,
  clearSizeCache,
  readTurbopackEntries,
} from '../bundle-size.mts';

// ---------------------------------------------------------------------------
// Shared temp directory with fixture chunk files.
// Initialized at module load time so testDir is set before any test runs.
// Files are large enough (varied content) to produce measurable gzip sizes.
// ---------------------------------------------------------------------------

const testDir = join(tmpdir(), `bundle-size-test-${Date.now()}`);

mkdirSync(testDir, { recursive: true });

// Each file gets unique, varied content so gzip produces a non-trivial size.
const makeJs = (prefix: string) =>
  Array.from(
    { length: 30 },
    (_, i) => `export const ${prefix}_${i} = ${JSON.stringify(`${prefix}_v${i}_pad${i * 37 + 13}`)};`,
  ).join('\n') + '\n';

const makeCss = (prefix: string) =>
  Array.from(
    { length: 20 },
    (_, i) => `.${prefix}-class-${i} { color: hsl(${i * 17}, 50%, 50%); margin: ${i}px; }`,
  ).join('\n') + '\n';

writeFileSync(join(testDir, 'route.js'), makeJs('route'));
writeFileSync(join(testDir, 'shared.js'), makeJs('shared'));
writeFileSync(join(testDir, 'root-layout.js'), makeJs('root_layout'));
writeFileSync(join(testDir, 'product-layout.js'), makeJs('product_layout'));
writeFileSync(join(testDir, 'route.css'), makeCss('route'));

after(() => {
  rmSync(testDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// round1
// ---------------------------------------------------------------------------

describe('round1', () => {
  it('rounds up at .05', () => {
    assert.equal(round1(1.25), 1.3);
  });

  it('rounds down below .05', () => {
    assert.equal(round1(1.24), 1.2);
  });

  it('returns 0 unchanged', () => {
    assert.equal(round1(0), 0);
  });

  it('handles negative values', () => {
    assert.equal(round1(-1.25), -1.2);
  });
});

// ---------------------------------------------------------------------------
// parseManifestEntries
// ---------------------------------------------------------------------------

describe('parseManifestEntries', () => {
  it('routes /layout entries to layouts', () => {
    const { layouts, pages } = parseManifestEntries({
      '/app/layout': ['a.js'],
      '/app/about/page': ['b.js'],
    });

    assert.deepEqual(Object.keys(layouts), ['/app/layout']);
    assert.deepEqual(Object.keys(pages), ['/app/about/page']);
  });

  it('routes /page entries to pages', () => {
    const { pages } = parseManifestEntries({ '/app/contact/page': ['c.js'] });

    assert.deepEqual(Object.keys(pages), ['/app/contact/page']);
  });

  it('ignores entries ending in neither /layout nor /page', () => {
    const { layouts, pages } = parseManifestEntries({
      '/app/route': ['d.js'],
      '/api/handler': [],
      '/app/loading': ['e.js'],
    });

    assert.deepEqual(Object.keys(layouts), []);
    assert.deepEqual(Object.keys(pages), []);
  });

  it('returns empty objects for empty input', () => {
    const { layouts, pages } = parseManifestEntries({});

    assert.deepEqual(layouts, {});
    assert.deepEqual(pages, {});
  });

  it('handles multiple layouts and pages together', () => {
    const { layouts, pages } = parseManifestEntries({
      '/app/layout': ['a.js'],
      '/app/products/layout': ['b.js'],
      '/app/page': ['c.js'],
      '/app/products/page': ['d.js'],
    });

    assert.deepEqual(Object.keys(layouts).sort(), ['/app/layout', '/app/products/layout']);
    assert.deepEqual(Object.keys(pages).sort(), ['/app/page', '/app/products/page']);
  });
});

// ---------------------------------------------------------------------------
// computeRootLayout
// ---------------------------------------------------------------------------

describe('computeRootLayout', () => {
  beforeEach(() => clearSizeCache());

  it('selects shortest path as root when multiple layouts exist', () => {
    const layouts = {
      '/[locale]/products/layout': [],
      '/[locale]/layout': [],
      '/[locale]/about/deep/layout': [],
    };
    const { rootLayoutPath } = computeRootLayout(
      Object.keys(layouts),
      layouts,
      new Set(),
      testDir,
    );

    assert.equal(rootLayoutPath, '/[locale]/layout');
  });

  it('returns null rootLayoutPath when layoutPaths is empty', () => {
    const { rootLayoutPath, rootLayoutChunks, rootLayoutJs, rootLayoutCss } = computeRootLayout(
      [],
      {},
      new Set(),
      testDir,
    );

    assert.equal(rootLayoutPath, null);
    assert.equal(rootLayoutChunks.size, 0);
    assert.equal(rootLayoutJs, 0);
    assert.equal(rootLayoutCss, 0);
  });

  it('excludes sharedChunks from rootLayoutChunks', () => {
    const layouts = { '/layout': ['shared.js', 'root-layout.js'] };
    const sharedChunks = new Set(['shared.js']);
    const { rootLayoutChunks } = computeRootLayout(
      ['/layout'],
      layouts,
      sharedChunks,
      testDir,
    );

    assert.ok(!rootLayoutChunks.has('shared.js'), 'shared.js should be excluded');
    assert.ok(rootLayoutChunks.has('root-layout.js'), 'root-layout.js should be included');
  });

  it('rootLayoutChunks contains all non-shared layout chunks', () => {
    const layouts = { '/layout': ['root-layout.js', 'route.js'] };
    const { rootLayoutChunks } = computeRootLayout(
      ['/layout'],
      layouts,
      new Set(),
      testDir,
    );

    assert.ok(rootLayoutChunks.has('root-layout.js'));
    assert.ok(rootLayoutChunks.has('route.js'));
    assert.equal(rootLayoutChunks.size, 2);
  });

  it('computes non-zero sizes when real files exist', () => {
    const layouts = { '/layout': ['root-layout.js'] };
    const { rootLayoutJs } = computeRootLayout(
      ['/layout'],
      layouts,
      new Set(),
      testDir,
    );

    assert.ok(rootLayoutJs > 0, `Expected rootLayoutJs > 0, got ${rootLayoutJs}`);
  });
});

// ---------------------------------------------------------------------------
// computeRouteMetrics
// ---------------------------------------------------------------------------

describe('computeRouteMetrics', () => {
  beforeEach(() => clearSizeCache());

  it('firstLoadJs equals firstLoadJs arg when all chunks are non-existent', () => {
    const pages = { '/app/page': [] };
    const routes = computeRouteMetrics(
      pages,
      {},
      new Set(),
      null,
      new Set(),
      100,
      testDir,
    );

    assert.equal(routes['/app/page'].firstLoadJs, 100);
  });

  it('firstLoadJs is greater than firstLoadJs arg when real chunk files exist', () => {
    const pages = { '/app/page': ['route.js', 'route.css'] };
    const routes = computeRouteMetrics(
      pages,
      {},
      new Set(),
      null,
      new Set(),
      0,
      testDir,
    );

    const { js, css, firstLoadJs } = routes['/app/page'];

    assert.ok(js > 0, `js should be > 0 (real file exists), got ${js}`);
    assert.ok(css > 0, `css should be > 0 (real file exists), got ${css}`);
    assert.ok(firstLoadJs > 0, `firstLoadJs should be > 0, got ${firstLoadJs}`);
  });

  it('excludes sharedChunks from route chunk set', () => {
    const pages = { '/app/page': ['shared.js', 'route.js'] };

    // With both chunks in sharedChunks, routeChunks is empty -> js = 0
    const routesAllExcluded = computeRouteMetrics(
      pages,
      {},
      new Set(['shared.js', 'route.js']),
      null,
      new Set(),
      0,
      testDir,
    );

    assert.equal(routesAllExcluded['/app/page'].js, 0, 'All shared chunks excluded -> js = 0');

    clearSizeCache();

    // With no exclusions, real files contribute -> js > 0
    const routesNoneExcluded = computeRouteMetrics(
      pages,
      {},
      new Set(),
      null,
      new Set(),
      0,
      testDir,
    );

    assert.ok(routesNoneExcluded['/app/page'].js > 0, 'No exclusions -> js > 0');
  });

  it('excludes rootLayoutChunks from route chunk set', () => {
    const pages = { '/app/page': ['root-layout.js', 'route.js'] };

    // With both chunks in rootLayoutChunks, routeChunks is empty -> js = 0
    const routesAllExcluded = computeRouteMetrics(
      pages,
      {},
      new Set(),
      null,
      new Set(['root-layout.js', 'route.js']),
      0,
      testDir,
    );

    assert.equal(routesAllExcluded['/app/page'].js, 0, 'All rootLayout chunks excluded -> js = 0');

    clearSizeCache();

    // With no rootLayoutChunks excluded, real files contribute -> js > 0
    const routesNoneExcluded = computeRouteMetrics(
      pages,
      {},
      new Set(),
      null,
      new Set(),
      0,
      testDir,
    );

    assert.ok(routesNoneExcluded['/app/page'].js > 0, 'No exclusions -> js > 0');
  });

  it('includes non-root ancestor layout chunks in route size', () => {
    // Page has no own chunks; non-root ancestor layout contributes product-layout.js
    const pages = { '/[locale]/products/page': [] };
    const layouts = {
      '/[locale]/layout': ['root-layout.js'],
      '/[locale]/products/layout': ['product-layout.js'],
    };
    const rootLayoutChunks = new Set(['root-layout.js']);

    const routes = computeRouteMetrics(
      pages,
      layouts,
      new Set(),
      '/[locale]/layout',
      rootLayoutChunks,
      0,
      testDir,
    );

    assert.ok(
      routes['/[locale]/products/page'].js > 0,
      'Non-root ancestor layout chunk should contribute to route js',
    );
  });

  it('does not include root ancestor layout chunks in route size', () => {
    // Page has no own chunks; root layout has root-layout.js (should be excluded)
    const pages = { '/[locale]/page': [] };
    const layouts = {
      '/[locale]/layout': ['root-layout.js'],
    };
    const rootLayoutChunks = new Set(['root-layout.js']);

    const routes = computeRouteMetrics(
      pages,
      layouts,
      new Set(),
      '/[locale]/layout',
      rootLayoutChunks,
      0,
      testDir,
    );

    assert.equal(
      routes['/[locale]/page'].js,
      0,
      'Root ancestor layout chunks should NOT contribute to route js',
    );
  });

  it('applies round1 to all output values', () => {
    const pages = { '/app/page': [] };
    const routes = computeRouteMetrics(
      pages,
      {},
      new Set(),
      null,
      new Set(),
      1.25,
      testDir,
    );

    // firstLoadJs = round1(1.25 + 0 + 0) = 1.3
    assert.equal(routes['/app/page'].firstLoadJs, 1.3);
    assert.equal(routes['/app/page'].js, 0);
    assert.equal(routes['/app/page'].css, 0);
  });
});

// ---------------------------------------------------------------------------
// compareReport
// The warning sign in the report output is U+26A0 U+FE0F (warning emoji).
// Warning table rows end with "| warning-emoji |" while the footer contains
// the same emoji in a sentence. Use "warning-emoji |" to match only table cells.
// ---------------------------------------------------------------------------

const WARN_EMOJI = '\u26a0\ufe0f'; // ⚠️
const WARN_IN_ROW = `${WARN_EMOJI} |`; // appears only in warning table cells

describe('compareReport', () => {
  function makeReport(overrides = {}) {
    return {
      commitSha: 'abc123',
      updatedAt: '2024-01-01',
      firstLoadJs: 100,
      totalJs: 200,
      totalCss: 10,
      routes: {},
      ...overrides,
    };
  }

  it('shows "No bundle size changes detected." when nothing changed', () => {
    const baseline = makeReport();
    const current = makeReport();
    const report = compareReport(baseline, current);

    assert.ok(report.includes('No bundle size changes detected.'));
    assert.ok(!report.includes('_No route changes detected._'));
    assert.ok(!report.includes('### Per-Route First Load JS'));
  });

  it('shows "No route changes detected." when only global metrics changed', () => {
    // Global metric differs (Case 2) but routes are identical → section shown, no threshold
    const baseline = makeReport({ firstLoadJs: 100, routes: { '/app/page': { firstLoadJs: 100, js: 50, css: 5 } } });
    const current = makeReport({ firstLoadJs: 110, routes: { '/app/page': { firstLoadJs: 100, js: 50, css: 5 } } });
    const report = compareReport(baseline, current);

    assert.ok(report.includes('_No route changes detected._'));
    assert.ok(!report.includes(`Threshold:`));
  });

  it('does not show global metrics table when global metrics are unchanged', () => {
    const baseline = makeReport();
    const current = makeReport();
    const report = compareReport(baseline, current);

    assert.ok(!report.includes('| Metric |'));
  });

  it('shows global metrics table only when metrics changed', () => {
    const baseline = makeReport({ firstLoadJs: 100 });
    const current = makeReport({ firstLoadJs: 115 });
    const report = compareReport(baseline, current);

    assert.ok(report.includes('| Metric |'));
    assert.ok(report.includes('First Load JS'));
  });

  it('shows only the changed global metrics', () => {
    const baseline = makeReport({ firstLoadJs: 100, totalJs: 200, totalCss: 10 });
    const current = makeReport({ firstLoadJs: 100, totalJs: 210, totalCss: 10 });
    const report = compareReport(baseline, current);

    // Use pipe-delimited patterns to match table rows only (not the section header)
    assert.ok(report.includes('| Total JS |'));
    assert.ok(!report.includes('| First Load JS |'));
    assert.ok(!report.includes('| Total CSS |'));
  });

  it('shows NEW row for added route', () => {
    const baseline = makeReport({ routes: {} });
    const current = makeReport({
      routes: { '/app/new/page': { firstLoadJs: 120, js: 60, css: 5 } },
    });
    const report = compareReport(baseline, current);

    assert.ok(report.includes('NEW'));
    assert.ok(report.includes('120 kB'));
  });

  it('shows REMOVED row for deleted route', () => {
    const baseline = makeReport({
      routes: { '/app/old/page': { firstLoadJs: 120, js: 60, css: 5 } },
    });
    const current = makeReport({ routes: {} });
    const report = compareReport(baseline, current);

    assert.ok(report.includes('REMOVED'));
    assert.ok(report.includes('120 kB'));
  });

  it('does not show warning for increase under threshold', () => {
    // delta=3kB, pct=3% < 5% threshold: no warning row
    const baseline = makeReport({ routes: { '/app/page': { firstLoadJs: 100, js: 50, css: 5 } } });
    const current = makeReport({ routes: { '/app/page': { firstLoadJs: 103, js: 53, css: 5 } } });
    const report = compareReport(baseline, current);

    assert.ok(!report.includes(WARN_IN_ROW), 'Should not have a warning table cell');
  });

  it('shows warning for increase over threshold (over 1kB AND over threshold percent)', () => {
    // delta=10kB, pct=10% > 5% threshold: warning row present
    const baseline = makeReport({ routes: { '/app/page': { firstLoadJs: 100, js: 50, css: 5 } } });
    const current = makeReport({ routes: { '/app/page': { firstLoadJs: 110, js: 60, css: 5 } } });
    const report = compareReport(baseline, current);

    assert.ok(report.includes(WARN_IN_ROW), 'Should have a warning table cell');
  });

  it('does not warn when delta is over threshold percent but 1kB or less', () => {
    // delta=0.5kB = 50% but <=1kB: no warning
    const baseline = makeReport({ routes: { '/app/page': { firstLoadJs: 1, js: 1, css: 0 } } });
    const current = makeReport({ routes: { '/app/page': { firstLoadJs: 1.5, js: 1.5, css: 0 } } });
    const report = compareReport(baseline, current);

    assert.ok(!report.includes(WARN_IN_ROW));
  });

  it('does not warn when delta is over 1kB but at or under threshold percent', () => {
    // delta=2kB = 1% < 5% threshold: no warning
    const baseline = makeReport({ routes: { '/app/page': { firstLoadJs: 200, js: 200, css: 0 } } });
    const current = makeReport({ routes: { '/app/page': { firstLoadJs: 202, js: 202, css: 0 } } });
    const report = compareReport(baseline, current);

    assert.ok(!report.includes(WARN_IN_ROW));
  });

  it('respects custom threshold: no warning when under', () => {
    // delta=8kB = 8%, threshold=10: no warning
    const baseline = makeReport({ routes: { '/app/page': { firstLoadJs: 100, js: 50, css: 5 } } });
    const current = makeReport({ routes: { '/app/page': { firstLoadJs: 108, js: 58, css: 5 } } });
    const report = compareReport(baseline, current, { threshold: 10 });

    assert.ok(!report.includes(WARN_IN_ROW));
  });

  it('respects custom threshold: warning when over', () => {
    // delta=8kB = 8%, threshold=3: warning
    const baseline = makeReport({ routes: { '/app/page': { firstLoadJs: 100, js: 50, css: 5 } } });
    const current = makeReport({ routes: { '/app/page': { firstLoadJs: 108, js: 58, css: 5 } } });
    const report = compareReport(baseline, current, { threshold: 3 });

    assert.ok(report.includes(WARN_IN_ROW));
  });

  it('uses default threshold of 5 percent when not specified', () => {
    // delta=6kB = 6% > 5%: warning with default
    const baseline = makeReport({ routes: { '/app/page': { firstLoadJs: 100, js: 100, css: 0 } } });
    const current = makeReport({ routes: { '/app/page': { firstLoadJs: 106, js: 106, css: 0 } } });
    const report = compareReport(baseline, current);

    assert.ok(report.includes(WARN_IN_ROW));
    assert.ok(report.includes('Threshold: 5%'));
  });

  it('shows threshold in footer only when route changes are present', () => {
    // Route changed: threshold callout shown
    const baseline = makeReport({ routes: { '/app/page': { firstLoadJs: 100, js: 50, css: 5 } } });
    const current = makeReport({ routes: { '/app/page': { firstLoadJs: 110, js: 60, css: 5 } } });
    const report = compareReport(baseline, current, { threshold: 7 });

    assert.ok(report.includes('Threshold: 7%'));
  });

  it('omits threshold footer when there are no route changes', () => {
    // Global metrics differ but routes are identical — no threshold callout
    const baseline = makeReport({ firstLoadJs: 100 });
    const current = makeReport({ firstLoadJs: 115 });
    const report = compareReport(baseline, current);

    assert.ok(!report.includes('Threshold:'));
  });

  it('formats positive delta with + sign and percent', () => {
    const baseline = makeReport({ routes: { '/app/page': { firstLoadJs: 100, js: 50, css: 5 } } });
    const current = makeReport({ routes: { '/app/page': { firstLoadJs: 110, js: 60, css: 5 } } });
    const report = compareReport(baseline, current);

    assert.ok(report.includes('+10 kB'));
    assert.ok(report.includes('+10%'));
  });

  it('formats negative delta with minus sign and percent', () => {
    const baseline = makeReport({ routes: { '/app/page': { firstLoadJs: 100, js: 50, css: 5 } } });
    const current = makeReport({ routes: { '/app/page': { firstLoadJs: 90, js: 40, css: 5 } } });
    const report = compareReport(baseline, current);

    assert.ok(report.includes('-10 kB'));
    assert.ok(report.includes('-10%'));
  });

  it('sorts routes alphabetically', () => {
    const makeRoute = (v: number) => ({ firstLoadJs: v, js: v, css: 0 });
    const baseline = makeReport({
      routes: {
        '/z/page': makeRoute(100),
        '/a/page': makeRoute(100),
        '/m/page': makeRoute(100),
      },
    });
    const current = makeReport({
      routes: {
        '/z/page': makeRoute(110),
        '/a/page': makeRoute(110),
        '/m/page': makeRoute(110),
      },
    });
    const report = compareReport(baseline, current);

    const aIdx = report.indexOf('/a/page');
    const mIdx = report.indexOf('/m/page');
    const zIdx = report.indexOf('/z/page');

    assert.ok(aIdx < mIdx, '/a should appear before /m');
    assert.ok(mIdx < zIdx, '/m should appear before /z');
  });

  it('strips the /[locale] prefix from display names', () => {
    const baseline = makeReport({ routes: {} });
    const current = makeReport({
      routes: { '/[locale]/products/page': { firstLoadJs: 120, js: 60, css: 5 } },
    });
    const report = compareReport(baseline, current);

    assert.ok(report.includes('/products/page'), 'Should show /products/page (locale stripped)');
    assert.ok(
      !report.includes('/[locale]/products/page'),
      'Should not show /[locale] prefix',
    );
  });

  it('omits near-zero deltas that round to 0.0', () => {
    // 0.04kB delta rounds to 0.0: treated as no change
    const baseline = makeReport({
      routes: { '/app/page': { firstLoadJs: 100.04, js: 50, css: 5 } },
    });
    const current = makeReport({
      routes: { '/app/page': { firstLoadJs: 100.04, js: 50, css: 5 } },
    });
    const report = compareReport(baseline, current);

    assert.ok(report.includes('No bundle size changes detected.'));
  });

  it('shows Per-Route First Load JS section when there are route changes', () => {
    const baseline = makeReport({ routes: { '/app/page': { firstLoadJs: 100, js: 50, css: 0 } } });
    const current = makeReport({ routes: { '/app/page': { firstLoadJs: 110, js: 60, css: 0 } } });
    const report = compareReport(baseline, current);

    assert.ok(report.includes('### Per-Route First Load JS'));
  });

  it('omits Per-Route First Load JS section when nothing changed', () => {
    const baseline = makeReport();
    const current = makeReport();
    const report = compareReport(baseline, current);

    assert.ok(!report.includes('### Per-Route First Load JS'));
  });

  it('shows header with baseline commitSha and updatedAt', () => {
    const baseline = makeReport({ commitSha: 'deadbeef', updatedAt: '2024-06-15' });
    const current = makeReport();
    const report = compareReport(baseline, current);

    assert.ok(report.includes('`deadbeef`'));
    assert.ok(report.includes('2024-06-15'));
  });

  it('shows "No bundle size changes detected." for empty routes in both reports', () => {
    const baseline = makeReport({ routes: {} });
    const current = makeReport({ routes: {} });
    const report = compareReport(baseline, current);

    assert.ok(report.includes('No bundle size changes detected.'));
  });

  it('shows table header when routes have changes', () => {
    const baseline = makeReport({ routes: { '/app/page': { firstLoadJs: 100, js: 50, css: 0 } } });
    const current = makeReport({ routes: { '/app/page': { firstLoadJs: 110, js: 60, css: 0 } } });
    const report = compareReport(baseline, current);

    assert.ok(report.includes('| Route |'));
    assert.ok(report.includes('| Baseline |'));
    assert.ok(report.includes('| Current |'));
  });
});

// ---------------------------------------------------------------------------
// readTurbopackEntries
// ---------------------------------------------------------------------------

describe('readTurbopackEntries', () => {
  // Helper: create a minimal _client-reference-manifest.js fixture
  function makeManifestContent(
    routes: Record<string, Record<string, { chunks: string[] }>>,
  ): string {
    const manifest: Record<string, { clientModules: Record<string, { chunks: string[] }> }> = {};

    for (const [routeKey, modules] of Object.entries(routes)) {
      manifest[routeKey] = { clientModules: modules };
    }

    return `globalThis.__RSC_MANIFEST = ${JSON.stringify(manifest)};`;
  }

  it('reads chunk paths from a single manifest and normalizes /_next/ prefix', () => {
    const dir = join(testDir, `turbopack-basic-${Date.now()}`);

    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'page_client-reference-manifest.js'),
      makeManifestContent({
        '/products/page': {
          'mod-a': { chunks: ['/_next/static/chunks/a.js'] },
          'mod-b': { chunks: ['/_next/static/chunks/b.js'] },
        },
      }),
    );

    const entries = readTurbopackEntries(dir);

    assert.ok(entries['/products/page'], 'should have /products/page entry');
    assert.ok(entries['/products/page'].includes('static/chunks/a.js'), 'should normalize /_next/ prefix');
    assert.ok(entries['/products/page'].includes('static/chunks/b.js'));
    assert.ok(!entries['/products/page'].some((c) => c.startsWith('/_next/')), 'no chunk should start with /_next/');
  });

  it('filters out non-/page routes (layouts, route handlers)', () => {
    const dir = join(testDir, `turbopack-filter-${Date.now()}`);

    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'page_client-reference-manifest.js'),
      makeManifestContent({
        '/app/layout': { 'mod-a': { chunks: ['/_next/static/chunks/layout.js'] } },
        '/app/route': { 'mod-b': { chunks: ['/_next/static/chunks/route.js'] } },
        '/app/page': { 'mod-c': { chunks: ['/_next/static/chunks/page.js'] } },
      }),
    );

    const entries = readTurbopackEntries(dir);

    assert.ok(entries['/app/page'], 'should include /page route');
    assert.ok(!entries['/app/layout'], 'should exclude /layout route');
    assert.ok(!entries['/app/route'], 'should exclude /route handler');
  });

  it('deduplicates chunks appearing in multiple modules', () => {
    const dir = join(testDir, `turbopack-dedup-${Date.now()}`);

    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'page_client-reference-manifest.js'),
      makeManifestContent({
        '/shop/page': {
          'mod-a': { chunks: ['/_next/static/chunks/shared.js', '/_next/static/chunks/a.js'] },
          'mod-b': { chunks: ['/_next/static/chunks/shared.js', '/_next/static/chunks/b.js'] },
        },
      }),
    );

    const entries = readTurbopackEntries(dir);
    const chunks = entries['/shop/page'];

    assert.ok(chunks, 'should have /shop/page entry');

    const sharedCount = chunks.filter((c) => c === 'static/chunks/shared.js').length;

    assert.equal(sharedCount, 1, 'shared chunk should appear exactly once');
    assert.equal(chunks.length, 3, 'should have 3 unique chunks');
  });

  it('scans subdirectories recursively', () => {
    const dir = join(testDir, `turbopack-recursive-${Date.now()}`);

    mkdirSync(join(dir, 'nested', 'deep'), { recursive: true });
    writeFileSync(
      join(dir, 'nested', 'deep', 'page_client-reference-manifest.js'),
      makeManifestContent({
        '/nested/deep/page': { 'mod-a': { chunks: ['/_next/static/chunks/deep.js'] } },
      }),
    );

    const entries = readTurbopackEntries(dir);

    assert.ok(entries['/nested/deep/page'], 'should find manifest in nested directory');
  });

  it('skips malformed manifest files gracefully', () => {
    const dir = join(testDir, `turbopack-malformed-${Date.now()}`);

    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'bad_client-reference-manifest.js'), 'this is not valid JS {{{');
    writeFileSync(
      join(dir, 'good_client-reference-manifest.js'),
      makeManifestContent({
        '/valid/page': { 'mod-a': { chunks: ['/_next/static/chunks/valid.js'] } },
      }),
    );

    // Should not throw, and should still return valid entries
    assert.doesNotThrow(() => readTurbopackEntries(dir));

    const entries = readTurbopackEntries(dir);

    assert.ok(entries['/valid/page'], 'should return valid entries even when another file is malformed');
  });

  it('returns empty object when no manifest files exist', () => {
    const dir = join(testDir, `turbopack-empty-${Date.now()}`);

    mkdirSync(dir, { recursive: true });

    const entries = readTurbopackEntries(dir);

    assert.deepEqual(entries, {});
  });

  it('returns empty object when manifests have no __RSC_MANIFEST', () => {
    const dir = join(testDir, `turbopack-no-rsc-${Date.now()}`);

    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'page_client-reference-manifest.js'),
      'globalThis.somethingElse = {};',
    );

    const entries = readTurbopackEntries(dir);

    assert.deepEqual(entries, {});
  });
});

// ---------------------------------------------------------------------------
// getGzipSize
// ---------------------------------------------------------------------------

describe('getGzipSize', () => {
  beforeEach(() => clearSizeCache());

  it('returns 0 when file does not exist', () => {
    const result = getGzipSize(join(testDir, 'nonexistent-file-xyz.js'));

    assert.equal(result, 0);
  });

  it('returns a positive number for an existing file', () => {
    const result = getGzipSize(join(testDir, 'route.js'));

    assert.ok(result > 0, `Expected positive size, got ${result}`);
  });

  it('caches results and returns same value on second call', () => {
    const filePath = join(testDir, `cache-test-${Date.now()}.js`);

    writeFileSync(filePath, makeJs('cached'));

    const firstResult = getGzipSize(filePath);

    assert.ok(firstResult > 0);

    // Delete the file — the cached value should still be returned
    unlinkSync(filePath);

    const secondResult = getGzipSize(filePath);

    assert.equal(secondResult, firstResult, 'Should return cached value after file deletion');
  });

  it('clearSizeCache resets the cache', () => {
    const filePath = join(testDir, `clear-test-${Date.now()}.js`);

    writeFileSync(filePath, makeJs('cleared'));

    const sizeBeforeDelete = getGzipSize(filePath);

    assert.ok(sizeBeforeDelete > 0);

    unlinkSync(filePath);
    clearSizeCache();

    // After clearing cache, file is gone so size should be 0
    const sizeAfterClear = getGzipSize(filePath);

    assert.equal(sizeAfterClear, 0, 'Should return 0 after cache cleared and file deleted');
  });
});
