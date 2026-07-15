import { confirm } from '@inquirer/prompts';
import AdmZip from 'adm-zip';
import { Command, Option } from 'commander';
import { colorize } from 'consola/utils';
import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import yoctoSpinner from 'yocto-spinner';
import { z } from 'zod';

import { assertAuthorized } from '../lib/auth-errors';
import { loadBuildEnv } from '../lib/build-env';
import { runChannelSiteUrlFlow } from '../lib/channel-site-flow';
import {
  cleanupCloudflareIncompatibilities,
  NoLinkedProjectError,
  selectOrCreateInfrastructureProject,
  setupCommerceHosting,
} from '../lib/commerce-hosting';
import { getDeploymentErrorMessage } from '../lib/deployment-errors';
import {
  getStoredEnv,
  mergeDeploymentSecrets,
  parseEnvAssignment,
  toDeploymentSecrets,
} from '../lib/env-config';
import { httpError } from '../lib/http-errors';
import { installDependencies } from '../lib/install-dependencies';
import { consola } from '../lib/logger';
import { getProjectConfig } from '../lib/project-config';
import { getProjectState } from '../lib/project-state';
import { resolveCredentials } from '../lib/resolve-credentials';
import {
  accessTokenOption,
  apiHostOption,
  envPathOption,
  projectUuidOption,
  resolveApiHost,
  storeHashOption,
} from '../lib/shared-options';
import { getTelemetry } from '../lib/telemetry';

import { buildCatalystProject } from './build';

const stepsEnum = z.enum([
  'initializing',
  'downloading',
  'unzipping',
  'processing',
  'deploying',
  'finalizing',
  'complete',
]);

const STEPS: Record<z.infer<typeof stepsEnum>, string> = {
  initializing: 'Initializing...',
  downloading: 'Downloading...',
  unzipping: 'Unzipping...',
  processing: 'Processing...',
  deploying: 'Deploying...',
  finalizing: 'Finalizing...',
  complete: 'Complete',
};

const UploadSignatureSchema = z.object({
  data: z.object({
    upload_url: z.url(),
    upload_uuid: z.string(),
  }),
});

const CreateDeploymentSchema = z.object({
  data: z.object({
    deployment_uuid: z.uuid(),
  }),
});

const ProjectSchema = z.object({
  data: z.array(
    z.object({
      uuid: z.uuid(),
      name: z.string(),
    }),
  ),
});

const DeploymentStatusSchema = z.object({
  deployment_uuid: z.uuid(),
  deployment_status: z.enum(['queued', 'in_progress', 'failed', 'completed']),
  event: z
    .object({
      step: stepsEnum,
      progress: z.number(),
    })
    .nullable(),
  deployment_hostnames: z.array(z.string()).optional(),
  error: z
    .object({
      code: z.number(),
    })
    .optional(),
});

export const generateBundleZip = async () => {
  consola.info('Generating bundle...');

  const bigcommerceDir = join(process.cwd(), '.bigcommerce');
  const distDir = join(process.cwd(), '.bigcommerce', 'dist');

  // Check if .bigcommerce/dist exists
  try {
    await access(distDir);
  } catch {
    throw new Error(`Dist directory not found: ${distDir}`);
  }

  // Check if .bigcommerce/dist is not empty
  const buildDirContents = await readdir(distDir);

  if (buildDirContents.length === 0) {
    throw new Error(`Dist directory is empty: ${distDir}`);
  }

  const outputZip = join(bigcommerceDir, 'bundle.zip');

  // Use AdmZip to create the zip
  const zip = new AdmZip();

  zip.addLocalFolder(distDir, 'output');
  zip.writeZip(outputZip);

  consola.success(`Bundle created at: ${outputZip}`);
};

export const generateUploadSignature = async (
  storeHash: string,
  accessToken: string,
  apiHost: string,
) => {
  consola.info('Generating upload signature...');

  const response = await fetch(
    `https://${apiHost}/stores/${storeHash}/v3/infrastructure/deployments/uploads`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Correlation-Id': getTelemetry().correlationId,
      },
      body: JSON.stringify({}),
    },
  );

  assertAuthorized(response);

  if (!response.ok) {
    throw await httpError(response, 'Failed to generate upload signature');
  }

  const res: unknown = await response.json();
  const { data } = UploadSignatureSchema.parse(res);

  consola.success('Upload signature generated.');

  return data;
};

export const uploadBundleZip = async (uploadUrl: string) => {
  consola.info('Uploading bundle...');

  const zipPath = join(process.cwd(), '.bigcommerce', 'bundle.zip');

  // Read the zip file as a buffer
  const fileBuffer = await readFile(zipPath);

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/zip',
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    throw await httpError(response, 'Failed to upload bundle');
  }

  consola.success('Bundle uploaded successfully.');

  return true;
};

export const parseEnvironmentVariables = (secretOption?: string[]) => {
  return secretOption?.map((envVar) => {
    const { key, value } = parseEnvAssignment(envVar);

    return {
      type: 'secret' as const,
      key,
      value,
    };
  });
};

export const createDeployment = async (
  projectUuid: string,
  uploadUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
  environmentVariables?: Array<{ type: 'secret' | 'plain_text'; key: string; value: string }>,
) => {
  consola.info('Creating deployment...');

  const response = await fetch(
    `https://${apiHost}/stores/${storeHash}/v3/infrastructure/deployments`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Correlation-Id': getTelemetry().correlationId,
      },
      body: JSON.stringify({
        project_uuid: projectUuid,
        upload_uuid: uploadUuid,
        environment_variables: environmentVariables,
      }),
    },
  );

  assertAuthorized(response);

  if (!response.ok) {
    throw await httpError(response, 'Failed to create deployment');
  }

  const res: unknown = await response.json();
  const { data } = CreateDeploymentSchema.parse(res);

  consola.success('Deployment started...');

  return data;
};

export const getDeploymentStatus = async (
  deploymentUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<string | undefined> => {
  consola.info('Fetching deployment status...');

  const spinner = yoctoSpinner().start('Fetching...');

  const response = await fetch(
    `https://${apiHost}/stores/${storeHash}/v3/infrastructure/deployments/${deploymentUuid}/events`,
    {
      method: 'GET',
      headers: {
        'X-Auth-Token': accessToken,
        Accept: 'text/event-stream',
        Connection: 'keep-alive',
        'X-Correlation-Id': getTelemetry().correlationId,
      },
    },
  );

  assertAuthorized(response);

  if (!response.ok) {
    throw await httpError(response, 'Failed to open deployment event stream');
  }

  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error('Failed to read event stream.');
  }

  const decoder = new TextDecoder();
  let done = false;
  let deploymentHostname: string | undefined;

  while (!done) {
    // eslint-disable-next-line no-await-in-loop
    const { value, done: streamDone } = await reader.read();
    let json: unknown;

    if (value) {
      const chunk = decoder.decode(value, { stream: true }).trim();
      const split = chunk
        .split('\n\n')
        .map((s) => s.replace('data:', '').trim())
        .filter(Boolean);

      // eslint-disable-next-line no-loop-func
      split.forEach((event) => {
        try {
          json = JSON.parse(event);
        } catch (error) {
          consola.warn(`Failed to parse event, dropping from stream. Event: ${event}`, error);

          return;
        }

        const data = DeploymentStatusSchema.parse(json);

        if (data.error) {
          throw new Error(
            `Deployment failed (error code ${data.error.code}): ${getDeploymentErrorMessage(data.error.code)}`,
          );
        }

        if (data.event && STEPS[data.event.step] !== spinner.text) {
          spinner.text = STEPS[data.event.step];
        }

        if (data.deployment_hostnames && data.deployment_hostnames.length > 0) {
          deploymentHostname = data.deployment_hostnames[0];
        }
      });
    }

    done = streamDone;
  }

  spinner.success('Deployment completed successfully.');

  if (deploymentHostname) {
    consola.success(
      `View your deployment at: ${colorize('blue', `https://${deploymentHostname}`)}`,
    );
  }

  return deploymentHostname;
};

export const fetchProject = async (
  projectUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
) => {
  const response = await fetch(
    `https://${apiHost}/stores/${storeHash}/v3/infrastructure/projects`,
    {
      method: 'GET',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Correlation-Id': getTelemetry().correlationId,
      },
    },
  );

  assertAuthorized(response);

  if (!response.ok) {
    throw await httpError(response, 'Failed to fetch projects');
  }

  const res: unknown = await response.json();
  const { data } = ProjectSchema.parse(res);

  return data.find((project) => project.uuid === projectUuid);
};

export const deploy = new Command('deploy')
  .configureHelp({ showGlobalOptions: true })
  .description('Deploy your application to Cloudflare.')
  .addHelpText(
    'after',
    `
Environment variables saved with \`catalyst env add\` are sent automatically on every deploy.
Use \`--secret\` to set or override a variable for a single run.

Example:
  $ catalyst deploy --secret BIGCOMMERCE_STORE_HASH=<YOUR_STORE_HASH> --secret BIGCOMMERCE_STOREFRONT_TOKEN=<YOUR_STOREFRONT_TOKEN>`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .option(
    '--update-site-url',
    "After a successful deploy, prompt to update a channel's site URL to the new hostname.",
  )
  .addOption(
    new Option(
      '--secret <value>',
      'Secret to set for this deployment (repeatable). Overrides a stored value for the same key. Format: --secret KEY=VALUE',
    ).argParser((value: string, previous: string[] = []) => {
      return previous.concat([value]);
    }),
  )
  .option('--dry-run', 'Run the command to generate the bundle without uploading or deploying.')
  .option(
    '--prebuilt',
    'Skip the build step. Requires .bigcommerce/dist/ to already contain build output.',
  )
  .addOption(envPathOption())
  .action(async (options) => {
    const config = getProjectConfig();
    const apiHost = resolveApiHost(options, config);
    const { storeHash, accessToken } = resolveCredentials(options, config);
    const telemetry = getTelemetry();

    await telemetry.identify(storeHash);

    // Resolve a *valid* projectUuid before doing any expensive build/upload
    // work. If the linked UUID no longer exists on the server (e.g. project
    // deleted out from under us), prompt the user to pick a new one rather
    // than failing mid-deploy.
    const linkedProjectUuid = options.projectUuid ?? config.get('projectUuid');
    let projectUuid: string;

    const promptForProject = async (): Promise<{ uuid: string; name: string }> => {
      try {
        return await selectOrCreateInfrastructureProject({
          storeHash,
          accessToken,
          apiHost,
        });
      } catch (error) {
        if (error instanceof NoLinkedProjectError) {
          consola.info(
            "When you're ready to create a project, run `catalyst project create` or re-run `catalyst deploy`.",
          );
          process.exit(0);
        }

        throw error;
      }
    };

    if (linkedProjectUuid) {
      const existing = await fetchProject(linkedProjectUuid, storeHash, accessToken, apiHost);

      if (existing) {
        projectUuid = linkedProjectUuid;
      } else {
        consola.warn(
          `The linked project (${linkedProjectUuid}) no longer exists on this store. It may have been deleted.`,
        );

        const selected = await promptForProject();

        projectUuid = selected.uuid;
        config.set('projectUuid', projectUuid);
        consola.success(`Linked project "${selected.name}".`);
      }
    } else {
      consola.info('No project is currently linked.');

      const selected = await promptForProject();

      projectUuid = selected.uuid;
      config.set('projectUuid', projectUuid);
      consola.success(`Linked project "${selected.name}".`);
    }

    // The OpenNext build pipeline requires the project to be transformed
    // (proxy.ts → middleware.ts, @opennextjs/cloudflare installed). Run setup
    // here so first-run `catalyst deploy` works on a fresh self-hosted scaffold
    // without forcing the user to re-run after a separate setup step.
    if (!getProjectState().isTransformed) {
      const shouldSetup = await confirm({
        message:
          'Your project is not yet set up for Commerce Hosting deployments. Would you like to run the Commerce Hosting setup now?',
        default: true,
      });

      if (!shouldSetup) {
        consola.info("When you're ready to deploy, re-run `catalyst deploy` to complete setup.");
        process.exit(0);
      }

      const projectDir = process.cwd();

      await setupCommerceHosting({ projectDir, projectUuid, storeHash, accessToken });
      consola.success('Commerce Hosting setup complete.');

      await installDependencies(projectDir);
    } else {
      // Existing Commerce Hosting users may carry artifacts incompatible with
      // the Cloudflare worker bundle from earlier Catalyst versions
      // (`core/instrumentation.ts`, `@vercel/otel`). Sweep them on every deploy
      // so the fix lands without forcing a re-link.
      await cleanupCloudflareIncompatibilities(process.cwd());
    }

    if (options.prebuilt) {
      const distDir = join(process.cwd(), '.bigcommerce', 'dist');

      try {
        await access(distDir);
      } catch {
        throw new Error(
          'No build output found at .bigcommerce/dist/. Run `catalyst build` first or remove `--prebuilt` to build automatically.',
        );
      }

      const contents = await readdir(distDir);

      if (contents.length === 0) {
        throw new Error(
          'No build output found at .bigcommerce/dist/. Run `catalyst build` first or remove `--prebuilt` to build automatically.',
        );
      }

      consola.info('Using existing build output (--prebuilt).');
    } else {
      // The build reads storefront env vars (BIGCOMMERCE_*). Load them from the
      // env file(s) before building so both the build and any pre-build checks
      // see them. Skipped for --prebuilt above, which doesn't run the build.
      loadBuildEnv({ envPath: options.envPath });

      await buildCatalystProject(projectUuid);
    }

    await generateBundleZip();

    if (options.dryRun) {
      consola.info('Dry run enabled — skipping upload and deployment steps.');
      consola.info('Next steps (skipped):');
      consola.info('- Generate upload signature');
      consola.info('- Upload bundle.zip');
      consola.info('- Create deployment');

      process.exit(0);
    }

    const uploadSignature = await generateUploadSignature(storeHash, accessToken, apiHost);

    await uploadBundleZip(uploadSignature.upload_url);

    // Merge persisted env vars (`catalyst env add`) with any inline `--secret`
    // flags. Inline flags win on conflict, letting users override a stored
    // value for a single run. Send `undefined` when there's nothing to set so
    // we preserve the prior payload shape.
    const flagSecrets = parseEnvironmentVariables(options.secret) ?? [];
    const persistedSecrets = toDeploymentSecrets(getStoredEnv(config));
    const mergedSecrets = mergeDeploymentSecrets(persistedSecrets, flagSecrets);
    const environmentVariables = mergedSecrets.length > 0 ? mergedSecrets : undefined;

    const { deployment_uuid: deploymentUuid } = await createDeployment(
      projectUuid,
      uploadSignature.upload_uuid,
      storeHash,
      accessToken,
      apiHost,
      environmentVariables,
    );

    const deploymentHostname = await getDeploymentStatus(
      deploymentUuid,
      storeHash,
      accessToken,
      apiHost,
    );

    if (!options.updateSiteUrl) {
      return;
    }

    try {
      await runChannelSiteUrlFlow({
        storeHash,
        accessToken,
        apiHost,
        projectUuid,
        preferHostname: deploymentHostname,
      });
    } catch (error) {
      // Soft-fail: the deploy already succeeded and the bundle is live. A
      // non-zero exit here would be misleading.
      consola.warn(
        `Failed to update channel site URL: ${error instanceof Error ? error.message : String(error)}`,
      );
      consola.info(
        'Update it manually in the control panel, or re-run `catalyst auth login` if the token is missing the store_channel_settings scope.',
      );
    }
  });
