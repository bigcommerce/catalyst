import { Command, Option } from 'commander';
import { access, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Effect } from 'effect';

import { DeployService } from '../core/services/DeployService';
import { ProjectService } from '../core/services/ProjectService';
import { ProjectConfig } from '../providers/services/ProjectConfig';
import { Telemetry } from '../providers/services/Telemetry';
import { Logger } from '../presentation/services/Logger';
import { Spinner } from '../presentation/services/Spinner';
import { LiveLayer } from '../layers';

import { buildCatalystProject } from './build';

export { parseEnvironmentVariables } from '../lib/deploy-helpers';

export const deployEffect = (options: {
  storeHash?: string;
  accessToken?: string;
  apiHost: string;
  projectUuid?: string;
  secret?: string[];
  dryRun?: boolean;
  prebuilt?: boolean;
}) =>
  Effect.gen(function* () {
    const logger = yield* Logger;
    const spinner = yield* Spinner;
    const deploy = yield* DeployService;
    const project = yield* ProjectService;
    const config = yield* ProjectConfig;
    const telemetry = yield* Telemetry;

    const { storeHash, accessToken } = yield* project
      .resolveCredentials(options)
      .pipe(
        Effect.catchTag('MissingCredentialsError', (e) =>
          Effect.gen(function* () {
            yield* logger.error('Missing credentials.');
            yield* logger.info(
              'Run `catalyst auth login`, or provide --store-hash and --access-token flags (or set CATALYST_STORE_HASH and CATALYST_ACCESS_TOKEN environment variables).',
            );
            process.exit(1);

            return yield* Effect.fail(e);
          }),
        ),
      );

    const projectUuid =
      options.projectUuid ?? (yield* config.get('projectUuid'));

    if (!projectUuid) {
      throw new Error(
        'Project UUID is required. Please run either `catalyst project link` or `catalyst project create` or this command again with --project-uuid <uuid>.',
      );
    }

    yield* telemetry.identify(storeHash);

    if (options.prebuilt) {
      const distDir = join(process.cwd(), '.bigcommerce', 'dist');

      const distAccessible = yield* Effect.tryPromise(() => access(distDir)).pipe(
        Effect.as(true),
        Effect.catchAll(() => Effect.succeed(false)),
      );

      if (!distAccessible) {
        throw new Error(
          'No build output found at .bigcommerce/dist/. Run `catalyst build` first or remove `--prebuilt` to build automatically.',
        );
      }

      const contents = yield* Effect.promise(() => readdir(distDir));

      if (contents.length === 0) {
        throw new Error(
          'No build output found at .bigcommerce/dist/. Run `catalyst build` first or remove `--prebuilt` to build automatically.',
        );
      }

      yield* logger.info('Using existing build output (--prebuilt).');
    } else {
      yield* buildCatalystProject(projectUuid);
    }

    yield* logger.info('Generating bundle...');
    yield* deploy.generateBundle();
    yield* logger.success('Bundle created.');

    if (options.dryRun) {
      yield* logger.info(
        'Dry run enabled — skipping upload and deployment steps.',
      );
      yield* logger.info('Next steps (skipped):');
      yield* logger.info('- Generate upload signature');
      yield* logger.info('- Upload bundle.zip');
      yield* logger.info('- Create deployment');
      process.exit(0);

      return;
    }

    yield* logger.info('Generating upload signature...');
    const uploadSignature = yield* deploy.generateUploadSignature(
      storeHash,
      accessToken,
      options.apiHost,
    );
    yield* logger.success('Upload signature generated.');

    yield* logger.info('Uploading bundle...');
    yield* deploy.uploadBundle(uploadSignature.upload_url);
    yield* logger.success('Bundle uploaded successfully.');

    const environmentVariables = options.secret?.map((envVar) => {
      const [key, value] = envVar.split('=');

      if (!key || !value) {
        throw new Error(
          `Invalid secret format: ${envVar}. Expected format: KEY=VALUE`,
        );
      }

      return {
        type: 'secret' as const,
        key: key.trim(),
        value: value.trim(),
      };
    });

    yield* logger.info('Creating deployment...');
    const { deployment_uuid: deploymentUuid } =
      yield* deploy.createDeployment({
        projectUuid,
        uploadUuid: uploadSignature.upload_uuid,
        storeHash,
        accessToken,
        apiHost: options.apiHost,
        environmentVariables,
      });
    yield* logger.success('Deployment started...');

    yield* logger.info('Fetching deployment status...');
    yield* spinner.start('Fetching...');

    const result = yield* deploy.streamDeploymentStatus({
      deploymentUuid,
      storeHash,
      accessToken,
      apiHost: options.apiHost,
      onStatusEvent: (event) => {
        Effect.runSync(spinner.setText(event.stepLabel));
      },
    });

    yield* spinner.success('Deployment completed successfully.\n');

    if (result.deploymentUrl) {
      yield* logger.success(
        `View your deployment at: ${result.deploymentUrl}`,
      );
    }
  });

export const deploy = new Command('deploy')
  .description('Deploy your application to Cloudflare.')
  .addOption(
    new Option(
      '--store-hash <hash>',
      'BigCommerce store hash. Can be found in the URL of your store Control Panel. Read from .bigcommerce/project.json when not provided.',
    ).env('CATALYST_STORE_HASH'),
  )
  .addOption(
    new Option(
      '--access-token <token>',
      'BigCommerce access token. Can be found after creating a store-level API account. Read from .bigcommerce/project.json when not provided.',
    ).env('CATALYST_ACCESS_TOKEN'),
  )
  .addOption(
    new Option(
      '--api-host <host>',
      'BigCommerce API host. The default is api.bigcommerce.com.',
    )
      .env('BIGCOMMERCE_API_HOST')
      .default('api.bigcommerce.com'),
  )
  .addOption(
    new Option(
      '--project-uuid <uuid>',
      'BigCommerce intrastructure project UUID. Can be found via the BigCommerce API (GET /v3/infrastructure/projects).',
    ).env('CATALYST_PROJECT_UUID'),
  )
  .addOption(
    new Option(
      '--secret <value>',
      'Secret to set for the deployment (repeatable). Format: --secret KEY=VALUE',
    ).argParser((value: string, previous: string[] = []) => {
      return previous.concat([value]);
    }),
  )
  .option(
    '--dry-run',
    'Run the command to generate the bundle without uploading or deploying.',
  )
  .option(
    '--prebuilt',
    'Skip the build step. Requires .bigcommerce/dist/ to already contain build output.',
  )
  .action(async (options) =>
    Effect.runPromise(
      deployEffect(options).pipe(Effect.provide(LiveLayer)),
    ),
  );
