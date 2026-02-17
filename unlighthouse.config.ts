import type { UserConfig } from "unlighthouse";

export default {
  ci: {
    buildStatic: true,
    reporter: "jsonExpanded",
    budget: {
      // "best-practices": 100,
      // "accessibility": 100,
      // "seo": 100,
      // performance: 80,
    },
  },
  lighthouseOptions: {
    onlyCategories: ["best-practices", "accessibility", "seo", "performance"],
    skipAudits: [
      // Disabling `is-crawlable` as it's more relevant for production sites.
      "is-crawlable",
      // Disabling third-party cookies because the only third-party cookies we have is provided through Cloudflare for our CDN, which is not relevant for our audits.
      "third-party-cookies",
      // Disabling inspector issues as it's only providing third-party cookie issues, which are not relevant for our audits.
      "inspector-issues",
    ],
  },
} satisfies UserConfig;
