import { beforeEach, describe, expect, it, vi } from 'vitest';

import { beforeRequest } from './before-request';

const { mockHeaders } = vi.hoisted(() => ({ mockHeaders: vi.fn() }));

vi.mock('next/headers', () => ({ headers: mockHeaders }));
vi.mock('next-intl/server', () => ({ getLocale: () => Promise.resolve('en') }));
vi.mock('./correlation-id', () => ({ getCorrelationId: () => 'correlation-id' }));

describe('beforeRequest', () => {
  beforeEach(() => {
    mockHeaders.mockReset();
    mockHeaders.mockResolvedValue(new Headers({ 'X-Forwarded-For': '203.0.113.7' }));
  });

  it.each(['no-store', 'no-cache'] as const)('forwards the shopper IP for %s', async (cache) => {
    const { headers } = await beforeRequest({ cache });

    expect(headers).toEqual({
      'X-Forwarded-For': '203.0.113.7',
      'True-Client-IP': '203.0.113.7',
      'X-Correlation-ID': 'correlation-id',
      'Accept-Language': 'en',
    });
  });

  it('does not forward the shopper IP for cached requests', async () => {
    const { headers } = await beforeRequest({ next: { revalidate: 3600 } });

    expect(headers).toEqual({ 'Accept-Language': 'en' });
    expect(mockHeaders).not.toHaveBeenCalled();
  });
});
