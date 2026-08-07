import { colorize } from 'consola/utils';
import { z } from 'zod';

import { assertAuthorized } from './auth-errors';
import { UserActionableError } from './errors';
import { httpError } from './http-errors';
import { getTelemetry } from './telemetry';

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const logEntrySchema = z.object({
  timestamp: z.string().nullable().optional(),
  level: z.string().optional(),
  messages: z.array(z.unknown()).optional(),
  is_exception: z.boolean().optional(),
  exception_name: z.string().optional(),
  request: z
    .object({
      method: z.string().optional(),
      url: z.string().optional(),
      status_code: z.number().optional(),
    })
    .nullable()
    .optional(),
});

const queryLogsSchema = z.object({
  data: z.array(logEntrySchema),
  meta: z
    .object({
      cursor_pagination: z
        .object({
          // The REST proxy exposes page availability via links, while the
          // gRPC response uses has_next_page/has_prev_page. Accept both while
          // the API contract is transitioning.
          has_next_page: z.boolean().optional(),
          has_prev_page: z.boolean().optional(),
          start_cursor: z.string().nullable().optional(),
          end_cursor: z.string().nullable().optional(),
          links: z
            .object({
              next: z.string().optional(),
              previous: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

export type LogEntry = z.infer<typeof logEntrySchema>;
export type QueryLogsResult = z.infer<typeof queryLogsSchema>;

export interface QueryLogsParams {
  start: string;
  end: string;
  method?: string;
  statusCode?: number;
  urlLike?: string;
  levelMin?: LogLevel;
  limit?: number;
  after?: string;
  before?: string;
}

const v3ErrorSchema = z.object({
  title: z.string().optional(),
  errors: z.record(z.string(), z.string()).optional(),
});

export function formatV3Error(body: unknown): string | undefined {
  const parsed = v3ErrorSchema.safeParse(body);

  if (!parsed.success) return undefined;

  const { title, errors } = parsed.data;
  const fieldErrors =
    errors && Object.keys(errors).length > 0
      ? Object.entries(errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('; ')
      : undefined;

  if (title && fieldErrors) return `${title} (${fieldErrors})`;

  return title ?? fieldErrors;
}

// Accepts either an ISO-8601 timestamp or a Unix epoch (seconds) and returns
// milliseconds since epoch, or null when the value can't be parsed.
function parseTimeInput(value: string): number | null {
  const trimmed = value.trim();

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed) * 1000;
  }

  const ms = Date.parse(trimmed);

  return Number.isNaN(ms) ? null : ms;
}

const DURATION_UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

function parseDuration(value: string): number | null {
  const match = /^(\d+)([smhd])$/.exec(value.trim());

  if (!match) return null;

  return Number(match[1]) * DURATION_UNIT_MS[match[2]];
}

export function resolveTimeWindow(
  opts: { start?: string; end?: string; since?: string },
  nowMs = Date.now(),
): {
  start: string;
  end: string;
} {
  const { since } = opts;
  let { start, end } = opts;
  let startMs: number | null;
  let endMs: number | null;

  if (end) {
    endMs = parseTimeInput(end);

    if (endMs === null) {
      throw new UserActionableError(
        `Invalid --end value "${end}". Provide an ISO-8601 timestamp or a Unix epoch (seconds).`,
      );
    }
  } else {
    endMs = nowMs;
    end = new Date(endMs).toISOString();
  }

  if (since) {
    const durationMs = parseDuration(since);

    if (durationMs === null) {
      throw new UserActionableError(
        `Invalid --since value "${since}". Provide a duration like 30m, 6h, or 2d (units: s, m, h, d).`,
      );
    }

    startMs = endMs - durationMs;
    start = new Date(startMs).toISOString();
  } else if (start) {
    startMs = parseTimeInput(start);

    if (startMs === null) {
      throw new UserActionableError(
        `Invalid --start value "${start}". Provide an ISO-8601 timestamp or a Unix epoch (seconds).`,
      );
    }
  } else {
    throw new UserActionableError(
      'Provide a time window with --since <duration> or --start <time>.',
    );
  }

  if (startMs > endMs) {
    throw new UserActionableError('Invalid time window: --start must be before or equal to --end.');
  }

  if (endMs - startMs > SEVEN_DAYS_MS) {
    throw new UserActionableError('Invalid time window: the range must not exceed 7 days.');
  }

  return { start, end };
}

const LEVEL_COLORS: Record<string, Parameters<typeof colorize>[0]> = {
  debug: 'gray',
  info: 'green',
  warn: 'yellow',
  error: 'red',
};

export type LogLineFormat = 'default' | 'short' | 'request';

const UNKNOWN_TIME = 'unknown';

function isRedundantExceptionName(name: string, message: string): boolean {
  const parts = name
    .split('<*>')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  return parts.length > 0 && parts.every((part) => message.includes(part));
}

const stringifyMessage = (message: unknown) =>
  typeof message === 'string' ? message : JSON.stringify(message);

export function formatLogEntry(entry: LogEntry, format: LogLineFormat = 'default'): string {
  const message = (entry.messages ?? [])
    .map(stringifyMessage)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (format === 'short') return message;

  const level = entry.level ?? 'unknown';
  const coloredLevel = colorize(LEVEL_COLORS[level.toLowerCase()] ?? 'white', level.toUpperCase());

  const exceptionStr =
    entry.is_exception &&
    entry.exception_name &&
    !isRedundantExceptionName(entry.exception_name, message)
      ? ` ${colorize('red', `[${entry.exception_name}]`)}`
      : '';

  let requestStr = '';

  if (format === 'request' && entry.request) {
    const parts: string[] = [];

    if (entry.request.method) parts.push(entry.request.method);
    if (entry.request.url) parts.push(entry.request.url);

    // status_code 0 is the backend's "unknown" sentinel — omit it.
    const status = entry.request.status_code ? ` (${entry.request.status_code})` : '';

    if (parts.length > 0) requestStr = ` ${parts.join(' ')}${status}`;
  }

  // `requestStr` is empty outside the `request` format, so the level stays
  // adjacent to the timestamp there and only slides after the request details
  // when they are present.
  return `[${entry.timestamp ?? UNKNOWN_TIME}]${requestStr} [${coloredLevel}]${exceptionStr} ${message}`;
}

export async function queryLogs(
  projectUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
  params: QueryLogsParams,
): Promise<QueryLogsResult> {
  const search = new URLSearchParams();

  search.set('start', params.start);
  search.set('end', params.end);

  if (params.method) search.set('method', params.method);
  if (params.statusCode != null) search.set('status_code', String(params.statusCode));
  if (params.urlLike) search.set('url:like', params.urlLike); // colon param
  if (params.levelMin) search.set('level:min', params.levelMin); // colon param
  if (params.limit != null) search.set('limit', String(params.limit));
  if (params.after) search.set('after', params.after);
  if (params.before) search.set('before', params.before);

  const response = await fetch(
    `https://${apiHost}/stores/${storeHash}/v3/infrastructure/logs/${projectUuid}?${search.toString()}`,
    {
      method: 'GET',
      headers: {
        'X-Auth-Token': accessToken,
        'X-Correlation-Id': getTelemetry().correlationId,
        Accept: 'application/json',
      },
    },
  );

  assertAuthorized(response);

  if (response.status === 403) {
    throw new UserActionableError(
      'Infrastructure Logs API not enabled. If you are part of the beta, contact support@bigcommerce.com to enable it.',
    );
  }

  if (response.status === 404) {
    // The gateway also 404s when the token belongs to a different store than
    // the one in the URL, so a bad credential pairing looks identical to a
    // missing project.
    throw new UserActionableError(
      'Project not found. Check the project UUID, and that --store-hash and --access-token belong to the store that owns the project.',
    );
  }

  // 400 (bad UUID) and 422 (invalid window/filter) both carry the field-keyed
  // v3 error envelope — surface its message rather than the bare status.
  if (response.status === 400 || response.status === 422) {
    const body: unknown = await response.json().catch(() => null);

    throw new UserActionableError(formatV3Error(body) ?? 'Invalid log query.');
  }

  if (!response.ok) {
    throw await httpError(response, 'Failed to fetch logs');
  }

  const res: unknown = await response.json();

  return queryLogsSchema.parse(res);
}
