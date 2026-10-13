import Conf from 'conf';

export interface UserConfigSchema {
  telemetry: {
    enabled: boolean;
    anonymousId: string;
  };
  survey?: {
    // When the feedback survey was last shown, in ms since the epoch.
    lastShownAt?: number;
  };
}

let userConfigInstance: Conf<UserConfigSchema> | undefined;

// User-scoped config (per-machine, not per-project). Lives in the OS config dir
// — keeping telemetry out of the user's working directory so commands like
// `catalyst create` don't drop a stray `.bigcommerce/` next to where they're run.
export function getUserConfig(): Conf<UserConfigSchema> {
  userConfigInstance ??= new Conf<UserConfigSchema>({
    projectName: 'catalyst-cli',
    projectSuffix: '',
    configName: 'config',
    schema: {
      telemetry: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          anonymousId: { type: 'string' },
        },
      },
      survey: {
        type: 'object',
        properties: {
          lastShownAt: { type: 'number' },
        },
      },
    },
  });

  return userConfigInstance;
}

export function resetUserConfig(): void {
  userConfigInstance = undefined;
}
