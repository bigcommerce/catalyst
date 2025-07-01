
import type { UserConfig } from 'unlighthouse';

export default {
  ci: {
    buildStatic: true,
    // Disabling the budget so we can audit and fix the issues first
    budget: {
      // "best-practices": 100,
      // "accessibility": 100,
      // "seo": 100,
    },
  }, 
  lighthouseOptions: {
    // Disabling performance tests because lighthouse utilizes hardware throttling. This affects concurrently running tests which might lead to false positives.
    // The best way to truly measure performance is to use real user metrics – Vercel's Speed Insights is a great tool for that.
    onlyCategories: ['best-practices', 'accessibility', 'seo'],
    skipAudits: [
      // Disabling `is-crawlable` as it's more relevant for production sites.
      'is-crawlable',
      // Disabling third-party cookies because the only third-party cookies we have is provided through Cloudflare for our CDN, which is not relevant for our audits.
      'third-party-cookies',
      // Disabling inspector issues as it's only providing third-party cookie issues, which are not relevant for our audits.
      'inspector-issues',
    ]
  }
} satisfies UserConfig;
