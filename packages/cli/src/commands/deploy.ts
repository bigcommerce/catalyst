import AdmZip from 'adm-zip';
import { Command, Option } from 'commander';
import { consola } from 'consola';
import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';

import { ProjectConfig } from '../lib/project-config';

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
    `https://${apiHost}/stores/${storeHash}/v3/headless/deployments/uploads`,
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

  const response = await fetch(`https://${apiHost}/stores/${storeHash}/v3/headless/deployments`, {
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
  });

  if (!response.ok) {
    throw new Error(`Failed to create deployment: ${response.status} ${response.statusText}`);
  }

  const res: unknown = await response.json();
  const { data } = CreateDeploymentSchema.parse(res);

  consola.success('Deployment started...');

  return data;
};

export const deploy = new Command('deploy')
  .description('Deploy the application to Cloudflare')
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
      'BigCommerce headless project UUID. Can be found via the BigCommerce API (GET /v3/headless/projects).',
    ).env('BIGCOMMERCE_PROJECT_UUID'),
  )
  .option('--root-dir <rootDir>', 'Root directory to deploy from.', process.cwd())
  .action(async (opts) => {
    const config = new ProjectConfig(opts.rootDir);

    try {
      const projectUuid = opts.projectUuid ?? config.get('projectUuid');

      await generateBundleZip(opts.rootDir);

      const uploadSignature = await generateUploadSignature(
        opts.storeHash,
        opts.accessToken,
        opts.apiHost,
      );

      await uploadBundleZip(uploadSignature.upload_url, opts.rootDir);

      await createDeployment(
        projectUuid,
        uploadSignature.upload_uuid,
        opts.storeHash,
        opts.accessToken,
        opts.apiHost,
      );

      // @todo poll for deployment status
    } catch (error) {
      consola.error(error);
      process.exit(1);
    }

    process.exit(0);
  });
