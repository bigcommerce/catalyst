#!/usr/bin/env python3
"""Summarise a Grafana Cloud k6 CSV export for the routing-cache benchmark.

    ./analyze.py <results-dir>

<results-dir> holds one subdirectory per load zone, each being an unzipped
Grafana Cloud "download results as CSV" export:

    results/
      ashburn/metric_cache_lookup_ms.csv, metric_cache_origin_ms.csv, ...
      frankfurt/...
      sydney/...

Only exact quantities are reported: event counts and count-weighted means.
The export is pre-aggregated into time buckets with per-bucket percentiles,
so combined percentiles cannot be recovered from it -- reconstructing them by
expanding each bucket around its median silently drops non-zero values in
buckets whose median is 0, which undercounts KV reads by more than half. The
means and rates below are unaffected by that and are exact.
"""

import ast
import csv
import sys
from pathlib import Path


def _rows(zone_dir, metric, arm, phase='measure'):
    path = zone_dir / f'metric_{metric}.csv'

    if not path.exists():
        return []

    out = []

    for row in csv.DictReader(path.open()):
        tags = ast.literal_eval(row['tags'])

        if tags.get('phase') != phase or tags.get('arm') != arm:
            continue

        out.append(row)

    return out


def total(zone_dir, metric, arm):
    """(sample count, summed value) -- both exact."""
    rows = _rows(zone_dir, metric, arm)
    n = sum(int(r['count']) for r in rows)

    return n, sum(float(r['mean']) * int(r['count']) for r in rows)


def occurrences(zone_dir, metric, arm):
    """(events, trials) for a Rate metric -- exact."""
    rows = _rows(zone_dir, metric, arm)

    return (
        sum(float(r.get('nz_count') or 0) for r in rows),
        sum(float(r['count']) for r in rows),
    )


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)

    root = Path(sys.argv[1])
    zones = sorted(d for d in root.iterdir() if d.is_dir() and (d / 'metrics.csv').exists())

    if not zones:
        sys.exit(f'no zone directories with metrics.csv under {root}')

    # A run that lost the Server-Timing header produces empty cache_* metrics
    # rather than zeroed ones, which reads as "no effect" instead of "no data".
    print('=== header coverage (timing_missing must be 0) ===')

    for z in zones:
        missing, n = occurrences(z, 'timing_missing', 'kv')
        missing2, n2 = occurrences(z, 'timing_missing', 'nokv')
        flag = '' if missing + missing2 == 0 else '   <-- INVALID RUN'
        print(f'  {z.name:<12} kv {missing:.0f}/{n:.0f}   nokv {missing2:.0f}/{n2:.0f}{flag}')

    print('\n=== blocking origin (Storefront API) calls ===')
    print(f'  {"zone":<12}{"no-KV":>9}{"KV":>8}{"reduction":>12}')

    for z in zones:
        a, _ = occurrences(z, 'cache_origin_blocking', 'nokv')
        b, _ = occurrences(z, 'cache_origin_blocking', 'kv')
        red = f'{(a - b) / a * 100:.0f}%' if a else 'n/a'
        print(f'  {z.name:<12}{a:>9.0f}{b:>8.0f}{red:>12}')

    print('\n=== cost when it happens (conditional mean) ===')
    print(f'  {"zone":<12}{"origin fetch":>15}{"KV read":>11}{"ratio":>8}')

    for z in zones:
        _, origin_ms = total(z, 'cache_origin_ms', 'nokv')
        fetches, _ = occurrences(z, 'cache_origin_blocking', 'nokv')

        reads_n, lookup_ms = total(z, 'cache_lookup_ms', 'kv')
        # A lookup of 0 never left in-process memory: on Workers the clock only
        # advances across I/O.
        memory_hits, _ = occurrences(z, 'cache_memory_hit', 'kv')
        reads = reads_n - memory_hits

        if not fetches or not reads:
            continue

        o, k = origin_ms / fetches, lookup_ms / reads
        print(f'  {z.name:<12}{o:>13.1f}ms{k:>9.1f}ms{o / k:>7.1f}x')

    print('\n=== amortised routing-lookup cost per request ===')
    print(f'  {"zone":<12}{"no-KV":>10}{"KV":>10}{"change":>10}')

    for z in zones:
        n1, t1 = total(z, 'cache_origin_ms', 'nokv')
        n2, t2 = total(z, 'cache_lookup_ms', 'kv')

        if not n1 or not n2:
            continue

        a, b = t1 / n1, t2 / n2
        print(f'  {z.name:<12}{a:>8.2f}ms{b:>8.2f}ms{(b - a) / a * 100:>9.1f}%')

    print('\n=== how often each arm pays anything ===')
    print(f'  {"zone":<12}{"no-KV origin":>14}{"KV reads":>10}{"KV memory":>11}')

    for z in zones:
        a, n = occurrences(z, 'cache_origin_blocking', 'nokv')
        h, m = occurrences(z, 'cache_memory_hit', 'kv')
        print(f'  {z.name:<12}{a / n * 100:>13.1f}%{(m - h) / m * 100:>9.1f}%{h / m * 100:>10.1f}%')

    print('\n=== sanity checks ===')

    for z in zones:
        cpu = _rows(z, 'load_generator_cpu_percent', 'kv', phase=None)
        rows = list(csv.DictReader((z / 'metric_load_generator_cpu_percent.csv').open()))
        n = sum(int(r['count']) for r in rows)
        cpu_mean = sum(float(r['mean']) * int(r['count']) for r in rows) / n

        failed = list(csv.DictReader((z / 'metric_routing_failed.csv').open()))
        nz = sum(float(r.get('nz_count') or 0) for r in failed)
        tot = sum(float(r['count']) for r in failed)

        bytes_by_arm = {}

        for r in csv.DictReader((z / 'metric_data_received.csv').open()):
            scenario = ast.literal_eval(r['tags']).get('scenario') or r['scenario']
            bytes_by_arm[scenario] = bytes_by_arm.get(scenario, 0) + float(r['count'])

        print(
            f'  {z.name:<12} generator cpu {cpu_mean:4.1f}%   failures {nz:.0f}/{tot:.0f}   '
            f'bytes kv={bytes_by_arm.get("kv", 0) / 1e6:.1f}MB nokv={bytes_by_arm.get("nokv", 0) / 1e6:.1f}MB'
        )


if __name__ == '__main__':
    main()
