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
// hasChanges
// ---------------------------------------------------------------------------

describe('hasChanges', () => {
  it('is false when all four results are identical', () => {
    const { hasChanges } = compareResults(BASE, BASE, BASE, BASE, 1);

    assert.equal(hasChanges, false);
  });

  it('is true when preview desktop summary score differs by exactly 1pp', () => {
    const preview = makeCiResult({ score: 0.84 }); // 1pp below
    const { hasChanges } = compareResults(BASE, BASE, preview, BASE, 1);

    assert.equal(hasChanges, true);
  });

  it('is false when summary score differs by less than 1pp', () => {
    const preview = makeCiResult({ score: 0.855 }); // 0.5pp above
    const { hasChanges } = compareResults(BASE, BASE, preview, BASE, 1);

    assert.equal(hasChanges, false);
  });

  it('is true when preview mobile summary score differs by >= 1pp', () => {
    const previewMobile = makeCiResult({ score: 0.74 });
    const { hasChanges } = compareResults(BASE, BASE, BASE, previewMobile, 1);

    assert.equal(hasChanges, true);
  });

  it('is true when a category score differs by >= 1pp', () => {
    const preview = makeCiResult({ performance: 0.79 }); // 1pp below 0.80
    const { hasChanges } = compareResults(BASE, BASE, preview, BASE, 1);

    assert.equal(hasChanges, true);
  });

  it('is false when category score differs by less than 1pp', () => {
    const preview = makeCiResult({ performance: 0.805 }); // 0.5pp above
    const { hasChanges } = compareResults(BASE, BASE, preview, BASE, 1);

    assert.equal(hasChanges, false);
  });

  it('respects a custom threshold', () => {
    // 2pp delta — true at threshold=1, false at threshold=3
    const preview = makeCiResult({ score: 0.83 });

    assert.equal(compareResults(BASE, BASE, preview, BASE, 1).hasChanges, true);
    assert.equal(compareResults(BASE, BASE, preview, BASE, 3).hasChanges, false);
  });
});

// ---------------------------------------------------------------------------
// Report heading
// ---------------------------------------------------------------------------

describe('report heading', () => {
  it('contains the comparison heading', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, 1);

    assert.ok(
      markdown.includes('## Unlighthouse Performance Comparison'),
      'Missing main heading',
    );
  });

  it('appends provider label when provider is given', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, 1, 'vercel');

    assert.ok(
      markdown.includes('## Unlighthouse Performance Comparison — Vercel'),
      'Missing provider label in heading',
    );
  });

  it('capitalises the provider label', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, 1, 'cloudflare');

    assert.ok(markdown.includes('— Cloudflare'), 'Provider should be capitalised');
  });

  it('omits provider label when none provided', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, 1);

    assert.ok(
      !markdown.includes(' — '),
      'Should not contain a provider label separator',
    );
  });

  it('contains the description text', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, 1);

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
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, 1);

    assert.ok(markdown.includes('### Summary Score'));
  });

  it('contains the aggregate score note', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, 1);

    assert.ok(
      markdown.includes(
        'Aggregate score across all categories as reported by Unlighthouse.',
      ),
    );
  });

  it('renders scores as integers on a 1-100 scale', () => {
    const prod = makeCiResult({ score: 0.85 });
    const prev = makeCiResult({ score: 0.72 });
    const { markdown } = compareResults(prod, prod, prev, prev, 1);

    assert.ok(markdown.includes('| Score | 85 | 85 | 72 | 72 |'));
  });

  it('rounds fractional scores correctly', () => {
    const prod = makeCiResult({ score: 0.856 }); // rounds to 86
    const { markdown } = compareResults(prod, BASE, prod, BASE, 1);

    assert.ok(markdown.includes('86'), 'Score 0.856 should round to 86');
  });

  it('contains the four-column header', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, 1);

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
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, 1);

    assert.ok(markdown.includes('### Category Scores'));
  });

  it('renders all four categories', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, 1);

    assert.ok(markdown.includes('Performance'));
    assert.ok(markdown.includes('Accessibility'));
    assert.ok(markdown.includes('Best Practices'));
    assert.ok(markdown.includes('SEO'));
  });

  it('renders category scores as integers on a 1-100 scale', () => {
    const prod = makeCiResult({ performance: 0.80 });
    const prev = makeCiResult({ performance: 0.93 });
    const { markdown } = compareResults(prod, prod, prev, prev, 1);

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
    const { markdown } = compareResults(prodDesktop, prodMobile, prevDesktop, prevMobile, 1);

    assert.ok(markdown.includes('| SEO | 88 | 75 | 91 | 82 |'));
  });
});

// ---------------------------------------------------------------------------
// Core Web Vitals section
// ---------------------------------------------------------------------------

describe('Core Web Vitals section', () => {
  it('contains the Core Web Vitals heading', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, 1);

    assert.ok(markdown.includes('### Core Web Vitals'));
  });

  it('renders all six metrics', () => {
    const { markdown } = compareResults(BASE, BASE, BASE, BASE, 1);

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
    const { markdown } = compareResults(ci, ci, ci, ci, 1);

    assert.ok(markdown.includes('4.8 s'), 'displayValue should appear as-is');
  });

  it('shows — for a metric missing from a result', () => {
    const ciMissingMetric = makeCiResult({ metrics: {} });
    const { markdown } = compareResults(BASE, ciMissingMetric, BASE, BASE, 1);

    assert.ok(markdown.includes('—'), 'Missing metric should show —');
  });

  it('shows four displayValues per metric row', () => {
    const prodDesktop = makeCiResult({ metrics: { ...DEFAULT_METRICS, 'total-blocking-time': { displayValue: '80 ms' } } });
    const prodMobile = makeCiResult({ metrics: { ...DEFAULT_METRICS, 'total-blocking-time': { displayValue: '320 ms' } } });
    const prevDesktop = makeCiResult({ metrics: { ...DEFAULT_METRICS, 'total-blocking-time': { displayValue: '75 ms' } } });
    const prevMobile = makeCiResult({ metrics: { ...DEFAULT_METRICS, 'total-blocking-time': { displayValue: '310 ms' } } });
    const { markdown } = compareResults(prodDesktop, prodMobile, prevDesktop, prevMobile, 1);

    assert.ok(markdown.includes('| TBT | 80 ms | 320 ms | 75 ms | 310 ms |'));
  });
});
