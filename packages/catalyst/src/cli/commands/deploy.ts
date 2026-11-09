import { confirm } from '@inquirer/prompts';
import AdmZip from 'adm-zip';
import { Command, Option } from 'commander';
import { colorize } from 'consola/utils';
import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import yoctoSpinner from 'yocto-spinner';
import { z } from 'zod';

import { assertAuthorized } from '../lib/auth-errors';
import { applyEnvFileOptions, loadBuildEnv, readBuildEnv } from '../lib/build-env';
import { runChannelCheckoutUrlFlow } from '../lib/channel-checkout-url-flow';
import { runChannelSiteUrlFlow } from '../lib/channel-site-flow';
import {
  cleanupCloudflareIncompatibilities,
  NoLinkedProjectError,
  reconcileOpenNextVersion,
  selectOrCreateInfrastructureProject,
  setupCommerceHosting,
} from '../lib/commerce-hosting';
import { deployedChannelId, offerChannelUrlUpdates } from '../lib/deploy-channel-urls';
import { getDeploymentErrorMessage } from '../lib/deployment-errors';
import { detectProjectPackageManager } from '../lib/detect-package-manager';
import {
  type DeploymentSecret,
  getStoredEnv,
  mergeDeploymentSecrets,
  parseEnvAssignment,
  toDeploymentSecrets,
  toEnvFileSecrets,
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

import { buildCatalystProject, parseWranglerVersion, WRANGLER_VERSION } from './build';

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

const NATIVE_HOSTING_ENV = {
  type: 'plain_text',
  key: 'CATALYST_HOSTING',
  value: 'native',
} as const;

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

// The events stream closes after 30s, and the deploy job can run for 10 minutes.
const DEPLOYMENT_STATUS_TIMEOUT_MS = 15 * 60 * 1000;
const RECONNECT_DELAY_MS = 1000;

// undici rejects with a TypeError ("terminated", "fetch failed") when the socket drops.
const isNetworkError = (error: unknown) => error instanceof TypeError;

type DeploymentStatusEvent = z.infer<typeof DeploymentStatusSchema>;

const timeoutError = () =>
  new Error(
    'Timed out waiting for the deployment to finish. It may still complete in the background.',
  );

// SSE lines can end in CRLF, LF or CR. A trailing CR may be the first half of a CRLF
// split across reads, so it is left for the next read.
const normalizeLineEndings = (text: string, { keepTrailingCr = false } = {}) =>
  text.replace(keepTrailingCr ? /\r\n|\r(?!$)/g : /\r\n?/g, '\n');

// Joins the `data:` lines of one SSE frame; keep-alive comments have none.
const frameData = (frame: string) =>
  frame
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trim())
    .join('\n');

// Reads one connection of the event stream until the server closes it.
const readDeploymentEvents = async (
  deploymentUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
  signal: AbortSignal,
  onEvent: (data: DeploymentStatusEvent) => void,
) => {
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
      signal,
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

  // Ends a stream that stays open past the deadline.
  signal.addEventListener(
    'abort',
    () => {
      reader.cancel().catch(() => undefined);
    },
    { once: true },
  );

  const decoder = new TextDecoder();
  let buffer = '';

  const processFrame = (frame: string) => {
    const event = frameData(frame);

    if (!event) {
      return;
    }

    let json: unknown;

    try {
      json = JSON.parse(event);
    } catch (error) {
      consola.warn(`Failed to parse event, dropping from stream. Event: ${event}`, error);

      return;
    }

    onEvent(DeploymentStatusSchema.parse(json));
  };

  // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { value, done } = await reader.read();

    if (done) {
      processFrame(normalizeLineEndings(buffer + decoder.decode()));
      break;
    }

    // A frame can span reads, so only complete frames are parsed.
    const frames = normalizeLineEndings(buffer + decoder.decode(value, { stream: true }), {
      keepTrailingCr: true,
    }).split('\n\n');

    buffer = frames.pop() ?? '';
    frames.forEach(processFrame);
  }
};

export const getDeploymentStatus = async (
  deploymentUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
  { timeoutMs = DEPLOYMENT_STATUS_TIMEOUT_MS, reconnectDelayMs = RECONNECT_DELAY_MS } = {},
): Promise<string | undefined> => {
  consola.info('Fetching deployment status...');

  const spinner = yoctoSpinner().start('Fetching...');
  const deadline = Date.now() + timeoutMs;
  let status: DeploymentStatusEvent['deployment_status'] | undefined;
  let deploymentHostname: string | undefined;

  const onEvent = (data: DeploymentStatusEvent) => {
    if (data.error) {
      throw new Error(
        `Deployment failed (error code ${data.error.code}): ${getDeploymentErrorMessage(data.error.code)}`,
      );
    }

    if (data.deployment_status === 'failed') {
      throw new Error('Deployment failed.');
    }

    if (data.event && STEPS[data.event.step] !== spinner.text) {
      spinner.text = STEPS[data.event.step];
    }

    if (data.deployment_hostnames && data.deployment_hostnames.length > 0) {
      deploymentHostname = data.deployment_hostnames[0];
    }

    status = data.deployment_status;
  };

  // Each new connection starts with the current state, so reconnecting loses nothing.
  // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
  while (true) {
    const signal = AbortSignal.timeout(Math.max(deadline - Date.now(), 0));

    try {
      // eslint-disable-next-line no-await-in-loop
      await readDeploymentEvents(deploymentUuid, storeHash, accessToken, apiHost, signal, onEvent);
    } catch (error) {
      if (status !== 'completed') {
        if (signal.aborted) {
          throw timeoutError();
        }

        if (!isNetworkError(error)) {
          throw error;
        }

        consola.debug('Deployment event stream disconnected.', error);
      }
    }

    if (status === 'completed') {
      break;
    }

    if (Date.now() >= deadline) {
      throw timeoutError();
    }

    consola.debug('Reconnecting to the deployment event stream...');

    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, reconnectDelayMs));
  }

  spinner.success('Deployment completed successfully.');

  if (deploymentHostname) {
    consola.success(
      `View your deployment at: ${colorize('blue', `https://${deploymentHostname}`)}`,
    );
  }

  return deploymentHostname;
};

// Precedence: `--secret` > `--env-path` file > `catalyst env add`. The
// `--env-path` file is sent as bindings, not just baked into the bundle,
// because bindings override baked values at runtime.
const resolveDeploymentSecrets = (
  storedEnv: Record<string, string>,
  envFileVars: Record<string, string> | undefined,
  flagSecrets: DeploymentSecret[],
): DeploymentSecret[] => {
  const envFileSecrets = toEnvFileSecrets(envFileVars ?? {});

  const overriddenKeys = envFileSecrets
    .filter(({ key, value }) => key in storedEnv && storedEnv[key] !== value)
    .filter(({ key }) => !flagSecrets.some((secret) => secret.key === key))
    .map(({ key }) => key);

  if (overriddenKeys.length > 0) {
    consola.info(
      `--env-path overrides values saved with \`catalyst env add\`: ${overriddenKeys.join(', ')}`,
    );
  }

  return mergeDeploymentSecrets(toDeploymentSecrets(storedEnv), envFileSecrets, flagSecrets);
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
\`--env-path <file>\` overrides them with that file's variables, and \`--secret\` sets or
overrides a single variable for this run (it wins over both).

Without \`--update-site-url\` or \`--update-checkout-url\`, an interactive deploy offers to
point the channel's site URL at the deployment and to move its checkout onto the same domain.
Each is checked on every deploy; declining either is saved in .bigcommerce/project.json.

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
  .option(
    '--update-checkout-url',
    "After a successful deploy, prompt to update a channel's checkout URL.",
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
  .addOption(
    new Option(
      '--wrangler-version <version>',
      `Wrangler version or dist-tag to build with. Ignored with --prebuilt. Defaults to ${WRANGLER_VERSION}.`,
    ).argParser(parseWranglerVersion),
  )
  .addOption(envPathOption())
  .action(async (options, command: Command) => {
    // Resolve CATALYST_* options from the env file before using them.
    applyEnvFileOptions(command, readBuildEnv({ envPath: options.envPath }));

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
            "When you're ready to create a project, run `catalyst projects create` or re-run `catalyst deploy`.",
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
          'Your project is not yet set up for Storefront Hosting deployments. Would you like to run the Storefront Hosting setup now?',
        default: true,
      });

      if (!shouldSetup) {
        consola.info("When you're ready to deploy, re-run `catalyst deploy` to complete setup.");
        process.exit(0);
      }

      const projectDir = process.cwd();

      await setupCommerceHosting({ projectDir, projectUuid, storeHash, accessToken });
      consola.success('Storefront Hosting setup complete.');

      // Match the manager the project was scaffolded with (from its lockfile),
      // rather than forcing pnpm on npm/yarn/bun projects.
      const packageManager = await detectProjectPackageManager(projectDir);

      await installDependencies(projectDir, packageManager);
    } else {
      // Existing Commerce Hosting users may carry artifacts incompatible with
      // the Cloudflare worker bundle from earlier Catalyst versions
      // (`core/instrumentation.ts`, `@vercel/otel`). Sweep them on every deploy
      // so the fix lands without forcing a re-link.
      await cleanupCloudflareIncompatibilities(process.cwd());

      // The build path offers to move a stale adapter pin. `--prebuilt` skips
      // the build, so surface it here instead -- without changing dependencies
      // the existing bundle was never compiled against.
      if (options.prebuilt) {
        const projectDir = process.cwd();

        await reconcileOpenNextVersion(projectDir, await detectProjectPackageManager(projectDir), {
          canUpgrade: false,
        });
      }
    }

    let envFileVars: Record<string, string> | undefined;

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

      // Nothing is built, but `--env-path` still sets the runtime values below.
      if (options.envPath !== undefined) {
        envFileVars = loadBuildEnv({ envPath: options.envPath });
      }
    } else {
      // The build reads storefront env vars (BIGCOMMERCE_*). Load them from the
      // env file(s) before building so both the build and any pre-build checks
      // see them. Skipped for --prebuilt above, which doesn't run the build.
      envFileVars = loadBuildEnv({ envPath: options.envPath });

      await buildCatalystProject(projectUuid, options.wranglerVersion, envFileVars);
    }

    const mergedSecrets = resolveDeploymentSecrets(
      getStoredEnv(config),
      envFileVars,
      parseEnvironmentVariables(options.secret) ?? [],
    );
    const environmentVariables = [...mergedSecrets, NATIVE_HOSTING_ENV];

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

    // Soft-failed: the bundle is already live, so a non-zero exit here would
    // misrepresent what happened.
    const warnChannelFlowFailed = (what: string, error: unknown) => {
      consola.warn(
        `Failed to update channel ${what}: ${error instanceof Error ? error.message : String(error)}`,
      );
      consola.info(
        'Update it manually in the control panel, or re-run `catalyst auth login` if the token is missing the store_channel_settings scope.',
      );
    };

    // Carried over so both flags don't ask which channel twice.
    let resolvedChannelId: number | undefined;

    // Set by --update-site-url, so checkout pairs with the hostname actually used.
    let siteHostname: string | undefined;

    if (options.updateSiteUrl) {
      try {
        ({ channelId: resolvedChannelId, hostname: siteHostname } = await runChannelSiteUrlFlow({
          storeHash,
          accessToken,
          apiHost,
          projectUuid,
          preferHostname: deploymentHostname,
        }));
      } catch (error) {
        warnChannelFlowFailed('site URL', error);
      }
    }

    if (options.updateCheckoutUrl) {
      try {
        await runChannelCheckoutUrlFlow({
          storeHash,
          accessToken,
          apiHost,
          channelId: resolvedChannelId,
          storefrontHostname: siteHostname,
        });
      } catch (error) {
        warnChannelFlowFailed('checkout URL', error);
      }
    }

    // Neither flag: offer both. Explicit flags mean the caller already decided.
    if (!options.updateSiteUrl && !options.updateCheckoutUrl) {
      try {
        await offerChannelUrlUpdates({
          storeHash,
          accessToken,
          apiHost,
          projectUuid,
          config,
          deploymentHostname,
          channelId: deployedChannelId(mergedSecrets),
        });
      } catch (error) {
        warnChannelFlowFailed('URLs', error);
      }
    }
  });
