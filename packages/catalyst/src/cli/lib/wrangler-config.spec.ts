import { expect, test } from 'vitest';

import { getCompatibilityDate, getWranglerConfig } from './wrangler-config';

test('returns a config with name identical to worker self reference service', () => {
  const config = getWranglerConfig('uuid');

  expect(config.name).toBe(`project-uuid`);
  expect(
    config.services.find((service) => service.binding === 'WORKER_SELF_REFERENCE')?.service,
  ).toBe(`project-uuid`);
});

test('compatibility date is one month before the given date', () => {
  expect(getCompatibilityDate(new Date('2026-06-11T15:00:00Z'))).toBe('2026-05-11');
});

test('compatibility date handles month-end normalization', () => {
  // May 31 minus one month lands in early May (no April 31), still a valid date.
  expect(getCompatibilityDate(new Date('2026-05-31T12:00:00Z'))).toBe('2026-05-01');
  expect(getCompatibilityDate(new Date('2026-01-15T00:00:00Z'))).toBe('2025-12-15');
});

test('config uses a YYYY-MM-DD compatibility date', () => {
  expect(getWranglerConfig('uuid').compatibility_date).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
});

test('binds the routing cache KV namespace as CATALYST_ROUTES_KV', () => {
  expect(getWranglerConfig('uuid').kv_namespaces).toContainEqual(
    expect.objectContaining({ binding: 'CATALYST_ROUTES_KV' }),
  );
});

test('routing cache KV namespace id is local-only, never a real namespace id', () => {
  const routesKv = getWranglerConfig('uuid').kv_namespaces.find(
    (namespace) => namespace.binding === 'CATALYST_ROUTES_KV',
  );

  // A provisioned Cloudflare KV namespace id is always 32 lowercase hex chars.
  // Anything matching that shape here would mean local dev could reach a real
  // store's routing cache.
  expect(routesKv?.id).not.toMatch(/^[0-9a-f]{32}$/u);

  // The id is also independent of the project — nothing per-project should
  // leak into the local placeholder.
  expect(routesKv?.id).toBe(
    getWranglerConfig('a-different-uuid').kv_namespaces.find(
      (namespace) => namespace.binding === 'CATALYST_ROUTES_KV',
    )?.id,
  );
});
