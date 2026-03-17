import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { buildReport } from '../audit-unlighthouse.mts';
import type { CiResult } from '../audit-unlighthouse.mts';

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
// Report heading
// ---------------------------------------------------------------------------

describe('report heading', () => {
  it('contains the audit heading', () => {
    const markdown = buildReport(BASE, BASE);

    assert.ok(markdown.includes('## Unlighthouse Audit'), 'Missing main heading');
  });

  it('appends branch label when branch is given', () => {
    const markdown = buildReport(BASE, BASE, 'canary');

    assert.ok(
      markdown.includes('## Unlighthouse Audit — `canary`'),
      'Missing branch label in heading',
    );
  });

  it('handles branch names with slashes', () => {
    const markdown = buildReport(BASE, BASE, 'integrations/makeswift');

    assert.ok(markdown.includes('`integrations/makeswift`'));
  });

  it('omits branch label when none provided', () => {
    const markdown = buildReport(BASE, BASE);

    assert.ok(!markdown.includes(' — '), 'Should not contain a branch label separator');
  });

  it('contains the description text', () => {
    const markdown = buildReport(BASE, BASE);

    assert.ok(markdown.includes('Unlighthouse scores for the latest commit on this branch.'));
  });
});

// ---------------------------------------------------------------------------
// Summary Score section
// ---------------------------------------------------------------------------

describe('Summary Score section', () => {
  it('contains the Summary Score heading', () => {
    const markdown = buildReport(BASE, BASE);

    assert.ok(markdown.includes('### Summary Score'));
  });

  it('contains the aggregate score note', () => {
    const markdown = buildReport(BASE, BASE);

    assert.ok(markdown.includes('Aggregate score across all categories as reported by Unlighthouse.'));
  });

  it('renders scores as integers on a 1-100 scale', () => {
    const desktop = makeCiResult({ score: 0.85 });
    const mobile = makeCiResult({ score: 0.72 });
    const markdown = buildReport(desktop, mobile);

    assert.ok(markdown.includes('| Score | 85 | 72 |'));
  });

  it('rounds fractional scores correctly', () => {
    const desktop = makeCiResult({ score: 0.856 }); // rounds to 86
    const markdown = buildReport(desktop, BASE);

    assert.ok(markdown.includes('86'), 'Score 0.856 should round to 86');
  });

  it('contains the two-column header', () => {
    const markdown = buildReport(BASE, BASE);

    assert.ok(markdown.includes('| | Desktop | Mobile |'));
  });
});

// ---------------------------------------------------------------------------
// Category Scores section
// ---------------------------------------------------------------------------

describe('Category Scores section', () => {
  it('contains the Category Scores heading', () => {
    const markdown = buildReport(BASE, BASE);

    assert.ok(markdown.includes('### Category Scores'));
  });

  it('renders all four categories', () => {
    const markdown = buildReport(BASE, BASE);

    assert.ok(markdown.includes('Performance'));
    assert.ok(markdown.includes('Accessibility'));
    assert.ok(markdown.includes('Best Practices'));
    assert.ok(markdown.includes('SEO'));
  });

  it('renders desktop and mobile scores independently', () => {
    const desktop = makeCiResult({ performance: 0.80 });
    const mobile = makeCiResult({ performance: 0.93 });
    const markdown = buildReport(desktop, mobile);

    assert.ok(
      markdown.includes('| Performance | 80 | 93 |'),
      'Performance row should show desktop then mobile score',
    );
  });

  it('shows all four categories independently', () => {
    const desktop = makeCiResult({ seo: 0.88, accessibility: 0.75 });
    const mobile = makeCiResult({ seo: 0.91, accessibility: 0.82 });
    const markdown = buildReport(desktop, mobile);

    assert.ok(markdown.includes('| SEO | 88 | 91 |'));
    assert.ok(markdown.includes('| Accessibility | 75 | 82 |'));
  });
});

// ---------------------------------------------------------------------------
// Core Web Vitals section
// ---------------------------------------------------------------------------

describe('Core Web Vitals section', () => {
  it('contains the Core Web Vitals heading', () => {
    const markdown = buildReport(BASE, BASE);

    assert.ok(markdown.includes('### Core Web Vitals'));
  });

  it('renders all six metrics', () => {
    const markdown = buildReport(BASE, BASE);

    assert.ok(markdown.includes('LCP'));
    assert.ok(markdown.includes('CLS'));
    assert.ok(markdown.includes('FCP'));
    assert.ok(markdown.includes('TBT'));
    assert.ok(markdown.includes('Max Potential FID'));
    assert.ok(markdown.includes('Time to Interactive'));
  });

  it('passes displayValue through unchanged', () => {
    const desktop = makeCiResult({
      metrics: { ...DEFAULT_METRICS, 'largest-contentful-paint': { displayValue: '4.8 s' } },
    });
    const markdown = buildReport(desktop, BASE);

    assert.ok(markdown.includes('4.8 s'));
  });

  it('shows — for a metric missing from a result', () => {
    const desktopMissingMetric = makeCiResult({ metrics: {} });
    const markdown = buildReport(desktopMissingMetric, BASE);

    assert.ok(markdown.includes('—'), 'Missing metric should show —');
  });

  it('shows desktop and mobile displayValues per metric row', () => {
    const desktop = makeCiResult({ metrics: { ...DEFAULT_METRICS, 'total-blocking-time': { displayValue: '80 ms' } } });
    const mobile = makeCiResult({ metrics: { ...DEFAULT_METRICS, 'total-blocking-time': { displayValue: '320 ms' } } });
    const markdown = buildReport(desktop, mobile);

    assert.ok(markdown.includes('| TBT | 80 ms | 320 ms |'));
  });
});
