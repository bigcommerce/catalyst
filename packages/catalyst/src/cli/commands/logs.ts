import { Command, InvalidArgumentError, Option } from 'commander';
import { colorize } from 'consola/utils';
import { z } from 'zod';

import { UnauthorizedError } from '../lib/auth-errors';
import { httpError } from '../lib/http-errors';
import { consola } from '../lib/logger';
import {
  formatLogEntry,
  isRequestLogEntry,
  LOG_LEVELS,
  queryLogs,
  QueryLogsResult,
  resolveTimeWindow,
} from '../lib/observability';
import { getProjectConfig } from '../lib/project-config';
import { resolveCredentials } from '../lib/resolve-credentials';
import {
  accessTokenOption,
  apiHostOption,
  projectUuidOption,
  resolveApiHost,
  resolveProjectUuid,
  storeHashOption,
} from '../lib/shared-options';
import { getTelemetry } from '../lib/telemetry';

type LogFormat = 'json' | 'pretty' | 'default' | 'short' | 'request';

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

type LogEvent = z.infer<typeof LogEventSchema>;

// Builds a `request` format line. The log entry is optional: a request that
// logged nothing still has a timestamp, method, URL and status worth printing.
const formatRequestLine = (event: LogEvent, entry?: LogEvent['logs'][number]) => {
  const { request } = event;
  const msg = entry ? formatMessages(entry.messages) : '';
  const msgPart = msg ? ` ${msg}` : '';
  // The level labels the message, so an entry with nothing to say prints as a
  // bare request line — same as an event that carried no entries at all.
  const level = msg ? entry?.level.toUpperCase() : undefined;
  const levelPart = level ? ` [${colorize(LEVEL_COLORS[level] ?? 'white', level)}]` : '';

  return (
    `[${entry?.timestamp ?? event.timestamp}] ` +
    `${request.method} ${request.url} (${request.status_code})${levelPart}${msgPart}`
  );
};

const formatLogEvent = (event: LogEvent, format: 'default' | 'short' | 'request') => {
  const { logs: logEntries, exceptions } = event;

  // `request` output is about the request, not the messages it emitted, so an
  // event with no log entries still prints one line. Otherwise requests that
  // logged nothing silently disappear from the stream.
  if (format === 'request' && logEntries.length === 0) {
    consola.log(formatRequestLine(event));
  }

  logEntries.forEach((entry) => {
    const msg = formatMessages(entry.messages);
    const level = entry.level.toUpperCase();
    const coloredLevel = colorize(LEVEL_COLORS[level] ?? 'white', level);

    switch (format) {
      case 'short':
        consola.log(msg);
        break;

      case 'request':
        consola.log(formatRequestLine(event, entry));
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

  // An invalid/expired token won't recover by reconnecting — surface the
  // re-auth guidance and stop the loop (fatal) rather than burning retries.
  if (response.status === 401) {
    throw new StreamError(new UnauthorizedError().message, true);
  }

  if (!response.ok) {
    const error = await httpError(response, 'Failed to open log stream');

    throw new StreamError(error.message, isFatalStatusCode(response.status));
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
Formats:
  default  One line per log message: timestamp, level, and message.
  short    Message text only.
  request  One line per log message: timestamp, request method, URL, status
           code, level, and message. Requests that logged no messages are
           printed too, without the level and message.
  pretty   Indented JSON of the whole event.
  json     Raw JSON, one event per line (useful for piping to other tools).

The \`default\` and \`short\` formats only print requests that produced a log
message. Use \`--format request\` (or \`json\`/\`pretty\`) to see every request,
including ones with no message body.

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
      const apiHost = resolveApiHost(options, config);
      const { storeHash, accessToken } = resolveCredentials(options, config);

      await getTelemetry().identify(storeHash);

      const projectUuid = resolveProjectUuid(options);

      await tailLogs(projectUuid, storeHash, accessToken, apiHost, options.format);
    } catch (error) {
      consola.error(error);
      process.exit(1);
    }
  });

// Validates a numeric flag client-side so typos fail instantly with a clear
// message instead of sending NaN (or an out-of-range value) to the API.
const parseIntInRange = (flag: string, min: number, max: number) => (value: string) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new InvalidArgumentError(`${flag} must be an integer between ${min} and ${max}.`);
  }

  return parsed;
};

// A bare `catalyst` is only on PATH for global installs. When the CLI runs
// through a package manager (`pnpm catalyst`, `npx catalyst`, ...) the printed
// hint must include that wrapper or copy-pasting it fails with
// "command not found".
function invocationPrefix(): string {
  const packageManager = process.env.npm_config_user_agent?.split('/')[0];

  switch (packageManager) {
    case 'pnpm':
    case 'yarn':
      return `${packageManager} catalyst`;

    case 'bun':
      return 'bunx catalyst';

    case 'npm':
      return 'npx catalyst';

    default:
      return 'catalyst';
  }
}

interface QueryHintOptions {
  method?: string;
  statusCode?: number;
  urlLike?: string;
  levelMin?: string;
  limit?: number;
  format: string;
}

function printPaginationHints(
  pagination: NonNullable<QueryLogsResult['meta']>['cursor_pagination'],
  start: string,
  end: string,
  options: QueryHintOptions,
): void {
  // The REST API signals availability with `links` URLs. Retain the gRPC
  // booleans as a compatibility fallback for direct API consumers.
  const hasNextPage = Boolean(pagination?.links?.next) || pagination?.has_next_page === true;
  const hasPrevPage = Boolean(pagination?.links?.previous) || pagination?.has_prev_page === true;
  const endCursor = pagination?.end_cursor;
  const startCursor = pagination?.start_cursor;

  if (!(hasNextPage && endCursor) && !(hasPrevPage && startCursor)) return;

  const quoteArg = (value: string) => (/\s/.test(value) ? `'${value}'` : value);
  // Cursors are only valid with the same window and filters, so pin the
  // resolved absolute timestamps (a --since window drifts with "now").
  const baseFlags = [
    `--start ${quoteArg(start)}`,
    `--end ${quoteArg(end)}`,
    ...(options.method ? [`--method ${quoteArg(options.method)}`] : []),
    ...(options.statusCode != null ? [`--status-code ${options.statusCode}`] : []),
    ...(options.urlLike ? [`--url-like ${quoteArg(options.urlLike)}`] : []),
    ...(options.levelMin ? [`--level-min ${options.levelMin}`] : []),
    ...(options.limit != null ? [`--limit ${options.limit}`] : []),
    // The entry_type filter derives from --format (default/short request only
    // application logs), so echoing --format is enough to reproduce it.
    ...(options.format !== 'default' ? [`--format ${options.format}`] : []),
  ];
  const command = `${invocationPrefix()} logs query ${baseFlags.join(' ')}`;

  if (hasNextPage && endCursor) {
    consola.info(`More results available. Next page:\n  ${command} --after ${quoteArg(endCursor)}`);
  }

  if (hasPrevPage && startCursor) {
    consola.info(
      `Newer results available. Previous page:\n  ${command} --before ${quoteArg(startCursor)}`,
    );
  }
}

const query = new Command('query')
  .configureHelp({ showGlobalOptions: true })
  .description('Query historical logs from your deployed application.')
  .addHelpText(
    'after',
    `
Specify a time window with \`--since\` (relative to now) or \`--start\`/\`--end\`
(ISO-8601 timestamps or Unix epoch seconds, UTC). The window may not exceed
7 days. Entries print oldest-first; timestamps are UTC. Page toward older
entries by passing a previous page's end cursor to \`--after\` (the CLI prints
a ready-to-run command when more entries are available), or toward newer
entries with \`--before\`. Cursors are only valid with the same window and
filters they came from. With \`--format json\`, the pagination cursors are
emitted as a final \`{"meta": ...}\` line after the entries.

The \`default\` and \`short\` formats show only application log output,
excluding Cloudflare's auto-generated per-request rows. Use
\`--format request\` (or \`json\`/\`pretty\`) to include them.

Examples:
  # Last hour of logs
  $ catalyst logs query --since 1h

  # Newest 20 errors in the window (follow the printed --after hint for more)
  $ catalyst logs query --since 24h --level-min error --limit 20

  # Everything from today (UTC)
  $ catalyst logs query --start 2026-06-11T00:00:00Z

  # Errors only for a specific path
  $ catalyst logs query --since 24h --level-min error --url-like /cart

  # Errors with request details (method, URL, status)
  $ catalyst logs query --since 1h --level-min error --format request

  # Raw JSON (NDJSON) for piping to other tools
  $ catalyst logs query --since 2d --format json`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .addOption(
    new Option(
      '--since <duration>',
      'Relative window ending at --end (default: now), e.g. 30m, 6h, 2d (units: s, m, h, d).',
    ).conflicts('start'),
  )
  .option('--start <time>', 'Window start: ISO-8601 timestamp or Unix epoch (seconds).')
  .option(
    '--end <time>',
    'Window end: ISO-8601 timestamp or Unix epoch (seconds). Defaults to now. The window must not exceed 7 days.',
  )
  .option('--method <method>', 'Filter by request HTTP method (case-insensitive).')
  .addOption(
    new Option('--status-code <code>', 'Filter by response status code (100-599).').argParser(
      parseIntInRange('--status-code', 100, 599),
    ),
  )
  .option('--url-like <substring>', 'Filter by URL substring (case-sensitive).')
  .addOption(
    new Option('--level-min <level>', 'Minimum log level.').choices(Array.from(LOG_LEVELS)),
  )
  .addOption(
    new Option(
      '--limit <count>',
      'Maximum entries per page (1-500). Defaults to the API default (100).',
    ).argParser(parseIntInRange('--limit', 1, 500)),
  )
  .addOption(
    new Option(
      '--after <cursor>',
      "Return the page after (older than) this cursor, from a previous page's end_cursor.",
    ).conflicts('before'),
  )
  .addOption(
    new Option(
      '--before <cursor>',
      "Return the page before (newer than) this cursor, from a previous page's start_cursor.",
    ),
  )
  .addOption(
    new Option('--format <format>', 'Output format for log entries.')
      .choices(['json', 'pretty', 'default', 'short', 'request'])
      .default('default'),
  )
  .action(async (options) => {
    try {
      const config = getProjectConfig();
      const apiHost = resolveApiHost(options, config);
      const { storeHash, accessToken } = resolveCredentials(options, config);

      await getTelemetry().identify(storeHash);

      const projectUuid = resolveProjectUuid(options);
      const { start, end } = resolveTimeWindow(options);

      // default/short show only application output, so ask the API to filter
      // out Cloudflare's per-request rows (they don't consume the page limit).
      const hideRequestRows = options.format === 'default' || options.format === 'short';

      const result = await queryLogs(projectUuid, storeHash, accessToken, apiHost, {
        start,
        end,
        entryType: hideRequestRows ? 'log' : undefined,
        method: options.method,
        statusCode: options.statusCode,
        urlLike: options.urlLike,
        levelMin: options.levelMin,
        limit: options.limit,
        after: options.after,
        before: options.before,
      });

      const entries = result.data;
      const ordered = [...entries].reverse();

      if (options.format === 'json') {
        ordered.forEach((entry) => process.stdout.write(`${JSON.stringify(entry)}\n`));

        // Entries carry no cursors, so scripted pagination needs the meta
        // echoed back; a trailing line keeps the stream line-delimited.
        const cursorPagination = result.meta?.cursor_pagination;

        if (cursorPagination) {
          process.stdout.write(
            `${JSON.stringify({ meta: { cursor_pagination: cursorPagination } })}\n`,
          );
        }

        return;
      }

      if (options.format === 'pretty') {
        ordered.forEach((entry) => consola.log(JSON.stringify(entry, null, 2)));

        return;
      }

      if (entries.length === 0) {
        consola.info('No log entries found for the given window and filters.');

        return;
      }

      // `json`/`pretty` returned above, leaving the human line formats — capture
      // the narrowed value so it survives into the forEach closure.
      const lineFormat = options.format;

      // Older API deployments ignore the entry_type param, so also drop
      // request rows client-side — a no-op against new APIs.
      const visible = hideRequestRows
        ? ordered.filter((entry) => !isRequestLogEntry(entry))
        : ordered;
      const hiddenCount = ordered.length - visible.length;

      visible.forEach((entry) => consola.log(formatLogEntry(entry, lineFormat)));

      const shownPart = `${visible.length} ${visible.length === 1 ? 'entry' : 'entries'} shown`;

      consola.info(
        hiddenCount > 0
          ? `${shownPart}, ${hiddenCount} request ${hiddenCount === 1 ? 'row' : 'rows'} hidden (oldest first, times in UTC). Use --format request to see request rows.`
          : `${shownPart} (oldest first, times in UTC).`,
      );

      printPaginationHints(result.meta?.cursor_pagination, start, end, options);
    } catch (error) {
      consola.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

export const logs = new Command('logs')
  .alias('log')
  .configureHelp({ showGlobalOptions: true })
  .description('View logs from your deployed application.')
  .addCommand(tail, { isDefault: true })
  .addCommand(query);
