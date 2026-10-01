import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { compareResults } from '../compare-unlighthouse.mts';
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

function withRoutes(
  routes: { path: string; accessibility?: number | null; seo?: number; 'best-practices'?: number }[],
  overrides: Parameters<typeof makeCiResult>[0] = {},
): CiResult {
  return {
    ...makeCiResult(overrides),
    routes: routes.map((route) => ({
      path: route.path,
      categories: {
        performance: { score: 0.8 },
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
    const result = compareResults(ROUTES, ROUTES, ROUTES, ROUTES);

    assert.equal(result.failed, false);
    assert.deepEqual(result.warnings, []);
    assert.ok(result.markdown.includes('No regressions found.'));
  });

  it('is true when accessibility drops on a matched route', () => {
    const preview = withRoutes([{ path: '/' }, { path: '/cart/', accessibility: 0.91 }]);
    const { failed, markdown } = compareResults(ROUTES, ROUTES, preview, ROUTES);

    assert.equal(failed, true);
    assert.ok(markdown.includes('### ❌ Accessibility regressions'));
    assert.ok(markdown.includes('| `/cart/` | Desktop | Accessibility | 95 | 91 |'));
  });

  it('ignores accessibility improvements', () => {
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
    });

    assert.equal(compareResults(ROUTES, ROUTES, preview, ROUTES).failed, false);
  });

  it('is true when a route is missing from one side', () => {
    const preview = withRoutes([{ path: '/' }]);
    const { failed, markdown } = compareResults(ROUTES, ROUTES, ROUTES, preview);

    assert.equal(failed, true);
    assert.ok(markdown.includes('### ❌ Incomplete scans'));
    assert.ok(markdown.includes('Preview mobile: `/cart/` is missing'));
  });

  it('is true when a route has no score', () => {
    const preview = withRoutes([{ path: '/', accessibility: null }, { path: '/cart/' }]);
    const { failed, markdown } = compareResults(ROUTES, ROUTES, preview, ROUTES);

    assert.equal(failed, true);
    assert.ok(markdown.includes('Preview desktop: `/` has no accessibility score'));
  });

  it('is true when a scan has fewer routes than minRoutes', () => {
    const { failed, markdown } = compareResults(ROUTES, ROUTES, ROUTES, ROUTES, {
      minRoutes: 3,
    });

    assert.equal(failed, true);
    assert.ok(markdown.includes('scanned 2 route(s), expected at least 3'));
  });

  it('is true when a scan has no routes', () => {
    assert.equal(compareResults(BASE, BASE, BASE, BASE).failed, true);
  });
});

describe('warnings', () => {
  it('warns without failing when SEO drops on a matched route', () => {
    const preview = withRoutes([{ path: '/', seo: 0.88 }, { path: '/cart/' }]);
    const { failed, warnings, markdown } = compareResults(ROUTES, ROUTES, ROUTES, preview);

    assert.equal(failed, false);
    assert.deepEqual(warnings, ['SEO dropped on / (mobile): 100 → 88']);
    assert.ok(markdown.includes('### ⚠️ SEO and best practices drops'));
  });

  it('warns when best practices drops on a matched route', () => {
    const preview = withRoutes([{ path: '/' }, { path: '/cart/', 'best-practices': 0.95 }]);
    const { warnings } = compareResults(ROUTES, ROUTES, preview, ROUTES);

    assert.deepEqual(warnings, ['Best Practices dropped on /cart/ (desktop): 100 → 95']);
  });

  it('warns when performance drops by the threshold', () => {
    const prod = withRoutes([{ path: '/' }], { performance: 0.9 });
    const preview = withRoutes([{ path: '/' }], { performance: 0.8 });
    const { failed, warnings } = compareResults(prod, prod, preview, prod);

    assert.equal(failed, false);
    assert.deepEqual(warnings, ['Performance on desktop dropped by 10+ points']);
  });

  it('does not warn when performance drops by less than the threshold', () => {
    const prod = withRoutes([{ path: '/' }], { performance: 0.9 });
    const preview = withRoutes([{ path: '/' }], { performance: 0.81 });

    assert.deepEqual(compareResults(prod, prod, preview, prod).warnings, []);
  });

  it('respects a custom performance threshold', () => {
    const prod = withRoutes([{ path: '/' }], { performance: 0.9 });
    const preview = withRoutes([{ path: '/' }], { performance: 0.85 });

    assert.deepEqual(
      compareResults(prod, prod, preview, prod, { performanceThreshold: 5 }).warnings,
      ['Performance on desktop dropped by 5+ points'],
    );
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

  it('appends provider label when provider is given', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, { provider: 'vercel' });

    assert.ok(
      markdown.includes('## Unlighthouse Comparison — Vercel'),
      'Missing provider label in heading',
    );
  });

  it('capitalises the provider label', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, { provider: 'cloudflare' });

    assert.ok(markdown.includes('— Cloudflare'), 'Provider should be capitalised');
  });

  it('omits provider label when none provided', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE);

    assert.ok(
      !markdown.includes(' — '),
      'Should not contain a provider label separator',
    );
  });

  it('contains the description text', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE);

    assert.ok(
      markdown.includes(
        'Comparing PR preview deployment Unlighthouse scores vs production Unlighthouse scores.',
      ),
    );
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
        'Aggregate score across all categories as reported by Unlighthouse.',
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
      markdown.includes('| | Prod Desktop | Prod Mobile | Preview Desktop | Preview Mobile |'),
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
