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
  puppeteerClusterOptions: {
    // Limit to one concurrent Lighthouse instance to mitigate hardware-throttling
    // false positives that previously caused us to disable the performance category.
    maxConcurrency: 1,
  },
  scanner: {
    // Run each page multiple times and use the median to absorb cold start
    // outliers across all discovered pages (no explicit warm-up step needed).
    samples: 3,
    // Only audit one representative URL per unique page template. PLP/PDP and
    // other dynamic routes share the same layout, so scanning more instances of
    // the same template yields redundant data.
    include: [
      "/",
      "/fog-linen-chambray-towel-beige-stripe", // PDP
      "/bath", // PLP categories
      "/brands/ofs", // PLP brands
      "/search",
      "/cart",
      "/login",
      "/login/forgot-password",
      "/register",
      "/blog",
      "/your-first-blog-post", // Blog post
      "/compare",
      "/gift-certificates", // Gift certificates page
      "/gift-certificates/balance", // Gift certificates balance page
      "/gift-certificates/purchase", // Gift certificates purchase page
      "/contact-us",
      "/shipping-returns",
    ],
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
