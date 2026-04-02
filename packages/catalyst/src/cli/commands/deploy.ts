import AdmZip from 'adm-zip';
import { Command, Option } from 'commander';
import { colorize } from 'consola/utils';
import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import yoctoSpinner from 'yocto-spinner';
import { z } from 'zod';

import { getDeploymentErrorMessage } from '../lib/deployment-errors';
import { consola } from '../lib/logger';
import { getProjectConfig } from '../lib/project-config';
import { resolveCredentials } from '../lib/resolve-credentials';
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
  deployment_url: z.string().nullable(),
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

  if (!response.ok) {
    throw new Error(`Failed to fetch upload signature: ${response.status} ${response.statusText}`);
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
    throw new Error(`Failed to upload bundle: ${response.status} ${response.statusText}`);
  }

  consola.success('Bundle uploaded successfully.');

  return true;
};

export const parseEnvironmentVariables = (secretOption?: string[]) => {
  return secretOption?.map((envVar) => {
    const [key, value] = envVar.split('=');

    if (!key || !value) {
      throw new Error(`Invalid secret format: ${envVar}. Expected format: KEY=VALUE`);
    }

    return {
      type: 'secret' as const,
      key: key.trim(),
      value: value.trim(),
    };
  });
};

const AUTO_DETECT_SECRETS = [
  { key: 'BIGCOMMERCE_STORE_HASH', warnIfMissing: true },
  { key: 'BIGCOMMERCE_CHANNEL_ID', warnIfMissing: true },
  { key: 'BIGCOMMERCE_STOREFRONT_TOKEN', warnIfMissing: true },
  { key: 'BIGCOMMERCE_API_HOST', warnIfMissing: false },
  { key: 'BIGCOMMERCE_GRAPHQL_API_DOMAIN', warnIfMissing: false },
];

export const autoDetectSecrets = (
  environmentVariables?: Array<{ type: 'secret' | 'plain_text'; key: string; value: string }>,
) => {
  const secrets = environmentVariables ?? [];
  const existingKeys = new Set(secrets.map((s) => s.key));

  AUTO_DETECT_SECRETS.forEach(({ key, warnIfMissing }) => {
    if (existingKeys.has(key)) {
      return;
    }

    const value = process.env[key];

    if (value) {
      secrets.push({ type: 'secret', key, value });
    } else if (warnIfMissing) {
      consola.warn(`${key} is not set in the environment and was not provided via --secret.`);
    }
  });

  return secrets;
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

  if (!response.ok) {
    throw new Error(`Failed to create deployment: ${response.status} ${response.statusText}`);
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
) => {
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

  if (!response.ok) {
    throw new Error(`Failed to open event stream: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error('Failed to read event stream.');
  }

  const decoder = new TextDecoder();
  let done = false;
  let deploymentUrl: string | undefined;

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

        if (data.deployment_url) {
          deploymentUrl = data.deployment_url;
        }
      });
    }

    done = streamDone;
  }

  spinner.success('Deployment completed successfully.');

  if (deploymentUrl) {
    const url = deploymentUrl.startsWith('https://') ? deploymentUrl : `https://${deploymentUrl}`;

    consola.success(`View your deployment at: ${colorize('blue', url)}`);
  }
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

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
  }

  const res: unknown = await response.json();
  const { data } = ProjectSchema.parse(res);

  return data.find((project) => project.uuid === projectUuid);
};

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
    new Option('--api-host <host>', 'BigCommerce API host. The default is api.bigcommerce.com.')
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
  .option('--dry-run', 'Run the command to generate the bundle without uploading or deploying.')
  .option(
    '--prebuilt',
    'Skip the build step. Requires .bigcommerce/dist/ to already contain build output.',
  )
  .action(async (options) => {
    const config = getProjectConfig();
    const { storeHash, accessToken } = resolveCredentials(options, config);
    const telemetry = getTelemetry();
    const projectUuid = options.projectUuid ?? config.get('projectUuid');

    if (!projectUuid) {
      throw new Error(
        'Project UUID is required. Please run either `catalyst project link` or `catalyst project create` or this command again with --project-uuid <uuid>.',
      );
    }

    await telemetry.identify(storeHash);

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

    const uploadSignature = await generateUploadSignature(storeHash, accessToken, options.apiHost);

    await uploadBundleZip(uploadSignature.upload_url);

    const environmentVariables = autoDetectSecrets(parseEnvironmentVariables(options.secret));

    const { deployment_uuid: deploymentUuid } = await createDeployment(
      projectUuid,
      uploadSignature.upload_uuid,
      storeHash,
      accessToken,
      options.apiHost,
      environmentVariables,
    );

    await getDeploymentStatus(deploymentUuid, storeHash, accessToken, options.apiHost);
  });
