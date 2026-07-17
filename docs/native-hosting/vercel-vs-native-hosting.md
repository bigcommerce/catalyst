# Vercel vs. Catalyst Native Hosting — Feature Comparison Matrix

> Tracking issue: [LTRAC-1076](https://linear.app/commerce/issue/LTRAC-1076/vercel-vs-native-hosting-feature-comparison-matrix) · Project: Catalyst Native Hosting (GA milestone)

**Native Hosting** (branded **"Commerce Hosting"**) deploys Catalyst storefronts to Commerce's **Cloudflare Workers for Platforms** infrastructure through the **Ignition** deploy service. Builds are produced with **OpenNext**, and the entire lifecycle is driven by the `catalyst` **CLI** — there is no control-panel deploy flow. The CLI ships as a dependency of a scaffolded project and is run through the package manager (e.g. `pnpm catalyst deploy`).

**Vercel** is the third-party platform most Catalyst developers use today (Next.js's first-party host).

This matrix reflects the state of Native Hosting as it approaches GA. Row-level references point at the Linear issues that track each capability, with status as of this writing.

**Legend:** ✅ Supported · 🟡 Partial / in progress · 🔜 Planned / spike · ❌ Not supported · ➖ N/A

---

## 1. Platform & architecture

| Feature | Vercel | Native Hosting |
| --- | --- | --- |
| Runtime | Vercel Edge / Node (Fluid compute) | Cloudflare Workers (Workers for Platforms / Dispatch Namespace) |
| Next.js build adapter | First-party Next.js support | OpenNext (spike to migrate to Cloudflare `vinext`, targeted ~GA — LTRAC-1108) |
| First-party to BigCommerce | ❌ Third-party vendor | ✅ In-house, part of the Commerce ecosystem |
| KV / object storage | Vercel KV, Blob | ✅ Cloudflare KV + R2 provisioned by the pipeline |
| Global edge network | ✅ | ✅ (Cloudflare) |
| Supported Node versions | Broad | v20 / v22 / v24; pnpm (recommended), npm, or yarn |

## 2. Deployment workflow

| Feature | Vercel | Native Hosting |
| --- | --- | --- |
| Deploy trigger | Git push (auto CI/CD) + CLI | ✅ CLI (`catalyst deploy`) |
| Scaffold new project | `create-next-app` style | ✅ `pnpm create @bigcommerce/catalyst@latest --hosting commerce` |
| Link project | `vercel link` | ✅ `catalyst project link` / `catalyst channel link` |
| Local dev server | `vercel dev` | ✅ `pnpm dev` (Next.js dev — not a `catalyst` subcommand) |
| Local production preview | ➖ | ✅ `catalyst start` (closer to prod than `pnpm dev`) |
| Build without deploying | ✅ | ✅ `catalyst build`, or `catalyst deploy --dry-run` / `--prebuilt` |
| Git-integrated preview deployments | ✅ Automatic per-branch/PR URLs | 🔜 Spike for GitHub Actions deploys (LTRAC-969, GA cycle) |
| Production promotion | ✅ | ✅ (deploy = production) |
| CI/CD deploys | ✅ | ✅ Set `CATALYST_*` env vars or pass flags; no interactive login needed |
| Deployment-not-found page | ✅ | 🟡 Not yet built (LTRAC-968) |
| Framework upgrade tooling | Manual | ✅ `catalyst upgrade` (3-way merge; `--dry-run` to preview) |
| Auth | Vercel login | ✅ `catalyst auth login/whoami/logout` (browser OAuth device-code) |
| Diagnostics for bug reports | ➖ | ✅ `catalyst debug`; correlation IDs printed on error |

## 3. Custom domains

| Feature | Vercel | Native Hosting |
| --- | --- | --- |
| Auto-generated hostname | `*.vercel.app` | ✅ `<project>.catalyst-sandbox.store` (permanent fallback/preview URL) |
| Custom / vanity domains | ✅ | ✅ Done (LTRAC-399); `catalyst domains add/list/status/remove` |
| Subdomain vs. apex setup | ✅ | ✅ Subdomain → CNAME to worker URL; apex → A record to store IP |
| DNS verification (CNAME/TXT) | ✅ | ✅ Modeled on Vercel's TXT-verification flow (LTRAC-854, LTRAC-472) |
| Domain claim / transfer between projects | ✅ | ✅ `catalyst domains claim` / `transfer` |
| Automatic SSL/TLS | ✅ | ✅ (single-level); ⚠️ two-level subdomains can't auto-provision Cloudflare SSL |
| Merchant's own Cloudflare (Orange-to-Orange) | ➖ | 🔜 Enterprise requirement, spike (LTRAC-448, GA cycle) |

> Note: `catalyst domains add --wait` polls for verification but times out after ~5 min; DNS propagation can take longer, so re-check with `catalyst domains status`.

## 4. Caching & performance

| Feature | Vercel | Native Hosting |
| --- | --- | --- |
| Route / edge caching | ✅ Vercel Edge Cache | 🟡 Catalyst `with-routes` KV adapter available; auto-config for NH still pending (LTRAC-1019, GA) |
| ISR / on-demand revalidation | ✅ | 🟡 Via OpenNext (`'use cache'` / `cacheLife`); not tracked as a distinct NH feature |
| Image optimization | ✅ Built-in | ➖ Not in NH scope (images served via BigCommerce CDN) |
| Performance / load-test story | Published benchmarks | 🟡 Being documented with load testing (LTRAC-765, LTRAC-1103) |

## 5. Logs & observability

| Feature | Vercel | Native Hosting |
| --- | --- | --- |
| Real-time log tailing | ✅ | ✅ `catalyst logs tail` (verified working; `--format request` for HTTP access logs) |
| Historical / persisted log querying | ✅ | ✅ `catalyst logs query` — up to a **7-day** window; rich filters (level, status, method, URL) |
| Log pagination | ✅ | 🟡 Blocked by a confirmed Cloudflare endpoint bug (LTRAC-966, GA); `--limit` max 500 today |
| Metrics / usage dashboards | ✅ Analytics + Speed Insights | 🔜 Explored for GA — no dashboard yet (LTRAC-1029) |
| OpenTelemetry | ✅ | 🔜 Edge-compatible OTel spike (LTRAC-821) |

## 6. Environment variables & secrets

| Feature | Vercel | Native Hosting |
| --- | --- | --- |
| CLI management | `vercel env` | ✅ `catalyst env add/remove/list` (values masked on list) |
| Where vars live | Server-managed per environment | 🟡 Client-side only — stored in local `.bigcommerce/project.json`, sent as secrets on every deploy |
| One-off / CI secrets | ✅ | ✅ `catalyst deploy --secret KEY=VALUE`, or `CATALYST_*` env vars in CI |
| Centralized / backend-persisted secrets | ✅ | 🔜 Post-GA spike, "nice to have" (LTRAC-975) — today, deploying from another machine/CI needs the vars re-supplied |
| `.env` file loading | ✅ | 🟡 `.env.local` auto-read (also `--env-path`); behavior being reconsidered (LTRAC-1091) |

## 7. Rollbacks, history & previews

| Feature | Vercel | Native Hosting |
| --- | --- | --- |
| Instant rollback to prior deploy | ✅ | 🔜 Post-GA, "nice to have" (LTRAC-970) — interim path is git revert + re-deploy |
| Deployment history / activity feed | ✅ | 🔜 Not built (LTRAC-972, LTRAC-978) |
| Per-branch preview URLs | ✅ | 🔜 Spike only (LTRAC-969) |
| Deployment versioning | ✅ | 🟡 Cloudflare Workers versioning under the hood; version-tracking field (LTRAC-466) |

## 8. Storefront-specific (Catalyst / BigCommerce)

| Feature | Vercel | Native Hosting |
| --- | --- | --- |
| Geolocation headers | ✅ Vercel geo headers | ✅ Done — Cloudflare visitor-location transform → canonical `cf-*` headers (LTRAC-478) |
| Channel site-URL assignment | Manual | ✅ `catalyst channel update --hostname` / `catalyst deploy --update-site-url` |
| Configurable checkout URL | Manual | 🟡 Still redirects to old Vercel-hosted checkout; config in progress (LTRAC-447, GA — blocked by 2-level subdomain SSL) |
| Multiple storefront channels | ➖ | ✅ `catalyst channel create` (LTRAC-976) |

## 9. Migration from Vercel

| Consideration | Detail |
| --- | --- |
| Support scope | Native hosting product only; **migration complexity is the developer's responsibility** (per project brief) |
| `instrumentation.ts` + `@vercel/otel` | ⚠️ Custom server hooks may be incompatible with the managed runtime; setup offers to remove `instrumentation.ts` (interactive only — silently skipped in CI, so remove/gate it yourself) |
| Vercel-parity blockers at project start | Geo headers ✅ resolved; checkout URL 🟡 in progress (LTRAC-478 / LTRAC-447) |

## 10. Pricing, limits & support

| Feature | Vercel | Native Hosting |
| --- | --- | --- |
| Billing model | Vercel plans / usage-based, separate vendor + invoice | Bundled with BigCommerce; pricing/packaging TBD at GA (LTRAC-1102) |
| Usage limits | Plan-tiered hard limits | Soft-limit program w/ thresholds + playbook (LTRAC-1101, LTRAC-1156) |
| Support | Vercel support tiers | White-glove (alpha) → docs/community-first (beta) → GA TBD |
| WAF / DDoS | ✅ Vercel Firewall | ✅ Inherited from Cloudflare (not surfaced as a configurable NH feature) |

---

## Summary — where Native Hosting stands vs. Vercel

**At or near parity (shipped):** CLI deploy workflow, custom/vanity domains + DNS verification + claim/transfer, automatic SSL, real-time log tailing and 7-day historical log querying, geo headers, channel site-URL assignment, multi-channel creation, framework upgrade tooling, and first-party BigCommerce integration (something Vercel can't match).

**In progress toward GA:** routing-KV auto-configuration, configurable checkout URL, log-query pagination, metrics/OTel dashboards, O2O custom domains, deployment-not-found page.

**Deferred to Post-GA ("nice to have"):** instant rollback, centralized/backend-persisted env vars, deployment history/activity feed, Git-based preview deployments.

**Structural differences (not necessarily gaps):** CLI-only (no control-panel deploy or Git-push CI/CD trigger), env vars are client-side today, bundled pricing with soft limits vs. Vercel's plan tiers, and migration-from-Vercel complexity being the developer's responsibility.

**Native Hosting's advantages:** single vendor/invoice with BigCommerce, no third-party relationship, purpose-built for Catalyst, lower total cost of ownership (the SLG sales pitch), and Cloudflare's edge with inherited WAF/DDoS protection.

---

_Not represented as tracked Native Hosting features (confirm before treating as committed): image optimization, ISR, WAF config, web analytics, and cron jobs — these reflect inherited Cloudflare/OpenNext behavior rather than product features._

_Sources: Catalyst Native Hosting Linear project (verified against individual issues LTRAC-399, 447, 448, 478, 966, 969, 970, 975, 1019, 1029, 1093), the Native Hosting Beta Onboarding doc, the CLI source in `packages/catalyst/src/cli/commands/`, and the project brief._
