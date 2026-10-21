import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { compareResults, dropBlockedRoutes, hasBlockedRequests } from '../compare-unlighthouse.mts';
import type { CiResult } from '../compare-unlighthouse.mts';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const DEFAULT_METRICS: CiResult['summary']['metrics'] = {
  'largest-contentful-paint': { displayValue: '2.5 s' },
  'cumulative-layout-shift': { displayValue: '0.01' },
  'first-contentful-paint': { displayValue: '1.2 s' },
  'total-blocking-time': { displayValue: '100 ms' },
  'max-potential-fid': { displayValue: '200 ms' },
  interactive: { displayValue: '3.5 s' },
};

function makeCiResult(overrides: {
  score?: number;
  performance?: number;
  accessibility?: number;
  'best-practices'?: number;
  seo?: number;
  metrics?: CiResult['summary']['metrics'];
} = {}): CiResult {
  return {
    summary: {
      score: overrides.score ?? 0.85,
      categories: {
        performance: { score: overrides.performance ?? 0.80 },
        accessibility: { score: overrides.accessibility ?? 0.92 },
        'best-practices': { score: overrides['best-practices'] ?? 1.0 },
        seo: { score: overrides.seo ?? 0.90 },
      },
      metrics: overrides.metrics ?? { ...DEFAULT_METRICS },
    },
  };
}

const BASE = makeCiResult();

// ---------------------------------------------------------------------------
// Route-level checks
// ---------------------------------------------------------------------------

interface RouteFixture {
  path: string;
  performance?: number;
  accessibility?: number | null;
  seo?: number;
  'best-practices'?: number;
}

function withRoutes(
  routes: RouteFixture[],
  overrides: Parameters<typeof makeCiResult>[0] = {},
): CiResult {
  return {
    ...makeCiResult(overrides),
    routes: routes.map((route) => ({
      path: route.path,
      categories: {
        performance: { score: route.performance ?? 0.8 },
        accessibility: { score: route.accessibility === undefined ? 0.95 : route.accessibility },
        'best-practices': { score: route['best-practices'] ?? 1 },
        seo: { score: route.seo ?? 1 },
      },
    })),
  };
}

const ROUTES = withRoutes([{ path: '/' }, { path: '/cart/' }]);

describe('failed', () => {
  it('is false when every route matches', () => {
    const { failed, markdown } = compareResults(ROUTES, ROUTES, ROUTES, ROUTES);

    assert.equal(failed, false);
    assert.ok(markdown.includes('No regressions found.'));
  });

  it('is true when accessibility drops on a matched route', () => {
    const preview = withRoutes([{ path: '/' }, { path: '/cart/', accessibility: 0.91 }]);
    const { failed, markdown } = compareResults(ROUTES, ROUTES, preview, ROUTES);

    assert.equal(failed, true);
    assert.ok(markdown.includes('### ❌ Accessibility, SEO, and best practices regressions'));
    assert.ok(markdown.includes('| `/cart/` | Desktop | Accessibility | 95 | 91 |'));
  });

  it('is true when best practices drops on a matched route', () => {
    const preview = withRoutes([{ path: '/' }, { path: '/cart/', 'best-practices': 0.95 }]);
    const { failed, markdown } = compareResults(ROUTES, ROUTES, preview, ROUTES);

    assert.equal(failed, true);
    assert.ok(markdown.includes('| `/cart/` | Desktop | Best Practices | 100 | 95 |'));
  });

  it('is true when SEO drops on a matched route', () => {
    const preview = withRoutes([{ path: '/', seo: 0.92 }, { path: '/cart/' }]);
    const { failed, markdown } = compareResults(ROUTES, ROUTES, ROUTES, preview);

    assert.equal(failed, true);
    assert.ok(markdown.includes('| `/` | Mobile | SEO | 100 | 92 |'));
  });

  it('ignores improvements', () => {
    const preview = withRoutes([{ path: '/', accessibility: 0.99 }, { path: '/cart/' }]);

    assert.equal(compareResults(ROUTES, ROUTES, preview, ROUTES).failed, false);
  });

  it('ignores sub-point differences that round to the same score', () => {
    const preview = withRoutes([{ path: '/', accessibility: 0.9499 }, { path: '/cart/' }]);

    assert.equal(compareResults(ROUTES, ROUTES, preview, ROUTES).failed, false);
  });

  it('ignores summary score drops when routes match', () => {
    const preview = withRoutes([{ path: '/' }, { path: '/cart/' }], {
      score: 0.5,
      accessibility: 0.5,
      performance: 0.2,
    });

    assert.equal(compareResults(ROUTES, ROUTES, preview, ROUTES).failed, false);
  });

  it('is true when fewer than half the expected routes are compared', () => {
    const { failed, markdown } = compareResults(ROUTES, ROUTES, ROUTES, ROUTES, {
      expectedRoutes: ['/', '/cart/', '/login/', '/register/', '/blog/'],
    });

    assert.equal(failed, true);
    assert.ok(markdown.includes('### ❌ Incomplete scans'));
    assert.ok(markdown.includes('Desktop: only 2 of 5 routes could be compared'));
  });

  it('is true when a route has no score', () => {
    const preview = withRoutes([{ path: '/', accessibility: null }, { path: '/cart/' }]);
    const { failed, markdown } = compareResults(ROUTES, ROUTES, preview, ROUTES);

    assert.equal(failed, true);
    assert.ok(markdown.includes('Deployment desktop: `/` has no accessibility score'));
  });

  it('is true when a scan has no routes', () => {
    assert.equal(compareResults(BASE, BASE, BASE, BASE).failed, true);
  });
});

describe('performance', () => {
  const PROD = withRoutes([
    { path: '/a/', performance: 0.9 },
    { path: '/b/', performance: 0.9 },
    { path: '/c/', performance: 0.9 },
  ]);

  it('is true when the median route drops by the threshold on both devices', () => {
    const preview = withRoutes([
      { path: '/a/', performance: 0.7 },
      { path: '/b/', performance: 0.75 },
      { path: '/c/', performance: 0.9 },
    ]);
    const { failed, markdown } = compareResults(PROD, PROD, preview, preview);

    assert.equal(failed, true);
    assert.ok(markdown.includes('### ❌ Performance regression'));
    assert.ok(markdown.includes('lost 15 points on desktop and 15 on mobile'));
  });

  it('ignores a single slow route', () => {
    const preview = withRoutes([
      { path: '/a/', performance: 0.3 },
      { path: '/b/', performance: 0.88 },
      { path: '/c/', performance: 0.9 },
    ]);

    assert.equal(compareResults(PROD, PROD, preview, preview).failed, false);
  });

  it('ignores a drop on only one device', () => {
    const slow = withRoutes([
      { path: '/a/', performance: 0.5 },
      { path: '/b/', performance: 0.5 },
      { path: '/c/', performance: 0.5 },
    ]);

    assert.equal(compareResults(PROD, PROD, slow, PROD).failed, false);
  });

  it('respects a custom threshold', () => {
    const preview = withRoutes([
      { path: '/a/', performance: 0.85 },
      { path: '/b/', performance: 0.85 },
      { path: '/c/', performance: 0.85 },
    ]);

    assert.equal(compareResults(PROD, PROD, preview, preview).failed, false);
    assert.equal(
      compareResults(PROD, PROD, preview, preview, { performanceThreshold: 5 }).failed,
      true,
    );
  });

  it('reports the median change in the details', () => {
    const preview = withRoutes([
      { path: '/a/', performance: 0.88 },
      { path: '/b/', performance: 0.92 },
      { path: '/c/', performance: 0.9 },
    ]);
    const { markdown } = compareResults(PROD, PROD, preview, PROD);

    assert.ok(markdown.includes('| 0 | 0 |'));
  });
});

describe('details', () => {
  it('lists routes that could not be compared without failing', () => {
    const routes = withRoutes([{ path: '/' }, { path: '/cart/' }, { path: '/blog/' }]);
    const preview = withRoutes([{ path: '/' }, { path: '/blog/' }]);
    const { failed, markdown } = compareResults(routes, routes, routes, preview, {
      expectedRoutes: ['/', '/cart/', '/blog/', '/login/'],
    });

    assert.equal(failed, false);
    assert.ok(markdown.includes('### Routes not compared'));
    assert.ok(markdown.includes('| `/cart/` | Mobile | failed on this deployment |'));
    assert.ok(markdown.includes('| `/login/` | Desktop | failed on both |'));
  });

  it('keeps everything except failures inside the collapsed section', () => {
    const routes = withRoutes([{ path: '/' }, { path: '/cart/' }, { path: '/blog/' }]);
    const preview = withRoutes([{ path: '/' }, { path: '/blog/' }]);
    const { markdown } = compareResults(routes, routes, preview, routes);

    assert.ok(markdown.indexOf('<details>') < markdown.indexOf('### Routes not compared'));
  });
});

// ---------------------------------------------------------------------------
// Report heading
// ---------------------------------------------------------------------------

describe('report heading', () => {
  it('contains the comparison heading', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE);

    assert.ok(
      markdown.includes('## Unlighthouse Comparison'),
      'Missing main heading',
    );
  });

  it('contains the description text', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE);

    assert.ok(
      markdown.includes(
        "Comparing this deployment's Unlighthouse scores against the baseline deployment.",
      ),
    );
  });

  it('names the baseline when a label is given', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, {
      baselineLabel: 'canary at 1a2b3c4d5',
    });

    assert.ok(markdown.includes('against canary at 1a2b3c4d5.'));
  });
});

// ---------------------------------------------------------------------------
// Summary Score section
// ---------------------------------------------------------------------------

describe('Summary Score section', () => {
  it('contains the Summary Score heading', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE);

    assert.ok(markdown.includes('### Summary Score'));
  });

  it('contains the aggregate score note', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE);

    assert.ok(
      markdown.includes(
        "Averages across the routes both scans reported, so a route that failed on one side doesn't skew them.",
      ),
    );
  });

  it('renders scores as integers on a 1-100 scale', () => {
    const prod = makeCiResult({ score: 0.85 });
    const prev = makeCiResult({ score: 0.72 });
    const { markdown } = compareResults(prod, prod, prev, prev);

    assert.ok(markdown.includes('| Score | 85 | 85 | 72 | 72 |'));
  });

  it('rounds fractional scores correctly', () => {
    const prod = makeCiResult({ score: 0.856 }); // rounds to 86
    const { markdown } = compareResults(prod, BASE, prod, BASE);

    assert.ok(markdown.includes('86'), 'Score 0.856 should round to 86');
  });

  it('contains the four-column header', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE);

    assert.ok(
      markdown.includes('| | Before Desktop | Before Mobile | After Desktop | After Mobile |'),
    );
  });
});

// ---------------------------------------------------------------------------
// Category Scores section
// ---------------------------------------------------------------------------

describe('Category Scores section', () => {
  it('contains the Category Scores heading', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE);

    assert.ok(markdown.includes('### Category Scores'));
  });

  it('renders all four categories', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE);

    assert.ok(markdown.includes('Performance'));
    assert.ok(markdown.includes('Accessibility'));
    assert.ok(markdown.includes('Best Practices'));
    assert.ok(markdown.includes('SEO'));
  });

  it('renders category scores as integers on a 1-100 scale', () => {
    const prod = makeCiResult({ performance: 0.80 });
    const prev = makeCiResult({ performance: 0.93 });
    const { markdown } = compareResults(prod, prod, prev, prev);

    assert.ok(
      markdown.includes('| Performance | 80 | 80 | 93 | 93 |'),
      'Performance row should contain all four scores as integers',
    );
  });

  it('shows all four column values independently', () => {
    const prodDesktop = makeCiResult({ seo: 0.88 });
    const prodMobile = makeCiResult({ seo: 0.75 });
    const prevDesktop = makeCiResult({ seo: 0.91 });
    const prevMobile = makeCiResult({ seo: 0.82 });
    const { markdown } = compareResults(prodDesktop, prodMobile, prevDesktop, prevMobile);

    assert.ok(markdown.includes('| SEO | 88 | 75 | 91 | 82 |'));
  });
});

// ---------------------------------------------------------------------------
// Core Web Vitals section
// ---------------------------------------------------------------------------

describe('summary averages', () => {
  it('averages only routes both scans reported', () => {
    const baseline = withRoutes([
      { path: '/', accessibility: 0.9 },
      { path: '/cart/', accessibility: 0.9 },
      { path: '/login/', accessibility: 1 },
    ]);
    const deployment = withRoutes([
      { path: '/', accessibility: 0.9 },
      { path: '/cart/', accessibility: 0.9 },
    ]);
    const { markdown } = compareResults(baseline, baseline, deployment, deployment);

    assert.ok(markdown.includes('| Accessibility | 90 | 90 | 90 | 90 |'));
  });

  it('prefers averageScore over the last route score', () => {
    const ci = makeCiResult();
    ci.summary.categories.accessibility = { score: 1, averageScore: 0.96 };
    const { markdown } = compareResults(ci, ci, ci, ci);

    assert.ok(markdown.includes('| Accessibility | 96 | 96 | 96 | 96 |'));
  });

  it('formats averageNumericValue instead of the last route displayValue', () => {
    const ci = makeCiResult({
      metrics: {
        ...DEFAULT_METRICS,
        'largest-contentful-paint': { displayValue: '9.9 s', averageNumericValue: 3456 },
        'total-blocking-time': { displayValue: '999 ms', averageNumericValue: 12.6 },
        'cumulative-layout-shift': { displayValue: '0.5', averageNumericValue: 0.01234 },
      },
    });
    const { markdown } = compareResults(ci, ci, ci, ci);

    assert.ok(markdown.includes('| LCP | 3.5 s | 3.5 s | 3.5 s | 3.5 s |'));
    assert.ok(markdown.includes('| TBT | 13 ms | 13 ms | 13 ms | 13 ms |'));
    assert.ok(markdown.includes('| CLS | 0.012 | 0.012 | 0.012 | 0.012 |'));
  });
});

describe('Core Web Vitals section', () => {
  it('contains the Core Web Vitals heading', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE);

    assert.ok(markdown.includes('### Core Web Vitals'));
  });

  it('renders all six metrics', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE);

    assert.ok(markdown.includes('LCP'));
    assert.ok(markdown.includes('CLS'));
    assert.ok(markdown.includes('FCP'));
    assert.ok(markdown.includes('TBT'));
    assert.ok(markdown.includes('Max Potential FID'));
    assert.ok(markdown.includes('Time to Interactive'));
  });

  it('passes displayValue through unchanged', () => {
    const ci = makeCiResult({
      metrics: {
        ...DEFAULT_METRICS,
        'largest-contentful-paint': { displayValue: '4.8 s' },
      },
    });
    const { markdown } = compareResults(ci, ci, ci, ci);

    assert.ok(markdown.includes('4.8 s'), 'displayValue should appear as-is');
  });

  it('shows — for a metric missing from a result', () => {
    const ciMissingMetric = makeCiResult({ metrics: {} });
    const { markdown } = compareResults(BASE, ciMissingMetric, BASE, BASE);

    assert.ok(markdown.includes('—'), 'Missing metric should show —');
  });

  it('shows four displayValues per metric row', () => {
    const prodDesktop = makeCiResult({ metrics: { ...DEFAULT_METRICS, 'total-blocking-time': { displayValue: '80 ms' } } });
    const prodMobile = makeCiResult({ metrics: { ...DEFAULT_METRICS, 'total-blocking-time': { displayValue: '320 ms' } } });
    const prevDesktop = makeCiResult({ metrics: { ...DEFAULT_METRICS, 'total-blocking-time': { displayValue: '75 ms' } } });
    const prevMobile = makeCiResult({ metrics: { ...DEFAULT_METRICS, 'total-blocking-time': { displayValue: '310 ms' } } });
    const { markdown } = compareResults(prodDesktop, prodMobile, prevDesktop, prevMobile);

    assert.ok(markdown.includes('| TBT | 80 ms | 320 ms | 75 ms | 310 ms |'));
  });
});

// ---------------------------------------------------------------------------
// Blocked requests
// ---------------------------------------------------------------------------

function lighthouseResult(requests: { url: string; statusCode: number }[]) {
  return {
    finalDisplayedUrl: 'https://store.example/blog/',
    audits: { 'network-requests': { details: { items: requests } } },
  };
}

describe('hasBlockedRequests', () => {
  it('is true when a request to the deployment got a 403', () => {
    const result = lighthouseResult([
      { url: 'https://store.example/blog/', statusCode: 200 },
      { url: 'https://store.example/_next/static/css/app.css', statusCode: 403 },
    ]);

    assert.equal(hasBlockedRequests(result), true);
  });

  it('is true when a request to the deployment got a 429', () => {
    const result = lighthouseResult([{ url: 'https://store.example/font.woff2', statusCode: 429 }]);

    assert.equal(hasBlockedRequests(result), true);
  });

  it('ignores blocked third-party requests', () => {
    const result = lighthouseResult([
      { url: 'https://store.example/blog/', statusCode: 200 },
      { url: 'https://www.google-analytics.com/collect', statusCode: 403 },
      { url: 'https://store.example.evil.test/app.css', statusCode: 403 },
    ]);

    assert.equal(hasBlockedRequests(result), false);
  });

  it('ignores other error codes', () => {
    const result = lighthouseResult([{ url: 'https://store.example/missing.png', statusCode: 404 }]);

    assert.equal(hasBlockedRequests(result), false);
  });
});

describe('dropBlockedRoutes', () => {
  function writeReport(dir: string, result: object) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'lighthouse.html'),
      `<html><script>window.__LIGHTHOUSE_JSON__ = ${JSON.stringify(result)};</script></html>`,
    );
  }

  it('drops routes whose report has blocked requests, including the root route', () => {
    const reports = mkdtempSync(join(tmpdir(), 'unlighthouse-reports-'));
    const blocked = [{ url: 'https://store.example/app.css', statusCode: 403 }];

    writeReport(reports, lighthouseResult(blocked));
    writeReport(join(reports, 'blog'), lighthouseResult(blocked));
    writeReport(join(reports, 'cart'), lighthouseResult([]));

    const result = withRoutes([{ path: '/' }, { path: '/blog/' }, { path: '/cart/' }, { path: '/login/' }]);
    const paths = dropBlockedRoutes(result, reports).routes?.map((route) => route.path);

    assert.deepEqual(paths, ['/cart/', '/login/']);
  });
});
