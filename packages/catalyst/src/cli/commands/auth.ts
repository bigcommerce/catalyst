import { Command, Options } from '@effect/cli';
import { colorize } from 'consola/utils';
import { Config, Effect, Option } from 'effect';

import { DEFAULT_LOGIN_URL } from '../lib/auth';
import { AuthService } from '../core/services/AuthService';
import { ProjectService } from '../core/services/ProjectService';
import { BrowserOpen } from '../providers/services/BrowserOpen';
import { ProjectConfig } from '../providers/services/ProjectConfig';
import { Logger } from '../presentation/services/Logger';
import { Spinner } from '../presentation/services/Spinner';

const storeHashOption = Options.text('store-hash').pipe(
  Options.withDescription(
    'BigCommerce store hash. Can be found in the URL of your store Control Panel.',
  ),
  Options.withFallbackConfig(Config.string('CATALYST_STORE_HASH')),
  Options.optional,
);

const accessTokenOption = Options.text('access-token').pipe(
  Options.withDescription(
    'BigCommerce access token. Can be found after creating a store-level API account.',
  ),
  Options.withFallbackConfig(Config.string('CATALYST_ACCESS_TOKEN')),
  Options.optional,
);

const apiHostOption = Options.text('api-host').pipe(
  Options.withDescription(
    'BigCommerce API host. The default is api.bigcommerce.com.',
  ),
  Options.withFallbackConfig(Config.string('BIGCOMMERCE_API_HOST')),
  Options.withDefault('api.bigcommerce.com'),
);

const loginUrlOption = Options.text('login-url').pipe(
  Options.withDescription('BigCommerce login URL.'),
  Options.withFallbackConfig(Config.string('BIGCOMMERCE_LOGIN_URL')),
  Options.withDefault(DEFAULT_LOGIN_URL),
);

export const whoamiEffect = (options: {
  storeHash?: string;
  accessToken?: string;
  apiHost: string;
}) =>
  Effect.gen(function* () {
    const logger = yield* Logger;
    const project = yield* ProjectService;
    const config = yield* ProjectConfig;

    const storeHash = options.storeHash ?? (yield* config.get('storeHash'));
    const accessToken =
      options.accessToken ?? (yield* config.get('accessToken'));

    if (!storeHash || !accessToken) {
      yield* logger.info('Not logged in: no credentials found.');
      yield* logger.info(
        'Run `catalyst auth login`, or provide --store-hash and --access-token flags (or set CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables).',
      );
      process.exit(1);

      return;
    }

    const store = yield* project
      .fetchStoreProfile(storeHash, accessToken, options.apiHost)
      .pipe(
        Effect.catchTag('HttpApiError', (e) =>
          Effect.gen(function* () {
            if (
              e.message.includes('401') ||
              e.message.includes('403')
            ) {
              yield* logger.error(
                `Not logged in: invalid credentials (${e.message})`,
              );
            } else {
              yield* logger.error(
                `Failed to verify credentials: ${e.message}`,
              );
            }

            process.exit(1);

            return yield* Effect.fail(e);
          }),
        ),
      );

    const projectUuid = yield* config.get('projectUuid');

    if (projectUuid) {
      const projects = yield* project
        .fetchProjects(storeHash, accessToken, options.apiHost)
        .pipe(Effect.catchTag('HttpApiError', () => Effect.succeed([])));

      const linkedProject = projects.find((p) => p.uuid === projectUuid);

      if (linkedProject) {
        yield* logger.info(
          `Logged in to ${store.store_name} (${storeHash}), connected to project ${linkedProject.name} (${projectUuid})`,
        );
      } else {
        yield* logger.info(
          `Logged in to ${store.store_name} (${storeHash}), project ${projectUuid} not found`,
        );
      }
    } else {
      yield* logger.info(
        `Logged in to ${store.store_name} (${storeHash})`,
      );
    }

    process.exit(0);
  });

export const loginEffect = (options: {
  storeHash?: string;
  accessToken?: string;
  loginUrl: string;
}) =>
  Effect.gen(function* () {
    const logger = yield* Logger;
    const spinner = yield* Spinner;
    const authService = yield* AuthService;
    const browser = yield* BrowserOpen;
    const config = yield* ProjectConfig;

    const storeHash = options.storeHash ?? (yield* config.get('storeHash'));
    const accessToken =
      options.accessToken ?? (yield* config.get('accessToken'));

    if (storeHash && accessToken) {
      yield* logger.info(`Already logged in to store ${storeHash}.`);
      yield* logger.info('Run `catalyst auth logout` first to re-authenticate.');
      process.exit(0);

      return;
    }

    const deviceCode = yield* authService
      .requestDeviceCode(options.loginUrl)
      .pipe(
        Effect.catchTag('AuthError', (e) =>
          Effect.gen(function* () {
            yield* logger.error(`Login failed: ${e.message}`);
            process.exit(1);

            return yield* Effect.fail(e);
          }),
        ),
      );

    yield* logger.info(
      `${colorize('yellow', 'Your one-time code:')} ${colorize('bold', deviceCode.user_code)}`,
    );

    yield* browser.open(deviceCode.verification_uri).pipe(
      Effect.tap(() => logger.info(`Opened ${deviceCode.verification_uri} in your browser.`)),
      Effect.catchTag('BrowserOpenError', () =>
        logger.info(
          `Open ${deviceCode.verification_uri} in your browser and enter the code above.`,
        ),
      ),
    );

    yield* spinner.start('Waiting for authentication...');

    const credentials = yield* authService
      .waitForDeviceToken(
        options.loginUrl,
        deviceCode.device_code,
        deviceCode.interval,
      )
      .pipe(
        Effect.catchTag('AuthError', (e) =>
          Effect.gen(function* () {
            yield* spinner.error('Authentication failed.');
            yield* logger.error(`Login failed: ${e.message}`);
            process.exit(1);

            return yield* Effect.fail(e);
          }),
        ),
      );

    yield* spinner.success('Authentication complete.');

    yield* config.set('storeHash', credentials.store_hash);
    yield* config.set('accessToken', credentials.access_token);

    yield* logger.success(`Logged in to store ${credentials.store_hash}.`);
    process.exit(0);
  });

export const logoutEffect = Effect.gen(function* () {
  const logger = yield* Logger;
  const config = yield* ProjectConfig;

  const storeHash = yield* config.get('storeHash');
  const accessToken = yield* config.get('accessToken');

  if (!storeHash && !accessToken) {
    yield* logger.info('Not logged in: no credentials found.');
    process.exit(0);

    return;
  }

  yield* config.delete('storeHash');
  yield* config.delete('accessToken');

  yield* logger.success(`Logged out from store ${storeHash ?? 'unknown'}.`);
  process.exit(0);
});

const whoamiCommand = Command.make(
  'whoami',
  { storeHash: storeHashOption, accessToken: accessTokenOption, apiHost: apiHostOption },
  (opts) =>
    whoamiEffect({
      storeHash: Option.getOrUndefined(opts.storeHash),
      accessToken: Option.getOrUndefined(opts.accessToken),
      apiHost: opts.apiHost,
    }),
).pipe(
  Command.withDescription(
    'Verify stored credentials and display store/project info.',
  ),
);

const loginCommand = Command.make(
  'login',
  { storeHash: storeHashOption, accessToken: accessTokenOption, loginUrl: loginUrlOption },
  (opts) =>
    loginEffect({
      storeHash: Option.getOrUndefined(opts.storeHash),
      accessToken: Option.getOrUndefined(opts.accessToken),
      loginUrl: opts.loginUrl,
    }),
).pipe(
  Command.withDescription(
    'Authenticate via browser using the OAuth device code flow.',
  ),
);

const logoutCommand = Command.make('logout', {}, () => logoutEffect).pipe(
  Command.withDescription('Remove stored credentials for the current project.'),
);

export const authCommand = Command.make('auth').pipe(
  Command.withDescription('Manage authentication for the BigCommerce CLI.'),
  Command.withSubcommands([whoamiCommand, loginCommand, logoutCommand]),
);
