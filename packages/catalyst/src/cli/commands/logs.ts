import { Command, Option } from 'commander';
import { colorize } from 'consola/utils';
import { z } from 'zod';

import { consola } from '../lib/logger';
import { getProjectConfig } from '../lib/project-config';
import { resolveCredentials } from '../lib/resolve-credentials';
import {
  accessTokenOption,
  apiHostOption,
  projectUuidOption,
  resolveProjectUuid,
  storeHashOption,
} from '../lib/shared-options';
import { Telemetry } from '../lib/telemetry';

type LogFormat = 'json' | 'pretty' | 'default' | 'short' | 'request';

const telemetry = new Telemetry();

const DEFAULT_CONNECTION_TTL_MS = 1 * 60 * 1000; // 1 minute
const MAX_RETRIES = 5;

const isFatalStatusCode = (status: number) => status >= 400 && status < 500;

const LEVEL_COLORS: Record<string, Parameters<typeof colorize>[0]> = {
  INFO: 'green',
  WARN: 'yellow',
  ERROR: 'red',
  DEBUG: 'gray',
};

const LogEventSchema = z
  .object({
    uuid: z.string(),
    project_uuid: z.string(),
    request: z.object({
      method: z.string(),
      url: z.string(),
      status_code: z.number(),
    }),
    logs: z.array(
      z.object({
        timestamp: z.string(),
        level: z.string(),
        messages: z.array(z.unknown()),
      }),
    ),
    exceptions: z.array(z.unknown()),
    timestamp: z.string(),
  })
  .loose();

class StreamError extends Error {
  fatal: boolean;

  constructor(message: string, fatal: boolean) {
    super(message);
    this.fatal = fatal;
  }
}

const formatMessages = (messages: unknown[]) =>
  messages.map((m) => (typeof m === 'string' ? m : JSON.stringify(m))).join(' ');

const formatLogEvent = (
  event: z.infer<typeof LogEventSchema>,
  format: 'default' | 'short' | 'request',
) => {
  const { request, logs: logEntries, exceptions } = event;

  logEntries.forEach((entry) => {
    const msg = formatMessages(entry.messages);
    const level = entry.level.toUpperCase();
    const coloredLevel = colorize(LEVEL_COLORS[level] ?? 'white', level);

    switch (format) {
      case 'short':
        consola.log(msg);
        break;

      case 'request':
        consola.log(
          `[${entry.timestamp}] [${coloredLevel}] ${request.method} ${request.url}` +
            ` (${request.status_code}) ${msg}`,
        );
        break;

      default:
        consola.log(`[${entry.timestamp}] [${coloredLevel}] ${msg}`);
        break;
    }
  });

  exceptions.forEach((exception) => {
    consola.error(`[${event.timestamp}] EXCEPTION`, exception);
  });
};

export const parseSSEEvent = (raw: string): string | null => {
  const joined = raw
    .split('\n')
    .flatMap((line) => (line.startsWith('data:') ? [line.slice(5).trim()] : []))
    .join('\n');

  return joined.length > 0 ? joined : null;
};

const processLogEvent = (event: string, format: LogFormat) => {
  if (format === 'json') {
    process.stdout.write(`${event}\n`);

    return;
  }

  try {
    const parsed: unknown = JSON.parse(event);
    const logEvent = LogEventSchema.parse(parsed);

    if (format === 'pretty') {
      consola.log(JSON.stringify(logEvent, null, 2));
    } else {
      formatLogEvent(logEvent, format);
    }
  } catch {
    consola.warn(`Failed to parse log event: ${event}`);
  }
};

type TimeoutRaceResult<T> = { kind: 'value'; value: T } | { kind: 'timeout' };

// Races a promise against a timer so a hung `reader.read()` doesn't block the
// read pump. Without this, the connection TTL check never runs when the API
// proxy half-closes the socket — bytes stop arriving but no FIN/error
// surfaces, so the read promise stays pending forever.
const raceWithTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<TimeoutRaceResult<T>> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<TimeoutRaceResult<T>>((resolve) => {
    timeoutHandle = setTimeout(() => resolve({ kind: 'timeout' }), timeoutMs);
  });

  try {
    return await Promise.race([
      promise.then((value): TimeoutRaceResult<T> => ({ kind: 'value', value })),
      timeoutPromise,
    ]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
};

const openLogStream = async (
  projectUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
) => {
  const response = await fetch(
    `https://${apiHost}/stores/${storeHash}/v3/infrastructure/logs/${projectUuid}/tail`,
    {
      method: 'GET',
      headers: {
        'X-Auth-Token': accessToken,
        Accept: 'text/event-stream',
        Connection: 'keep-alive',
      },
    },
  );

  if (!response.ok) {
    throw new StreamError(
      `Failed to open log stream: ${response.status} ${response.statusText}`,
      isFatalStatusCode(response.status),
    );
  }

  const reader = response.body?.getReader();

  if (!reader) {
    throw new StreamError('Failed to read log stream.', true);
  }

  return reader;
};

// Reasons the read pump stops on its own (vs. throwing). The outer reconnect
// loop maps each to a user-facing message — or silence — and opens a fresh
// stream.
type Rotation = 'ttl' | 'idle-timeout' | 'stream-done';

const pumpUntilRotation = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  format: LogFormat,
  connectionTtlMs: number,
): Promise<Rotation> => {
  const decoder = new TextDecoder();
  const connectTime = Date.now();
  let buffer = '';
  let receivedData = false;

  // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
  while (true) {
    const remainingTtlMs = connectionTtlMs - (Date.now() - connectTime);

    if (remainingTtlMs <= 0) {
      void reader.cancel();

      return 'ttl';
    }

    // eslint-disable-next-line no-await-in-loop
    const readResult = await raceWithTimeout(reader.read(), remainingTtlMs);

    if (readResult.kind === 'timeout') {
      void reader.cancel();

      // No data for the whole window: proxy likely half-closed the socket.
      // If data flowed earlier, treat it as a normal TTL boundary instead.
      return receivedData ? 'ttl' : 'idle-timeout';
    }

    const { value, done: streamDone } = readResult.value;

    if (value) {
      receivedData = true;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split('\n\n');

      // Last element is either empty (complete event) or a partial chunk to carry over
      buffer = parts.pop() ?? '';

      parts
        .map((raw) => parseSSEEvent(raw))
        .filter((event): event is string => event !== null)
        .forEach((event) => processLogEvent(event, format));
    }

    if (streamDone) {
      void reader.cancel();

      return 'stream-done';
    }
  }
};

export const tailLogs = async (
  projectUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
  format: LogFormat,
  connectionTtlMs = DEFAULT_CONNECTION_TTL_MS,
) => {
  consola.info('Tailing logs...');

  let retries = 0;

  // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const reader = await openLogStream(projectUuid, storeHash, accessToken, apiHost);

      retries = 0;

      // eslint-disable-next-line no-await-in-loop
      const rotation = await pumpUntilRotation(reader, format, connectionTtlMs);

      if (rotation === 'idle-timeout') {
        consola.warn('Log stream idle, reconnecting...');
      }
      // 'ttl' and 'stream-done' are healthy rotations — reconnect silently.
    } catch (error) {
      if (error instanceof StreamError && error.fatal) {
        throw error;
      }

      const isServerDisconnect = error instanceof TypeError && error.message === 'terminated';

      if (isServerDisconnect) {
        consola.warn('Log stream closed by server, reconnecting...');
      } else {
        retries += 1;

        if (retries >= MAX_RETRIES) {
          throw new Error(`Failed to connect to log stream after ${MAX_RETRIES} retries.`);
        }

        consola.warn(
          `Log stream disconnected, reconnecting (attempt ${retries}/${MAX_RETRIES})...`,
          error,
        );
      }
    }
  }
};

const tail = new Command('tail')
  .configureHelp({ showGlobalOptions: true })
  .description('Tail live logs from your deployed application.')
  .addHelpText(
    'after',
    `
Examples:
  $ catalyst logs tail

  # Tail logs with request format
  $ catalyst logs tail --format request

  # Tail logs as raw JSON (useful for piping to other tools)
  $ catalyst logs tail --format json`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .addOption(
    new Option('--format <format>', 'Output format for log events.')
      .choices(['json', 'pretty', 'default', 'short', 'request'])
      .default('default'),
  )
  .action(async (options) => {
    try {
      const config = getProjectConfig();
      const { storeHash, accessToken } = resolveCredentials(options, config);

      await telemetry.identify(storeHash);

      const projectUuid = resolveProjectUuid(options);

      await tailLogs(projectUuid, storeHash, accessToken, options.apiHost, options.format);
    } catch (error) {
      consola.error(error);
      process.exit(1);
    }
  });

const query = new Command('query')
  .configureHelp({ showGlobalOptions: true })
  .description('Query historical logs from your deployed application.')
  .addHelpText(
    'after',
    `
Example:
  $ catalyst logs query`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .action((options) => {
    const config = getProjectConfig();

    resolveCredentials(options, config);

    consola.error('The query command is not yet implemented.');
    process.exit(1);
  });

export const logs = new Command('logs')
  .configureHelp({ showGlobalOptions: true })
  .description('View logs from your deployed application.')
  .addCommand(tail, { isDefault: true })
  .addCommand(query);
