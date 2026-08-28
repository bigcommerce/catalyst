import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';

import { UserActionableError } from './errors';
import { consola } from './logger';
import {
  formatLogEntry,
  formatV3Error,
  isRequestLogEntry,
  queryLogs,
  resolveTimeWindow,
} from './observability';

const projectUuid = '6b202364-10f3-11f1-8bc7-fe9b9d8b14ab';
const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';

const logsUrl = 'https://:apiHost/stores/:storeHash/v3/infrastructure/logs/:projectUuid';

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('resolveTimeWindow', () => {
  const nowMs = Date.parse('2026-06-11T12:00:00Z');

  test('throws when both since and start are missing', () => {
    expect(() => resolveTimeWindow({ end: '2026-06-01T00:00:00Z' })).toThrow(
      'Provide a time window with --since <duration> or --start <time>.',
    );
  });

  test('bad time-window input is user-actionable (no support/correlation framing)', () => {
    expect(() => resolveTimeWindow({ since: 'yesterday' })).toThrow(UserActionableError);
  });

  test('defaults end to now when omitted', () => {
    expect(resolveTimeWindow({ start: '2026-06-11T00:00:00Z' }, nowMs)).toEqual({
      start: '2026-06-11T00:00:00Z',
      end: '2026-06-11T12:00:00.000Z',
    });
  });

  test('computes start from since relative to now', () => {
    expect(resolveTimeWindow({ since: '6h' }, nowMs)).toEqual({
      start: '2026-06-11T06:00:00.000Z',
      end: '2026-06-11T12:00:00.000Z',
    });
  });

  test('computes start from since relative to an explicit end', () => {
    expect(resolveTimeWindow({ since: '30m', end: '2026-06-10T12:00:00Z' }, nowMs)).toEqual({
      start: '2026-06-10T11:30:00.000Z',
      end: '2026-06-10T12:00:00Z',
    });
  });

  test('supports day-unit durations', () => {
    expect(resolveTimeWindow({ since: '2d' }, nowMs)).toEqual({
      start: '2026-06-09T12:00:00.000Z',
      end: '2026-06-11T12:00:00.000Z',
    });
  });

  test('throws on an unparseable since value', () => {
    expect(() => resolveTimeWindow({ since: 'yesterday' })).toThrow('Invalid --since value');
    expect(() => resolveTimeWindow({ since: '1w' })).toThrow('Invalid --since value');
  });

  test('throws when since exceeds 7 days', () => {
    expect(() => resolveTimeWindow({ since: '8d' })).toThrow('must not exceed 7 days');
  });

  test('throws on an unparseable start value', () => {
    expect(() => resolveTimeWindow({ start: 'not-a-date', end: '2026-06-01T00:00:00Z' })).toThrow(
      'Invalid --start value',
    );
  });

  test('throws on an unparseable end value', () => {
    expect(() => resolveTimeWindow({ start: '2026-06-01T00:00:00Z', end: 'nope' })).toThrow(
      'Invalid --end value',
    );
  });

  test('throws when the window is out of order', () => {
    expect(() =>
      resolveTimeWindow({ start: '2026-06-02T00:00:00Z', end: '2026-06-01T00:00:00Z' }),
    ).toThrow('--start must be before or equal to --end');
  });

  test('throws when the window exceeds 7 days', () => {
    expect(() =>
      resolveTimeWindow({ start: '2026-06-01T00:00:00Z', end: '2026-06-09T00:00:01Z' }),
    ).toThrow('must not exceed 7 days');
  });

  test('passes ISO-8601 values through unchanged', () => {
    expect(
      resolveTimeWindow({ start: '2026-06-01T00:00:00Z', end: '2026-06-02T00:00:00Z' }),
    ).toEqual({ start: '2026-06-01T00:00:00Z', end: '2026-06-02T00:00:00Z' });
  });

  test('passes Unix epoch (seconds) values through unchanged', () => {
    expect(resolveTimeWindow({ start: '1717200000', end: '1717203600' })).toEqual({
      start: '1717200000',
      end: '1717203600',
    });
  });

  test('accepts an exactly 7-day window', () => {
    expect(
      resolveTimeWindow({ start: '2026-06-01T00:00:00Z', end: '2026-06-08T00:00:00Z' }),
    ).toEqual({ start: '2026-06-01T00:00:00Z', end: '2026-06-08T00:00:00Z' });
  });
});

describe('formatLogEntry', () => {
  test('formats the default line as [timestamp] [LEVEL] message, like tail', () => {
    const line = formatLogEntry({
      timestamp: '2026-06-01T12:34:56.789Z',
      level: 'error',
      messages: ['boom', 'happened'],
      request: { method: 'GET', url: '/cart', status_code: 500 },
    });

    expect(line).toContain('[2026-06-01T12:34:56.789Z]');
    expect(line).toContain('ERROR');
    expect(line).toContain('boom happened');
    // The default format omits request details — those only show in `request`.
    expect(line).not.toContain('/cart');
  });

  test('uses the raw UTC ISO-8601 timestamp in brackets', () => {
    const line = formatLogEntry({
      timestamp: '2026-06-01T12:34:56.789Z',
      level: 'info',
      messages: ['hi'],
    });

    expect(line).toContain('[2026-06-01T12:34:56.789Z]');
  });

  test('includes request method, URL, and status in the request format', () => {
    const line = formatLogEntry(
      {
        timestamp: '2026-06-01T12:34:56.789Z',
        level: 'error',
        messages: ['boom'],
        request: { method: 'GET', url: '/cart', status_code: 500 },
      },
      'request',
    );

    expect(line).toContain('GET /cart (500)');
    expect(line).toContain('boom');
    // Order is [timestamp] request [LEVEL] message.
    expect(line.indexOf('GET /cart')).toBeLessThan(line.indexOf('ERROR'));
    expect(line.indexOf('ERROR')).toBeLessThan(line.indexOf('boom'));
  });

  test('prints only the message in the short format', () => {
    const line = formatLogEntry(
      {
        timestamp: '2026-06-01T12:34:56.789Z',
        level: 'error',
        messages: ['just the message'],
        request: { method: 'GET', url: '/cart', status_code: 500 },
      },
      'short',
    );

    expect(line).toBe('just the message');
  });

  test('marks exceptions with the exception name', () => {
    const line = formatLogEntry({
      timestamp: '2026-06-01T12:34:56.789Z',
      level: 'error',
      messages: ['Unhandled exception'],
      is_exception: true,
      exception_name: 'TypeError',
    });

    expect(line).toContain('[TypeError]');
  });

  test('skips the exception marker when the message already contains the name', () => {
    const line = formatLogEntry({
      timestamp: '2026-06-01T12:34:56.789Z',
      level: 'error',
      messages: ['BigCommerceAPIError: \n    BigCommerce API returned 530\n    \n    '],
      is_exception: true,
      exception_name: 'BigCommerceAPIError',
    });

    expect(line).not.toContain('[BigCommerceAPIError]');
    expect(line).toContain('BigCommerceAPIError: BigCommerce API returned 530');
  });

  test('treats <*> placeholders in the exception name as wildcards', () => {
    const line = formatLogEntry({
      timestamp: '2026-06-01T12:34:56.789Z',
      level: 'error',
      messages: ['\n    BigCommerce API returned 530\n    \n    '],
      is_exception: true,
      exception_name: 'BigCommerce API returned <*>',
    });

    expect(line).not.toContain('[BigCommerce API returned <*>]');
  });

  test('collapses embedded newlines and indentation into single spaces', () => {
    const line = formatLogEntry({
      timestamp: '2026-06-01T12:34:56.789Z',
      level: 'error',
      messages: ['first\n    second\n    \n    ', 'third'],
    });

    expect(line).not.toContain('\n');
    expect(line).toContain('first second third');
  });

  test('omits the status code when it is the 0 sentinel', () => {
    const line = formatLogEntry(
      {
        timestamp: '2026-06-01T12:34:56.789Z',
        level: 'error',
        messages: ['boom'],
        request: { method: 'GET', url: '', status_code: 0 },
      },
      'request',
    );

    expect(line).toContain('GET');
    expect(line).not.toContain('(0)');
  });

  test('stringifies non-string messages', () => {
    const line = formatLogEntry({
      timestamp: '2026-06-01T12:34:56.789Z',
      level: 'info',
      messages: ['payload', { code: 530 }],
    });

    expect(line).toContain('payload {"code":530}');
  });

  test('renders unrecognized levels without color mapping', () => {
    const line = formatLogEntry({
      timestamp: '2026-06-01T12:34:56.789Z',
      level: 'log',
      messages: ['hi'],
    });

    expect(line).toContain('LOG');
  });

  test('renders a placeholder time when the timestamp is missing', () => {
    const line = formatLogEntry({ level: 'info', messages: ['hi'] });

    expect(line).toContain('[unknown]');
    expect(line).toContain('INFO');
  });

  test('handles a null request and missing level gracefully', () => {
    const line = formatLogEntry({ messages: ['orphan log'], request: null }, 'request');

    expect(line).toContain('UNKNOWN');
    expect(line).toContain('orphan log');
  });

  test('renders a bare request line for request rows in the request format', () => {
    const line = formatLogEntry(
      {
        timestamp: '2026-06-01T12:34:56.789Z',
        entry_type: 'request',
        level: 'info',
        messages: ['GET https://store.example/foo'],
        request: { method: 'GET', url: 'https://store.example/foo', status_code: 200 },
      },
      'request',
    );

    // No level bracket and no message — the message only duplicates the
    // request details.
    expect(line).toBe('[2026-06-01T12:34:56.789Z] GET https://store.example/foo (200)');
  });
});

describe('isRequestLogEntry', () => {
  test('trusts entry_type=request even when the message differs from method+url', () => {
    expect(
      isRequestLogEntry({
        entry_type: 'request',
        messages: ['something else entirely'],
        request: { method: 'GET', url: '/cart', status_code: 200 },
      }),
    ).toBe(true);
  });

  test('trusts entry_type=log even when the message equals method+url', () => {
    expect(
      isRequestLogEntry({
        entry_type: 'log',
        messages: ['GET /cart'],
        request: { method: 'GET', url: '/cart', status_code: 200 },
      }),
    ).toBe(false);
  });

  test('falls back to the message heuristic when entry_type is absent (older API)', () => {
    expect(
      isRequestLogEntry({
        messages: ['GET https://store.example/foo'],
        request: { method: 'GET', url: 'https://store.example/foo', status_code: 200 },
      }),
    ).toBe(true);
  });

  test('returns false for real application output or missing request details', () => {
    expect(
      isRequestLogEntry({
        messages: ['rendering /cart failed'],
        request: { method: 'GET', url: '/cart', status_code: 500 },
      }),
    ).toBe(false);
    expect(isRequestLogEntry({ messages: ['GET /cart'] })).toBe(false);
  });
});

describe('formatV3Error', () => {
  test('combines title and field errors', () => {
    expect(
      formatV3Error({
        title: 'Invalid request.',
        errors: { timeframe: 'must span at most 7 days' },
      }),
    ).toBe('Invalid request. (timeframe: must span at most 7 days)');
  });

  test('returns the title alone when there are no field errors', () => {
    expect(formatV3Error({ title: 'Invalid request.', errors: {} })).toBe('Invalid request.');
  });

  test('returns field errors alone when there is no title', () => {
    expect(formatV3Error({ errors: { start: 'is required' } })).toBe('start: is required');
  });

  test('returns undefined for an unrecognizable body', () => {
    expect(formatV3Error(null)).toBeUndefined();
    expect(formatV3Error('oops')).toBeUndefined();
  });
});

describe('queryLogs', () => {
  test('returns the parsed page on success', async () => {
    server.use(
      http.get(logsUrl, () =>
        HttpResponse.json({
          data: [
            {
              id: '01HX',
              timestamp: '2026-06-01T12:34:56.789Z',
              level: 'error',
              messages: ['boom'],
              request: { method: 'GET', url: '/cart', status_code: 500 },
            },
          ],
          meta: {
            cursor_pagination: {
              count: 1,
              per_page: 1,
              start_cursor: 'cursor_start',
              end_cursor: 'cursor_end',
              links: { next: '?after=cursor_end' },
            },
          },
        }),
      ),
    );

    const result = await queryLogs(projectUuid, storeHash, accessToken, apiHost, {
      start: '2026-06-01T00:00:00Z',
      end: '2026-06-02T00:00:00Z',
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].level).toBe('error');
    expect(result.meta?.cursor_pagination?.links?.next).toBe('?after=cursor_end');
    expect(result.meta?.cursor_pagination?.end_cursor).toBe('cursor_end');
  });

  test('tolerates a response without meta (pre-pagination backend)', async () => {
    server.use(http.get(logsUrl, () => HttpResponse.json({ data: [] })));

    const result = await queryLogs(projectUuid, storeHash, accessToken, apiHost, {
      start: '2026-06-01T00:00:00Z',
      end: '2026-06-02T00:00:00Z',
    });

    expect(result.data).toHaveLength(0);
    expect(result.meta?.cursor_pagination?.end_cursor).toBeUndefined();
  });

  test('tolerates null cursors on an empty page', async () => {
    server.use(
      http.get(logsUrl, () =>
        HttpResponse.json({
          data: [],
          meta: {
            cursor_pagination: {
              has_next_page: false,
              has_prev_page: true,
              start_cursor: null,
              end_cursor: null,
            },
          },
        }),
      ),
    );

    const result = await queryLogs(projectUuid, storeHash, accessToken, apiHost, {
      start: '2026-06-01T00:00:00Z',
      end: '2026-06-02T00:00:00Z',
    });

    expect(result.meta?.cursor_pagination?.has_next_page).toBe(false);
    expect(result.meta?.cursor_pagination?.end_cursor).toBeNull();
  });

  test('accepts levels outside the known set and non-string messages', async () => {
    server.use(
      http.get(logsUrl, () =>
        HttpResponse.json({
          data: [
            {
              id: '01HX',
              timestamp: '2026-06-01T12:34:56.789Z',
              level: 'log',
              messages: ['payload', { code: 530 }],
            },
          ],
          meta: {
            cursor_pagination: { count: 1, per_page: 50, start_cursor: null, end_cursor: null },
          },
        }),
      ),
    );

    const result = await queryLogs(projectUuid, storeHash, accessToken, apiHost, {
      start: '2026-06-01T00:00:00Z',
      end: '2026-06-02T00:00:00Z',
    });

    expect(result.data[0].level).toBe('log');
  });

  test('forwards filters as query params, including colon params', async () => {
    let captured: URLSearchParams | undefined;

    server.use(
      http.get(logsUrl, ({ request }) => {
        captured = new URL(request.url).searchParams;

        return HttpResponse.json({
          data: [],
          meta: {
            cursor_pagination: { count: 0, per_page: 50, start_cursor: null, end_cursor: null },
          },
        });
      }),
    );

    await queryLogs(projectUuid, storeHash, accessToken, apiHost, {
      start: '2026-06-01T00:00:00Z',
      end: '2026-06-02T00:00:00Z',
      method: 'GET',
      statusCode: 500,
      urlLike: '/cart',
      levelMin: 'warn',
    });

    expect(captured?.get('start')).toBe('2026-06-01T00:00:00Z');
    expect(captured?.get('end')).toBe('2026-06-02T00:00:00Z');
    expect(captured?.get('method')).toBe('GET');
    expect(captured?.get('status_code')).toBe('500');
    expect(captured?.get('url:like')).toBe('/cart');
    expect(captured?.get('level:min')).toBe('warn');
    expect(captured?.get('limit')).toBeNull();
    expect(captured?.get('after')).toBeNull();
    expect(captured?.get('before')).toBeNull();
  });

  test('forwards limit and cursor params', async () => {
    let captured: URLSearchParams | undefined;

    server.use(
      http.get(logsUrl, ({ request }) => {
        captured = new URL(request.url).searchParams;

        return HttpResponse.json({ data: [] });
      }),
    );

    await queryLogs(projectUuid, storeHash, accessToken, apiHost, {
      start: '2026-06-01T00:00:00Z',
      end: '2026-06-02T00:00:00Z',
      limit: 25,
      after: 'cursor_end',
    });

    expect(captured?.get('limit')).toBe('25');
    expect(captured?.get('after')).toBe('cursor_end');
    expect(captured?.get('before')).toBeNull();
  });

  test('forwards entryType as the entry_type query param', async () => {
    let captured: URLSearchParams | undefined;

    server.use(
      http.get(logsUrl, ({ request }) => {
        captured = new URL(request.url).searchParams;

        return HttpResponse.json({ data: [] });
      }),
    );

    await queryLogs(projectUuid, storeHash, accessToken, apiHost, {
      start: '2026-06-01T00:00:00Z',
      end: '2026-06-02T00:00:00Z',
      entryType: 'log',
    });

    expect(captured?.get('entry_type')).toBe('log');
  });

  test('forwards a before cursor', async () => {
    let captured: URLSearchParams | undefined;

    server.use(
      http.get(logsUrl, ({ request }) => {
        captured = new URL(request.url).searchParams;

        return HttpResponse.json({ data: [] });
      }),
    );

    await queryLogs(projectUuid, storeHash, accessToken, apiHost, {
      start: '2026-06-01T00:00:00Z',
      end: '2026-06-02T00:00:00Z',
      before: 'cursor_start',
    });

    expect(captured?.get('before')).toBe('cursor_start');
    expect(captured?.get('after')).toBeNull();
  });

  test('maps 401 to a re-auth error', async () => {
    server.use(http.get(logsUrl, () => new HttpResponse(null, { status: 401 })));

    await expect(
      queryLogs(projectUuid, storeHash, accessToken, apiHost, {
        start: '2026-06-01T00:00:00Z',
        end: '2026-06-02T00:00:00Z',
      }),
    ).rejects.toThrow('catalyst auth login');
  });

  test('maps 403 to an API-not-enabled error', async () => {
    server.use(http.get(logsUrl, () => new HttpResponse(null, { status: 403 })));

    await expect(
      queryLogs(projectUuid, storeHash, accessToken, apiHost, {
        start: '2026-06-01T00:00:00Z',
        end: '2026-06-02T00:00:00Z',
      }),
    ).rejects.toThrow('Infrastructure Logs API not enabled');
  });

  test('maps 404 to a project-not-found error', async () => {
    server.use(http.get(logsUrl, () => new HttpResponse(null, { status: 404 })));

    const error = await queryLogs(projectUuid, storeHash, accessToken, apiHost, {
      start: '2026-06-01T00:00:00Z',
      end: '2026-06-02T00:00:00Z',
    }).catch((err: unknown) => err);

    // A 4xx is a clear, user-actionable response — no Correlation ID/support framing.
    expect(error).toBeInstanceOf(UserActionableError);
    expect(error).toHaveProperty('message', expect.stringContaining('Project not found'));
  });

  test('surfaces the v3 error message on 422', async () => {
    server.use(
      http.get(logsUrl, () =>
        HttpResponse.json(
          {
            status: 422,
            title: 'Invalid request.',
            errors: { timeframe: 'must span at most 7 days' },
          },
          { status: 422 },
        ),
      ),
    );

    await expect(
      queryLogs(projectUuid, storeHash, accessToken, apiHost, {
        start: '2026-06-01T00:00:00Z',
        end: '2026-06-02T00:00:00Z',
      }),
    ).rejects.toThrow('Invalid request. (timeframe: must span at most 7 days)');
  });

  test('throws a generic error on other non-ok responses', async () => {
    server.use(
      http.get(logsUrl, () => new HttpResponse(null, { status: 500, statusText: 'Server Error' })),
    );

    const error = await queryLogs(projectUuid, storeHash, accessToken, apiHost, {
      start: '2026-06-01T00:00:00Z',
      end: '2026-06-02T00:00:00Z',
    }).catch((err: unknown) => err);

    // A 5xx is a server-side failure worth escalating, so it stays a plain Error
    // and keeps the top-level Correlation ID + support framing.
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(UserActionableError);
    expect(error).toHaveProperty(
      'message',
      'Failed to fetch logs: Something went wrong on our end. Please try again. If the issue persists, contact support.',
    );
  });
});
