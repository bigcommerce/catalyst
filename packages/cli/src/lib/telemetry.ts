import { Analytics } from '@segment/analytics-node';
import { randomBytes } from 'node:crypto';

import PACKAGE_INFO from '../../package.json';

import { ProjectConfig } from './project-config';

export class Telemetry {
  readonly sessionId: string;
  readonly analytics: Analytics;

  private projectConfig: ProjectConfig;
  private CATALYST_TELEMETRY_DISABLED: string | undefined;

  private readonly projectName = 'catalyst-cli';
  private readonly projectVersion = PACKAGE_INFO.version;

  constructor() {
    this.CATALYST_TELEMETRY_DISABLED = process.env.CATALYST_TELEMETRY_DISABLED;

    this.projectConfig = new ProjectConfig();

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

    this.projectConfig.set('telemetry.enabled', enabled);
  };

  isEnabled() {
    try {
      return !this.CATALYST_TELEMETRY_DISABLED && this.projectConfig.get('telemetry').enabled;
    } catch {
      return false;
    }
  }

  private getAnonymousId(): string {
    let anonymousId;

    try {
      anonymousId = this.projectConfig.get('telemetry').anonymousId;

      if (!anonymousId) {
        anonymousId = randomBytes(32).toString('hex');

        this.projectConfig.set('telemetry.anonymousId', anonymousId);
      }

      return anonymousId;
    } catch {
      const generated = randomBytes(32).toString('hex');

      this.projectConfig.set('telemetry.anonymousId', generated);

      return generated;
    }
  }
}
