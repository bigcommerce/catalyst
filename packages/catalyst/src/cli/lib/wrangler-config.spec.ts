import { expect, test } from 'vitest';

import { getWranglerConfig } from './wrangler-config';

test('returns a config with name identical to worker self reference service', () => {
  const config = getWranglerConfig('uuid', 'kv-namespace-id');

  expect(config.name).toBe(`project-uuid`);
  expect(
    config.services.find((service) => service.binding === 'WORKER_SELF_REFERENCE')?.service,
  ).toBe(`project-uuid`);
});
