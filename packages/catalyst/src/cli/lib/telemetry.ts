import { Analytics } from '@segment/analytics-node';
import Conf from 'conf';
import { randomBytes, randomUUID } from 'node:crypto';

import PACKAGE_INFO from '../../../package.json';

import { getUserConfig, UserConfigSchema } from './user-config';

const TELEMETRY_KEY_ENABLED = 'telemetry.enabled';
const TELEMETRY_KEY_ID = `telemetry.anonymousId`;

// CLI telemetry is best-effort: command completion must never be delayed by a
// slow or unreachable analytics endpoint. `closeAndFlush()` uses the flush
// interval to derive its timeout, so keep both bounds intentionally short.
const TELEMETRY_FLUSH_INTERVAL_MS = 200;
const TELEMETRY_HTTP_REQUEST_TIMEOUT_MS = 200;

export class Telemetry {
  readonly correlationId: string;
  readonly analytics: Analytics;
  readonly startTime: number;
  commandName = 'unknown';

  private userConfig: Conf<UserConfigSchema>;
  private CATALYST_TELEMETRY_DISABLED: string | undefined;

  private readonly projectName = 'catalyst-cli';
  private readonly projectVersion = PACKAGE_INFO.version;

  constructor() {
    this.CATALYST_TELEMETRY_DISABLED = process.env.CATALYST_TELEMETRY_DISABLED;

    this.userConfig = getUserConfig();

    this.correlationId = randomUUID();
    this.startTime = Date.now();
    this.analytics = new Analytics({
      writeKey: process.env.CLI_SEGMENT_WRITE_KEY ?? 'not-a-valid-segment-write-key',
      flushInterval: TELEMETRY_FLUSH_INTERVAL_MS,
      httpRequestTimeout: TELEMETRY_HTTP_REQUEST_TIMEOUT_MS,
      maxRetries: 0,
    });
  }

  durationMs(): number {
    return Date.now() - this.startTime;
  }

  async track(eventName: string, payload: Record<string, unknown>) {
    if (!this.isEnabled()) {
      return Promise.resolve(undefined);
    }

    this.analytics.track({
      event: eventName,
      anonymousId: this.getAnonymousId(),
      properties: {
        ...payload,
        correlationId: this.correlationId,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cliVersion: PACKAGE_INFO.version,
      },
      context: {
        app: {
          name: this.projectName,
          version: this.projectVersion,
        },
      },
    });
  }

  async identify(storeHash?: string) {
    if (!this.isEnabled()) {
      return Promise.resolve(undefined);
    }

    if (!storeHash) {
      return Promise.resolve(undefined);
    }

    this.analytics.identify({
      userId: storeHash,
      anonymousId: this.getAnonymousId(),
      context: {
        app: {
          name: this.projectName,
          version: this.projectVersion,
        },
      },
    });
  }

  setEnabled = (_enabled: boolean) => {
    const enabled = Boolean(_enabled);

    this.userConfig.set('telemetry.enabled', enabled);
  };

  isEnabled() {
    return (
      !this.CATALYST_TELEMETRY_DISABLED &&
      this.userConfig.get<typeof TELEMETRY_KEY_ENABLED, boolean>(TELEMETRY_KEY_ENABLED, true)
    );
  }

  private getAnonymousId(): string {
    const val = this.userConfig.get<typeof TELEMETRY_KEY_ID, string>(TELEMETRY_KEY_ID);

    if (val) {
      return val;
    }

    const generated = randomBytes(32).toString('hex');

    this.userConfig.set(TELEMETRY_KEY_ID, generated);

    return generated;
  }
}

let telemetryInstance: Telemetry | undefined;

// Singleton so the pre-hook, post-hook, error handler, and command bodies all
// share one correlationId. resetTelemetry() is for test isolation.
export function getTelemetry(): Telemetry {
  telemetryInstance ??= new Telemetry();

  return telemetryInstance;
}

export function resetTelemetry(): void {
  telemetryInstance = undefined;
}
