import { Command } from 'commander';
import Conf from 'conf';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, MockInstance, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';
import { consola } from '../lib/logger';
import { mkTempDir } from '../lib/mk-temp-dir';
import { getProjectConfig, ProjectConfigSchema } from '../lib/project-config';
import { program } from '../program';

import { logs, parseSSEEvent, tailLogs } from './logs';

let exitMock: MockInstance;
let stdoutWriteMock: MockInstance;

let tmpDir: string;
let cleanup: () => Promise<void>;
let config: Conf<ProjectConfigSchema>;

const projectUuid = '6b202364-10f3-11f1-8bc7-fe9b9d8b14ab';
const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';

const encoder = new TextEncoder();

const validLogEvent = {
  uuid: '0f258256-0a83-4704-a456-03e99b4445c2',
  project_uuid: projectUuid,
  request: { method: 'GET', url: 'https://example.com/test', status_code: 200 },
  logs: [{ timestamp: '2026-03-11T22:05:28.870Z', level: 'info', messages: ['hello world'] }],
  exceptions: [],
  timestamp: '2026-03-11T22:05:28.870Z',
};

const createSSEStream = (events: string[], closeDelay = 10) =>
  new ReadableStream({
    start(controller) {
      events.forEach((event) => {
        controller.enqueue(encoder.encode(event));
      });
      setTimeout(() => controller.close(), closeDelay);
    },
  });

// Creates a handler that serves SSE events on the first request,
// then returns 404 on subsequent requests to break the reconnect loop.
const createOneShotLogHandler = (events: string[], closeDelay = 10) => {
  let called = false;

  return http.get(
    'https://:apiHost/stores/:storeHash/v3/infrastructure/logs/:projectUuid/tail',
    () => {
      if (called) {
        return new HttpResponse(null, { status: 404, statusText: 'Not Found' });
      }

      called = true;

      return new HttpResponse(createSSEStream(events, closeDelay), {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      });
    },
  );
};

const callTailLogs = async (format: Parameters<typeof tailLogs>[4], events?: string[]) => {
  const sseEvents = events ?? [`data: ${JSON.stringify(validLogEvent)}\n\n`];

  server.use(createOneShotLogHandler(sseEvents));

  await tailLogs(projectUuid, storeHash, accessToken, apiHost, format).catch(() => {
    // Expected: tailLogs throws when the one-shot handler returns 404 on reconnect
  });
};

beforeAll(async () => {
  consola.mockTypes(() => vi.fn());
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  exitMock = vi.spyOn(process, 'exit').mockImplementation(() => null as never);
  stdoutWriteMock = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

  [tmpDir, cleanup] = await mkTempDir();

  vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);

  config = getProjectConfig();
});

afterEach(() => {
  vi.clearAllMocks();
  config.delete('storeHash');
  config.delete('accessToken');
  config.delete('projectUuid');
});

afterAll(async () => {
  await cleanup();
});

describe('command configuration', () => {
  test('logs is a properly configured Command with tail and query subcommands', () => {
    expect(logs).toBeInstanceOf(Command);
    expect(logs.name()).toBe('logs');
    expect(logs.description()).toBe('View logs from your deployed application.');

    const subcommands = logs.commands.map((c) => c.name());

    expect(subcommands).toContain('tail');
    expect(subcommands).toContain('query');
  });

  test('tail subcommand has correct options', () => {
    const tail = logs.commands.find((c) => c.name() === 'tail');

    expect(tail).toBeDefined();
    expect(tail?.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flags: '--store-hash <hash>' }),
        expect.objectContaining({ flags: '--access-token <token>' }),
        expect.objectContaining({
          flags: '--api-host <host>',
          defaultValue: 'api.bigcommerce.com',
        }),
        expect.objectContaining({ flags: '--project-uuid <uuid>' }),
        expect.objectContaining({ flags: '--format <format>', defaultValue: 'default' }),
      ]),
    );
  });

  test('query subcommand has correct options', () => {
    const query = logs.commands.find((c) => c.name() === 'query');

    expect(query).toBeDefined();
    expect(query?.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flags: '--store-hash <hash>' }),
        expect.objectContaining({ flags: '--access-token <token>' }),
        expect.objectContaining({ flags: '--api-host <host>' }),
        expect.objectContaining({ flags: '--project-uuid <uuid>' }),
      ]),
    );
  });
});

describe('parseSSEEvent', () => {
  test('extracts data from a single data line', () => {
    expect(parseSSEEvent('data: {"foo":"bar"}')).toBe('{"foo":"bar"}');
  });

  test('joins multiple data lines with newlines', () => {
    expect(parseSSEEvent('data: line1\ndata: line2')).toBe('line1\nline2');
  });

  test('ignores non-data SSE fields', () => {
    expect(parseSSEEvent('event: message\ndata: {"foo":"bar"}\nid: 123')).toBe('{"foo":"bar"}');
  });

  test('ignores SSE comments', () => {
    expect(parseSSEEvent(': this is a comment\ndata: {"foo":"bar"}')).toBe('{"foo":"bar"}');
  });

  test('returns null for events with no data lines', () => {
    expect(parseSSEEvent('event: ping')).toBeNull();
    expect(parseSSEEvent(': comment only')).toBeNull();
    expect(parseSSEEvent('')).toBeNull();
  });

  test('returns null for heartbeat events with empty data', () => {
    expect(parseSSEEvent('data: ')).toBeNull();
    expect(parseSSEEvent('data:')).toBeNull();
  });
});

describe('format: default', () => {
  test('logs timestamp, level, and message', async () => {
    await callTailLogs('default');

    expect(consola.info).toHaveBeenCalledWith('Tailing logs...');
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('[2026-03-11T22:05:28.870Z]'));
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('hello world'));
  });
});

describe('format: json', () => {
  test('writes raw JSON to stdout', async () => {
    await callTailLogs('json');

    expect(stdoutWriteMock).toHaveBeenCalledWith(
      expect.stringContaining('"uuid":"0f258256-0a83-4704-a456-03e99b4445c2"'),
    );
  });
});

describe('format: pretty', () => {
  test('logs pretty-printed JSON', async () => {
    await callTailLogs('pretty');

    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('"uuid"'));
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('"hello world"'));
  });

  test('preserves unknown fields via loose schema', async () => {
    const eventWithExtra = { ...validLogEvent, extra_field: 'should be preserved' };

    await callTailLogs('pretty', [`data: ${JSON.stringify(eventWithExtra)}\n\n`]);

    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('should be preserved'));
  });
});

describe('format: short', () => {
  test('logs only the message', async () => {
    await callTailLogs('short');

    expect(consola.log).toHaveBeenCalledWith('hello world');
  });
});

describe('format: request', () => {
  test('logs timestamp, level, request info, and message', async () => {
    await callTailLogs('request');

    expect(consola.log).toHaveBeenCalledWith(
      expect.stringContaining('GET https://example.com/test'),
    );
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('(200)'));
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('hello world'));
  });
});

describe('log event processing', () => {
  test.each([
    ['info', 'INFO'],
    ['warn', 'WARN'],
    ['error', 'ERROR'],
    ['debug', 'DEBUG'],
  ])('formats %s level as %s', async (level, expected) => {
    const event = { ...validLogEvent, logs: [{ ...validLogEvent.logs[0], level }] };

    await callTailLogs('default', [`data: ${JSON.stringify(event)}\n\n`]);

    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining(expected));
  });

  test('logs exceptions from the event', async () => {
    const event = {
      ...validLogEvent,
      exceptions: [{ message: 'something broke', stack: 'Error: something broke' }],
    };

    await callTailLogs('default', [`data: ${JSON.stringify(event)}\n\n`]);

    expect(consola.error).toHaveBeenCalledWith(
      expect.stringContaining('EXCEPTION'),
      expect.objectContaining({ message: 'something broke' }),
    );
  });

  test('serializes non-string messages as JSON', async () => {
    const event = {
      ...validLogEvent,
      logs: [{ ...validLogEvent.logs[0], messages: [{ nested: 'object' }, 42] }],
    };

    await callTailLogs('default', [`data: ${JSON.stringify(event)}\n\n`]);

    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('{"nested":"object"}'));
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('42'));
  });

  test('multiple events in a single chunk are all processed', async () => {
    const event1 = {
      ...validLogEvent,
      logs: [{ ...validLogEvent.logs[0], messages: ['first'] }],
    };
    const event2 = {
      ...validLogEvent,
      logs: [{ ...validLogEvent.logs[0], messages: ['second'] }],
    };

    await callTailLogs('default', [
      `data: ${JSON.stringify(event1)}\n\ndata: ${JSON.stringify(event2)}\n\n`,
    ]);

    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('first'));
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('second'));
  });
});

describe('suppressed log noise', () => {
  const imagesWarning = 'env.IMAGES binding is not defined';

  test('drops the OpenNext IMAGES binding warning from default format', async () => {
    const event = {
      ...validLogEvent,
      logs: [{ ...validLogEvent.logs[0], level: 'warn', messages: [imagesWarning] }],
    };

    await callTailLogs('default', [`data: ${JSON.stringify(event)}\n\n`]);

    expect(consola.log).not.toHaveBeenCalledWith(expect.stringContaining(imagesWarning));
  });

  test('keeps other log entries when only the IMAGES warning is suppressed', async () => {
    const event = {
      ...validLogEvent,
      logs: [
        { ...validLogEvent.logs[0], level: 'warn', messages: [imagesWarning] },
        { ...validLogEvent.logs[0], messages: ['hello world'] },
      ],
    };

    await callTailLogs('default', [`data: ${JSON.stringify(event)}\n\n`]);

    expect(consola.log).not.toHaveBeenCalledWith(expect.stringContaining(imagesWarning));
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('hello world'));
  });

  test('emits nothing for an event that is only suppressed noise', async () => {
    const event = {
      ...validLogEvent,
      logs: [{ ...validLogEvent.logs[0], level: 'warn', messages: [imagesWarning] }],
    };

    await callTailLogs('default', [`data: ${JSON.stringify(event)}\n\n`]);

    expect(consola.log).not.toHaveBeenCalled();
    expect(consola.error).not.toHaveBeenCalled();
  });

  test('still emits exceptions even when all log entries are suppressed', async () => {
    const event = {
      ...validLogEvent,
      logs: [{ ...validLogEvent.logs[0], level: 'warn', messages: [imagesWarning] }],
      exceptions: [{ message: 'something broke' }],
    };

    await callTailLogs('default', [`data: ${JSON.stringify(event)}\n\n`]);

    expect(consola.log).not.toHaveBeenCalledWith(expect.stringContaining(imagesWarning));
    expect(consola.error).toHaveBeenCalledWith(
      expect.stringContaining('EXCEPTION'),
      expect.objectContaining({ message: 'something broke' }),
    );
  });

  test('does not filter the IMAGES warning out of raw json output', async () => {
    const event = {
      ...validLogEvent,
      logs: [{ ...validLogEvent.logs[0], level: 'warn', messages: [imagesWarning] }],
    };

    await callTailLogs('json', [`data: ${JSON.stringify(event)}\n\n`]);

    expect(stdoutWriteMock).toHaveBeenCalledWith(expect.stringContaining(imagesWarning));
  });
});

describe('error handling', () => {
  test('silently ignores heartbeat events', async () => {
    await callTailLogs('default', [`data: \n\ndata: ${JSON.stringify(validLogEvent)}\n\n`]);

    expect(consola.warn).not.toHaveBeenCalled();
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('hello world'));
  });

  test('warns on invalid JSON in stream', async () => {
    await callTailLogs('default', [`data: {not valid json}\n\n`]);

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('Failed to parse log event'));
  });

  test('warns on valid JSON that does not match schema', async () => {
    await callTailLogs('default', [`data: {"valid":"json","but":"wrong schema"}\n\n`]);

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('Failed to parse log event'));
  });

  test('throws on fatal 4xx status codes', async () => {
    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/logs/:projectUuid/tail',
        () => new HttpResponse(null, { status: 404, statusText: 'Not Found' }),
      ),
    );

    await expect(tailLogs(projectUuid, storeHash, accessToken, apiHost, 'default')).rejects.toThrow(
      'Failed to open log stream: 404 Not Found',
    );
  });

  test('throws a re-auth error on fatal 401 unauthorized', async () => {
    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/logs/:projectUuid/tail',
        () => new HttpResponse(null, { status: 401, statusText: 'Unauthorized' }),
      ),
    );

    await expect(tailLogs(projectUuid, storeHash, accessToken, apiHost, 'default')).rejects.toThrow(
      'catalyst auth login',
    );
  });
});

describe('retry and reconnect', () => {
  test('retries on 5xx errors and throws after max retries', async () => {
    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/logs/:projectUuid/tail',
        () => new HttpResponse(null, { status: 502, statusText: 'Bad Gateway' }),
      ),
    );

    await expect(tailLogs(projectUuid, storeHash, accessToken, apiHost, 'default')).rejects.toThrow(
      'Failed to connect to log stream after 5 retries.',
    );

    // 4 warnings logged for attempts 1-4, then throw on attempt 5
    expect(consola.warn).toHaveBeenCalledTimes(4);
  });

  test('logs retry attempt number in warning messages', async () => {
    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/logs/:projectUuid/tail',
        () => new HttpResponse(null, { status: 503, statusText: 'Service Unavailable' }),
      ),
    );

    await expect(
      tailLogs(projectUuid, storeHash, accessToken, apiHost, 'default'),
    ).rejects.toThrow();

    expect(consola.warn).toHaveBeenCalledWith(
      expect.stringContaining('attempt 1/5'),
      expect.anything(),
    );
    expect(consola.warn).toHaveBeenCalledWith(
      expect.stringContaining('attempt 4/5'),
      expect.anything(),
    );
  });

  test('resets retry counter after a successful connection', async () => {
    let requestCount = 0;

    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/logs/:projectUuid/tail',
        () => {
          requestCount += 1;

          // First 3 requests: 502 errors (builds up retries to 3)
          if (requestCount <= 3) {
            return new HttpResponse(null, { status: 502, statusText: 'Bad Gateway' });
          }

          // 4th request: successful stream (resets retries to 0)
          if (requestCount === 4) {
            return new HttpResponse(
              createSSEStream([`data: ${JSON.stringify(validLogEvent)}\n\n`]),
              {
                status: 200,
                headers: { 'Content-Type': 'text/event-stream' },
              },
            );
          }

          // 5th+ requests: 502 again until retries are exhausted a second time
          return new HttpResponse(null, { status: 502, statusText: 'Bad Gateway' });
        },
      ),
    );

    await expect(tailLogs(projectUuid, storeHash, accessToken, apiHost, 'default')).rejects.toThrow(
      'Failed to connect to log stream after 5 retries.',
    );

    // 3 warnings before success + 4 warnings after success (throw on 5th retry)
    expect(consola.warn).toHaveBeenCalledTimes(7);
  });

  test('server disconnect does not increment retry counter', async () => {
    let requestCount = 0;

    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/logs/:projectUuid/tail',
        () => {
          requestCount += 1;

          // Return a stream that immediately errors to simulate server disconnect
          if (requestCount <= 3) {
            const stream = new ReadableStream({
              start(controller) {
                controller.error(new TypeError('terminated'));
              },
            });

            return new HttpResponse(stream, {
              status: 200,
              headers: { 'Content-Type': 'text/event-stream' },
            });
          }

          // After 3 server disconnects, return 404 to break the loop
          return new HttpResponse(null, { status: 404, statusText: 'Not Found' });
        },
      ),
    );

    await expect(tailLogs(projectUuid, storeHash, accessToken, apiHost, 'default')).rejects.toThrow(
      'Failed to open log stream: 404 Not Found',
    );

    // Server disconnect warnings should NOT contain "attempt X/5"
    expect(consola.warn).toHaveBeenCalledTimes(3);
    expect(consola.warn).toHaveBeenCalledWith('Log stream closed by server, reconnecting...');
  });

  test(
    'reconnects when the stream stalls without emitting any data',
    { timeout: 3000 },
    async () => {
      let requestCount = 0;
      const ttlMs = 200;

      // Stream that stays open but never enqueues — simulates an API proxy
      // half-closing the socket: bytes stop arriving but no FIN or error is
      // surfaced, so reader.read() would otherwise block forever.
      const createStalledStream = () =>
        new ReadableStream({
          start() {
            // intentionally empty
          },
        });

      server.use(
        http.get(
          'https://:apiHost/stores/:storeHash/v3/infrastructure/logs/:projectUuid/tail',
          () => {
            requestCount += 1;

            if (requestCount <= 2) {
              return new HttpResponse(createStalledStream(), {
                status: 200,
                headers: { 'Content-Type': 'text/event-stream' },
              });
            }

            return new HttpResponse(null, { status: 404, statusText: 'Not Found' });
          },
        ),
      );

      await expect(
        tailLogs(projectUuid, storeHash, accessToken, apiHost, 'default', ttlMs),
      ).rejects.toThrow('Failed to open log stream: 404 Not Found');

      expect(requestCount).toBe(3);
      expect(consola.warn).toHaveBeenCalledWith('Log stream idle, reconnecting...');
    },
  );

  test('reconnects when connection TTL is reached', { timeout: 3000 }, async () => {
    let requestCount = 0;
    const ttlMs = 200;

    // Creates a stream that sends data every 30ms via setInterval and never closes.
    // The cancel callback cleans up the interval so reader.cancel() resolves.
    const createOpenEndedStream = () => {
      let intervalId: ReturnType<typeof setInterval>;

      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(validLogEvent)}\n\n`));
          intervalId = setInterval(() => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(validLogEvent)}\n\n`));
          }, 30);
        },
        cancel() {
          clearInterval(intervalId);
        },
      });
    };

    server.use(
      http.get(
        'https://:apiHost/stores/:storeHash/v3/infrastructure/logs/:projectUuid/tail',
        () => {
          requestCount += 1;

          if (requestCount <= 2) {
            return new HttpResponse(createOpenEndedStream(), {
              status: 200,
              headers: { 'Content-Type': 'text/event-stream' },
            });
          }

          // 3rd request: return 404 to break the reconnect loop
          return new HttpResponse(null, { status: 404, statusText: 'Not Found' });
        },
      ),
    );

    await expect(
      tailLogs(projectUuid, storeHash, accessToken, apiHost, 'default', ttlMs),
    ).rejects.toThrow('Failed to open log stream: 404 Not Found');

    // Should have connected 3 times: 2 TTL-triggered reconnects + final 404
    expect(requestCount).toBe(3);

    // Events from both successful connections should have been processed
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('hello world'));
  });
});

describe('credential resolution', () => {
  test('falls back to project.json for storeHash and accessToken', async () => {
    config.set('storeHash', storeHash);
    config.set('accessToken', accessToken);

    server.use(createOneShotLogHandler([`data: ${JSON.stringify(validLogEvent)}\n\n`]));

    await program.parseAsync(['node', 'catalyst', 'logs', 'tail', '--project-uuid', projectUuid]);

    expect(consola.info).toHaveBeenCalledWith('Tailing logs...');
    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining('hello world'));
  });

  test('exits with error when no credentials are provided', async () => {
    const savedStoreHash = process.env.CATALYST_STORE_HASH;
    const savedAccessToken = process.env.CATALYST_ACCESS_TOKEN;

    delete process.env.CATALYST_STORE_HASH;
    delete process.env.CATALYST_ACCESS_TOKEN;

    await program.parseAsync(['node', 'catalyst', 'logs', 'tail', '--project-uuid', projectUuid]);

    if (savedStoreHash !== undefined) process.env.CATALYST_STORE_HASH = savedStoreHash;
    if (savedAccessToken !== undefined) process.env.CATALYST_ACCESS_TOKEN = savedAccessToken;

    expect(consola.error).toHaveBeenCalledWith('Missing credentials.');
    expect(consola.info).toHaveBeenCalledWith(
      'Run `catalyst auth login`, or provide --store-hash and --access-token flags (or set CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables).',
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});

describe('query subcommand', () => {
  test('exits with error as not yet implemented', async () => {
    await program.parseAsync([
      'node',
      'catalyst',
      'logs',
      'query',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
    ]);

    expect(consola.error).toHaveBeenCalledWith('The query command is not yet implemented.');
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('exits with missing credentials error when none are provided', async () => {
    const savedStoreHash = process.env.CATALYST_STORE_HASH;
    const savedAccessToken = process.env.CATALYST_ACCESS_TOKEN;

    delete process.env.CATALYST_STORE_HASH;
    delete process.env.CATALYST_ACCESS_TOKEN;

    await expect(program.parseAsync(['node', 'catalyst', 'logs', 'query'])).rejects.toThrow(
      'Missing credentials',
    );

    if (savedStoreHash !== undefined) process.env.CATALYST_STORE_HASH = savedStoreHash;
    if (savedAccessToken !== undefined) process.env.CATALYST_ACCESS_TOKEN = savedAccessToken;

    expect(consola.error).toHaveBeenCalledWith('Missing credentials.');
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});

describe('program integration', () => {
  test('logs tail is the default subcommand', async () => {
    server.use(createOneShotLogHandler([`data: ${JSON.stringify(validLogEvent)}\n\n`]));

    await program.parseAsync([
      'node',
      'catalyst',
      'logs',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--project-uuid',
      projectUuid,
    ]);

    expect(consola.info).toHaveBeenCalledWith('Tailing logs...');
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('logs tail with --format json', async () => {
    server.use(createOneShotLogHandler([`data: ${JSON.stringify(validLogEvent)}\n\n`]));

    await program.parseAsync([
      'node',
      'catalyst',
      'logs',
      'tail',
      '--store-hash',
      storeHash,
      '--access-token',
      accessToken,
      '--project-uuid',
      projectUuid,
      '--format',
      'json',
    ]);

    expect(consola.info).toHaveBeenCalledWith('Tailing logs...');
    expect(stdoutWriteMock).toHaveBeenCalled();
  });
});
