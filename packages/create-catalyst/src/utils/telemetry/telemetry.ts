import { Analytics } from '@segment/analytics-node';
import Conf from 'conf';
import { randomBytes } from 'crypto';

import PACKAGE_INFO from '../../../package.json';

// This is the key that stores whether or not telemetry is enabled or disabled.
const TELEMETRY_KEY_ENABLED = 'telemetry.enabled';

// This is a quasi-persistent identifier used to dedupe recurring events.
const TELEMETRY_KEY_ID = `telemetry.anonymousId`;

interface Config {
  telemetry: {
    enabled: boolean;
    anonymousId: string;
  };
}

export class Telemetry {
  readonly sessionId: string;
  readonly analytics: Analytics;

  private conf: Conf<Config> | null;
  private CATALYST_TELEMETRY_DISABLED: string | undefined;

  private readonly projectName = 'catalyst-cli';
  private readonly projectVersion = PACKAGE_INFO.version;

  constructor() {
    this.CATALYST_TELEMETRY_DISABLED = process.env.CATALYST_TELEMETRY_DISABLED;

    try {
      this.conf = new Conf({
        projectName: this.projectName,
        projectVersion: this.projectVersion,
      });
    } catch {
      this.conf = null;
    }

    this.sessionId = randomBytes(32).toString('hex');
    this.analytics = new Analytics({
      writeKey: process.env.CLI_SEGMENT_WRITE_KEY ?? 'not-a-valid-segment-write-key',
    });
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
        sessionId: this.sessionId,
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

    this.conf?.set(TELEMETRY_KEY_ENABLED, enabled);

    return this.conf?.path;
  };

  isEnabled(): boolean {
    return (
      !this.CATALYST_TELEMETRY_DISABLED &&
      !!this.conf &&
      this.conf.get<typeof TELEMETRY_KEY_ENABLED, boolean>(TELEMETRY_KEY_ENABLED, true)
    );
  }

  private getAnonymousId(): string {
    const val = this.conf?.get<typeof TELEMETRY_KEY_ID, string>(TELEMETRY_KEY_ID);

    if (val) {
      return val;
    }

    const generated = randomBytes(32).toString('hex');

    this.conf?.set(TELEMETRY_KEY_ID, generated);

    return generated;
  }
}
