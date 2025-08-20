import AdmZip from 'adm-zip';
import { Command, Option } from 'commander';
import { consola } from 'consola';
import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import yoctoSpinner from 'yocto-spinner';
import { z } from 'zod';

import { getProjectConfig } from '../lib/project-config';
import { Telemetry } from '../lib/telemetry';

const telemetry = new Telemetry();

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

const DeploymentStatusSchema = z.object({
  deployment_uuid: z.uuid(),
  deployment_status: z.enum(['queued', 'in_progress', 'failed', 'completed']),
  event: z
    .object({
      step: stepsEnum,
      progress: z.number(),
    })
    .nullable(),
  error: z
    .object({
      code: z.number(),
    })
    .optional(),
});

export const generateBundleZip = async (rootDir: string) => {
  consola.info('Generating bundle...');

  const distDir = join(rootDir, '.bigcommerce/dist');

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

  const outputZip = join(distDir, 'bundle.zip');

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

export const uploadBundleZip = async (uploadUrl: string, rootDir: string) => {
  consola.info('Uploading bundle...');

  const zipPath = join(rootDir, '.bigcommerce/dist/bundle.zip');

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

export const createDeployment = async (
  projectUuid: string,
  uploadUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
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
      },
      body: JSON.stringify({
        project_uuid: projectUuid,
        upload_uuid: uploadUuid,
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

      split.forEach((event) => {
        try {
          json = JSON.parse(event);
        } catch (error) {
          consola.warn(`Failed to parse event, dropping from stream. Event: ${event}`, error);

          return;
        }

        const data = DeploymentStatusSchema.parse(json);

        if (data.error) {
          throw new Error(`Deployment failed with error code: ${data.error.code}`);
        }

        if (data.event && STEPS[data.event.step] !== spinner.text) {
          spinner.text = STEPS[data.event.step];
        }
      });
    }

    done = streamDone;
  }

  spinner.success('Deployment completed successfully.');
};

export const deploy = new Command('deploy')
  .description('Deploy your application to Cloudflare.')
  .addOption(
    new Option(
      '--store-hash <hash>',
      'BigCommerce store hash. Can be found in the URL of your store Control Panel.',
    )
      .env('BIGCOMMERCE_STORE_HASH')
      .makeOptionMandatory(),
  )
  .addOption(
    new Option(
      '--access-token <token>',
      'BigCommerce access token. Can be found after creating a store-level API account.',
    )
      .env('BIGCOMMERCE_ACCESS_TOKEN')
      .makeOptionMandatory(),
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
    ).env('BIGCOMMERCE_PROJECT_UUID'),
  )
  .option(
    '--root-dir <path>',
    'Path to the root directory of your Catalyst project (default: current working directory).',
    process.cwd(),
  )
  .action(async (opts) => {
    try {
      const config = getProjectConfig(opts.rootDir);

      await telemetry.identify(opts.storeHash);

      const projectUuid = opts.projectUuid ?? config.get('projectUuid');

      if (!projectUuid) {
        throw new Error(
          'Project UUID is required. Please run either `bigcommerce link` or this command again with --project-uuid <uuid>.',
        );
      }

      await generateBundleZip(opts.rootDir);

      const uploadSignature = await generateUploadSignature(
        opts.storeHash,
        opts.accessToken,
        opts.apiHost,
      );

      await uploadBundleZip(uploadSignature.upload_url, opts.rootDir);

      const { deployment_uuid: deploymentUuid } = await createDeployment(
        projectUuid,
        uploadSignature.upload_uuid,
        opts.storeHash,
        opts.accessToken,
        opts.apiHost,
      );

      await getDeploymentStatus(deploymentUuid, opts.storeHash, opts.accessToken, opts.apiHost);
    } catch (error) {
      consola.error(error);
      process.exit(1);
    }
  });
