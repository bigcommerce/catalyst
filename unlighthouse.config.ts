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
  scanner: {
    // Run each page multiple times and use the median to absorb cold start
    // outliers across all discovered pages.
    samples: 3,
    dynamicSampling: 5,
    exclude: [
      "/bundleb2b/",
      "/invoices/",
      "/bath/*/*",
      "/garden/*/*",
      "/kitchen/*/*",
      "/publications/*/*",
      "/early-access/*/*",
      "/digital-test-product/",
      "/blog/\\?tag=*",
      "/brands/",
    ],
    customSampling: {
      "/smith-journal-13/|/dustpan-brush/|/utility-caddy/|/canvas-laundry-cart/|/laundry-detergent/|/tiered-wire-basket/|/oak-cheese-grater/|/1-l-le-parfait-jar/|/chemex-coffeemaker-3-cup/|/sample-able-brewing-system/|/orbit-terrarium-small/|/orbit-terrarium-large/|/fog-linen-chambray-towel-beige-stripe/|/zz-plant/":
        { name: "PDP" },
      "/shop-all/|/bath/|/garden/|/kitchen/|/publications/|/early-access/": {
        name: "PLP categories",
      },
      "/brands/sagaform/|/brands/ofs/|/brands/common-good/": {
        name: "PLP brands",
      },
    },
    // Disable throttling to avoid issues with cold start and cold cache.
    throttle: false,
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
