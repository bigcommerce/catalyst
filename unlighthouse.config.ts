import { readFileSync } from "node:fs";
import type { UserConfig } from "unlighthouse";

// Fixed lists keep preview and production scanning the same routes, so scores
// can be compared route by route. Each demo store has its own catalog.
const ROUTES: Record<string, string[]> = {
  "@bigcommerce/catalyst-core": [
    "/",
    "/kitchen/",
    "/garden/",
    "/brands/sagaform/",
    "/brands/ofs/",
    "/chemex-coffeemaker-3-cup/",
    "/canvas-laundry-cart/",
    "/fog-linen-chambray-towel-beige-stripe/",
    "/blog/",
    "/your-first-blog-post/",
    "/contact-us/",
    "/shipping-returns/",
    "/cart/",
    "/login/",
    "/register/",
    "/gift-certificates/",
  ],
  "@bigcommerce/catalyst-makeswift": [
    "/",
    "/shop-all/",
    "/plants/",
    "/pots/",
    "/rustic-roots/",
    "/monstera/",
    "/zz-plant/",
    "/3-plant-bundle/",
    "/blog/",
    "/your-first-blog-post/",
    "/shipping-returns/",
    "/cart/",
    "/login/",
    "/register/",
    "/gift-certificates/",
  ],
};

const { name } = JSON.parse(readFileSync("./core/package.json", "utf-8")) as {
  name: string;
};

export default {
  urls: ROUTES[name] ?? ROUTES["@bigcommerce/catalyst-core"],
  ci: {
    buildStatic: true,
    reporter: "jsonExpanded",
  },
  scanner: {
    // Run each page multiple times and use the median to absorb cold start
    // outliers.
    samples: 3,
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
      // reCAPTCHA rejects Vercel preview origins, so this fails on every preview regardless of the change.
      "errors-in-console",
      // Next.js streams metadata into <body> when it resolves late, and this audit only checks <head>.
      "meta-description",
    ],
  },
} satisfies UserConfig;
