# Routing cache benchmark (LTRAC-1019)

Measures what the shared Cloudflare KV routing cache actually costs and saves,
by comparing two Catalyst deployments that differ only in whether
`CATALYST_ROUTES_KV` is bound.

## Why it is built this way

Earlier attempts timed requests from outside and could not resolve the effect.
The routing lookup is a few milliseconds inside the Worker, sitting under ~5ms
of network and 1-3s of streamed response; a three-region sweep returned
sub-millisecond differences that flipped sign between regions. So the Worker
reports its own numbers instead, via a `Server-Timing` header emitted from
`withRoutes`:

    Server-Timing: rt;dur=20,origin;dur=0,cache;desc="hit"

- `rt`     time inside `kv.mget`
- `origin` time in origin fetches that *block* the response (excludes the
           `waitUntil` background refreshes, which cost the request nothing)
- `cache`  whether the route came back cached

On Workers the clock only advances across I/O, so `rt;dur=0` means the lookup
was served from in-process memory and never reached the shared store. That
makes 0 a meaningful reading rather than a failed one, and it is what
`cache_memory_hit` counts.

## Setup

1. Deploy **both** stores from a build containing the instrumentation and the
   Cloudflare KV adapter. Both arms must run identical code -- the only
   difference between them should be the presence of the `CATALYST_ROUTES_KV`
   binding. Mismatched builds produced a phantom 17% regression on an earlier
   run.
2. Confirm each arm is behaving as expected before spending a run:

       curl -sI <kv-store>/utility-caddy   | grep -i server-timing   # rt non-zero on some requests
       curl -sI <nokv-store>/utility-caddy | grep -i server-timing   # rt always 0

   If the header is missing, the deployment predates the instrumentation. If
   the KV arm never shows a non-zero `rt`, its binding or adapter is missing
   and the run will show a very convincing zero difference for the wrong
   reason.
3. Point `BASE` in `grafana-cloud.js` at the two stores.

## Running

Paste `grafana-cloud.js` into a Grafana Cloud k6 test. A trial only allows one
load zone at a time, so the region sweep is one run per zone, selected with the
`ZONE` environment variable:

    ZONE=amazon:us:ashburn
    ZONE=amazon:de:frankfurt
    ZONE=amazon:au:sydney

Both arms run concurrently inside every run, so the arm-to-arm comparison is
made under identical conditions and is safe to compare across runs. Only
absolute latency drifts between runs.

Download each run's results as CSV, unzip into one directory per zone, then:

    ./analyze.py <results-dir>

## Traps this harness already accounts for

- **k6's default User-Agent** is scored as a bot by Cloudflare on these stores
  and draws a ~650ms penalty: 117ms vs 769ms on the same warm path, changing
  nothing else. The script overrides it. Uniformly slow results mean this
  regressed.
- **No cache-busting query string.** The cache key includes the query string,
  so `?_=<random>` makes every request a unique key: 100% miss rate and a
  measurement of nothing.
- **Warm-up.** A cold deploy served ~1.2s to first byte against ~60ms warm.
  Warm-up scenarios are tagged `phase: warmup` and excluded from the analysis.
- **Think time** paces each run past 60s of wall clock on purpose. The
  in-memory layer in front of KV expires after 60s, so a faster run measures
  one KV fill followed by pure memory hits rather than the steady state.
- **`maxRedirects: 0`.** Following a redirect folds a second request's latency
  into the sample.
- **Pre-aggregated exports.** Grafana Cloud exports time buckets with
  per-bucket percentiles, not raw samples, so combined percentiles cannot be
  recovered. `analyze.py` reports only exact quantities. Expanding buckets
  around their median to fake percentiles undercounted KV reads by more than
  half on this data.

## Note

`ROUTES_CACHE_TIMING`-style gating was dropped on this branch: the header is
emitted unconditionally so both benchmark deployments need no extra
configuration, which also removes the failure mode where one arm has the flag
and the other does not. Gate it before this goes near a real store.
