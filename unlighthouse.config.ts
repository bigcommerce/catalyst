
import type { UserConfig } from 'unlighthouse';

export default {
  ci: {
    buildStatic: true,
    budget: {
      // "best-practices": 100,
      // "accessibility": 100,
      // "seo": 100,
      performance: 80,
    },
  },
  scanner: {
    // Run each page multiple times and use the median to absorb cold start
    // outliers across all discovered pages (no explicit warm-up step needed).
    samples: 5,
  },
  puppeteerClusterOptions: {
    // Limit to one concurrent Lighthouse instance to mitigate hardware-throttling
    // false positives that previously caused us to disable the performance category.
    maxConcurrency: 1,
  },
  lighthouseOptions: {
    // Performance re-enabled — hardware throttling concerns are mitigated by
    // maxConcurrency: 1 (no concurrent runs) and samples: 3 (median smoothing).
    onlyCategories: ['best-practices', 'accessibility', 'seo', 'performance'],
    skipAudits: [
      // Disabling `is-crawlable` as it's more relevant for production sites.
      'is-crawlable',
      // Disabling third-party cookies because the only third-party cookies we have is provided through Cloudflare for our CDN, which is not relevant for our audits.
      'third-party-cookies',
      // Disabling inspector issues as it's only providing third-party cookie issues, which are not relevant for our audits.
      'inspector-issues',
    ],
  },
} satisfies UserConfig;
