// LTRAC-1019 — routing cache benchmark, Grafana Cloud k6.
//
// Paste as-is. Set the project ID in the Grafana Cloud UI (or uncomment
// cloud.projectID below). Run it twice and compare the two runs.
//
// Arms, both hitting the SAME paths against the SAME catalog:
//   kv   — jm-integration-test-08-17 (CATALYST_ROUTES_KV bound; with-routes
//          lookups served from Workers KV)
//   nokv — jm-staging-test-08-18 (no binding; per-isolate memory only)
//
// Page weights were checked across four paths and agree within ~1%, so the two
// storefronts render comparable work and the arm-to-arm delta is attributable
// to the cache rather than to content differences.
//
// Residual confound worth remembering: the arms sit in different environments
// (integration vs staging), so they talk to different BigCommerce API backends
// and different Cloudflare zones. That is much smaller than a catalog
// difference, but it is not zero — a consistent offset in one arm across every
// region is more likely environment than cache.

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// k6's default User-Agent (`k6/x.y.z`) is scored as a bot by Cloudflare on
// these stores and draws a ~650ms penalty. Measured directly: same warm path,
// 117ms with a browser UA vs 769ms with k6's, nothing else changed. That is
// ~45x the effect being measured. If results come back uniformly slow, this is
// the first thing to check.
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const BASE = {
  kv: 'https://jm-integration-test-08-17.catalyst-sandbox-integration.store',
  nokv: 'https://jm-staging-test-08-18.catalyst-sandbox-staging.store',
};

// Verified 200 on both stores. No trailing slashes: both run
// TRAILING_SLASH=false and would 308, which would measure a redirect hop.
const PATHS = [
  '/1-l-le-parfait-jar',
  '/able-brewing-system',
  '/brands/common-good',
  '/brands/ofs',
  '/brands/sagaform',
  '/canvas-laundry-cart',
  '/chemex-coffeemaker-3-cup',
  '/dustpan-brush',
  '/fog-linen-chambray-towel-beige-stripe',
  '/laundry-detergent',
  '/oak-cheese-grater',
  '/orbit-terrarium-large',
  '/orbit-terrarium-small',
  '/shop-all',
  '/smith-journal-13',
  '/tiered-wire-basket',
  '/utility-caddy',
  '/your-first-blog-post',
];

const ITERATIONS = Number(__ENV.ITERATIONS || 1000);
const VUS = Number(__ENV.VUS || 12);

// One zone per run. A Grafana Cloud trial only allows a single load zone at a
// time, so the region sweep is done as one run per zone rather than one run
// split across zones. That costs less than it sounds: both arms run
// concurrently inside every run, so the kv-vs-nokv delta is always measured
// under identical conditions and is safe to compare across runs. Only absolute
// latency drifts between runs, and the delta is the number being reported.
//
// Set ZONE in the Grafana Cloud UI's environment variables. Suggested sweep,
// in order of decreasing value if the trial's VU-hours run short:
//   amazon:us:ashburn    close to origin — the baseline
//   amazon:de:frankfurt  mid distance
//   amazon:au:sydney     far — where a KV read costs the most
//   amazon:ie:dublin, amazon:jp:tokyo, amazon:us:portland
const ZONE = __ENV.ZONE || 'amazon:us:ashburn';

const ttfb = new Trend('routing_ttfb', true);
const failed = new Rate('routing_failed');
const redirects = new Counter('routing_redirects');

// Read from the middleware's Server-Timing header. HTTP timing from outside
// cannot resolve a few milliseconds inside the worker, sitting under ~5ms of
// network and 1-3s of streamed response; these are the worker's own numbers.
//
// Requires both arms deployed from the routes-cache-timing experiment branch,
// which emits the header unconditionally. timing_missing is the canary: if it
// is not ~0 the header never arrived — most likely one arm is running an older
// build — and every other metric here is empty rather than zero.
const kvLookup = new Trend('cache_lookup_ms', true);
const originMs = new Trend('cache_origin_ms', true);
const memoryHit = new Rate('cache_memory_hit');
const originBlocking = new Rate('cache_origin_blocking');
const routeCached = new Rate('cache_route_hit');
const timingMissing = new Rate('timing_missing');

export const options = {
  // cloud: { projectID: 0000000, name: 'LTRAC-1019 routing cache' },
  cloud: {
    name: `LTRAC-1019 routing cache — ${ZONE}`,
    // Distance is the whole point. A KV read that misses the local colo cache
    // goes to a central store, so the further the isolate, the more a read
    // costs and the more the in-memory layer in front of it is worth. A
    // US-only sweep understates both the cost and the benefit.
    distribution: {
      single: { loadZone: ZONE, percent: 100 },
    },
  },

  scenarios: {
    // Cold deploys served ~1.2s TTFB against ~60ms warm, so an unwarmed first
    // pass would bury the effect. Tagged separately and excluded from the
    // thresholds; filter phase:measure when reading results.
    warmup_kv: {
      executor: 'shared-iterations',
      exec: 'warmupKv',
      vus: 6,
      iterations: 120,
      maxDuration: '5m',
      tags: { arm: 'kv', phase: 'warmup' },
    },
    warmup_nokv: {
      executor: 'shared-iterations',
      exec: 'warmupNokv',
      vus: 6,
      iterations: 120,
      maxDuration: '5m',
      tags: { arm: 'nokv', phase: 'warmup' },
    },

    // Both arms run concurrently so time-of-day variance, network weather and
    // origin load land on both equally.
    kv: {
      executor: 'shared-iterations',
      exec: 'measureKv',
      vus: VUS,
      iterations: ITERATIONS,
      startTime: '90s',
      maxDuration: '30m',
      tags: { arm: 'kv', phase: 'measure' },
    },
    nokv: {
      executor: 'shared-iterations',
      exec: 'measureNokv',
      vus: VUS,
      iterations: ITERATIONS,
      startTime: '90s',
      maxDuration: '30m',
      tags: { arm: 'nokv', phase: 'measure' },
    },
  },

  thresholds: {
    // Latency over a broken arm is not comparable to latency over a clean one.
    'routing_failed{phase:measure}': ['rate<0.02'],
  },

  // Following a redirect would fold a second request's latency into the sample.
  maxRedirects: 0,
  discardResponseBodies: true,
  userAgent: BROWSER_UA,
};

function hit(arm, phase) {
  const path = PATHS[Math.floor(Math.random() * PATHS.length)];

  // No cache-busting query string. The cache key includes the query string, so
  // a `?_=<random>` buster makes every request a unique key: 100% miss rate,
  // unbounded key churn, and a measurement of nothing.
  const res = http.get(BASE[arm] + path, {
    headers: {
      'Cache-Control': 'no-cache',
      // Real clients compress. Uncompressed these pages are ~400KB vs ~55KB
      // gzipped, and the extra bytes show up in the timings.
      'Accept-Encoding': 'gzip, br',
    },
    tags: { arm, phase, path, zone: ZONE },
  });

  const ok = res.status === 200 || (res.status >= 300 && res.status < 400);

  if (res.status >= 300 && res.status < 400) {
    redirects.add(1, { arm, phase, zone: ZONE });
  }

  // TTFB, not http_req_duration. These pages stream, so duration (~1.3s) is
  // dominated by SSR streaming time; the routing middleware decides before the
  // first byte, so only time-to-first-byte can see it.
  ttfb.add(res.timings.waiting, { arm, phase, path, zone: ZONE });
  failed.add(!ok, { arm, phase, zone: ZONE });

  const st = res.headers['Server-Timing'] || '';
  const rt = /rt;dur=([\d.]+)/.exec(st);
  const origin = /origin;dur=([\d.]+)/.exec(st);
  const cache = /cache;desc="(hit|miss)"/.exec(st);
  const tags = { arm, phase, zone: ZONE };

  timingMissing.add(!rt, tags);

  if (rt) {
    const lookup = Number(rt[1]);

    kvLookup.add(lookup, tags);
    // Workers only advance the clock across I/O, so a 0 here is an in-process
    // memory hit that never reached the shared store, not a missing reading.
    memoryHit.add(lookup === 0, tags);
  }

  if (origin) {
    const blocked = Number(origin[1]);

    originMs.add(blocked, tags);
    originBlocking.add(blocked > 0, tags);
  }

  if (cache) {
    routeCached.add(cache[1] === 'hit', tags);
  }

  check(res, { 'status ok': () => ok }, { arm, phase, zone: ZONE });

  // Paces the run past 60s of wall clock on purpose. The in-memory layer in
  // front of KV expires after 60s, so a run that finishes faster than that
  // measures one KV fill followed by pure memory hits. With think time each
  // isolate goes back to KV roughly once per key per minute, which is the
  // steady state actually worth measuring.
  sleep(0.5 + Math.random());
}

export function warmupKv() {
  hit('kv', 'warmup');
}
export function warmupNokv() {
  hit('nokv', 'warmup');
}
export function measureKv() {
  hit('kv', 'measure');
}
export function measureNokv() {
  hit('nokv', 'measure');
}
