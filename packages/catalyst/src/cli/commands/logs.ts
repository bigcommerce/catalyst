import { Command, Option } from 'commander';
import { colorize } from 'consola/utils';
import { z } from 'zod';

import { consola } from '../lib/logger';
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
      const decoder = new TextDecoder();
      const connectTime = Date.now();
      let buffer = '';

      retries = 0;

      // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done: streamDone } = await reader.read();

        if (value) {
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split('\n\n');

          // Last element is either empty (complete event) or a partial chunk to carry over
          buffer = parts.pop() ?? '';

          parts
            .map((raw) => parseSSEEvent(raw))
            .filter((event): event is string => event !== null)
            .forEach((event) => processLogEvent(event, format));
        }

        if (streamDone || Date.now() - connectTime >= connectionTtlMs) {
          void reader.cancel();
          break;
        }
      }
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
  .addOption(storeHashOption().makeOptionMandatory())
  .addOption(accessTokenOption().makeOptionMandatory())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .addOption(
    new Option('--format <format>', 'Output format for log events.')
      .choices(['json', 'pretty', 'default', 'short', 'request'])
      .default('default'),
  )
  .action(async (options) => {
    try {
      await telemetry.identify(options.storeHash);

      const projectUuid = resolveProjectUuid(options);

      await tailLogs(
        projectUuid,
        options.storeHash,
        options.accessToken,
        options.apiHost,
        options.format,
      );
    } catch (error) {
      consola.error(error);
      process.exit(1);
    }
  });

const query = new Command('query')
  .description('Query historical logs from your deployed application.')
  .addHelpText(
    'after',
    `
Example:
  $ catalyst logs query`,
  )
  .addOption(storeHashOption().makeOptionMandatory())
  .addOption(accessTokenOption().makeOptionMandatory())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action((_options) => {
    consola.error('The query command is not yet implemented.');
    process.exit(1);
  });

export const logs = new Command('logs')
  .description('View logs from your deployed application.')
  .addCommand(tail, { isDefault: true })
  .addCommand(query);
