import AdmZip from 'adm-zip';
import { Command, Option } from 'commander';
import { consola } from 'consola';
import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';

import { BigCommerceResponse } from '../types';

const UploadSignatureSchema = z.object({
  data: z.object({
    upload_url: z.string().url(),
    upload_uuid: z.string(),
  }),
});

export const generateBundleZip = async (rootDir: string) => {
  consola.info('Generating bundle...');

  const distDir = join(rootDir, '.bigcommerce/dist');

  // Check if .bigcommerce/dist exists
  try {
    await access(distDir);
  } catch {
    consola.error(`Dist directory not found: ${distDir}`);
    process.exit(1);
  }

  // Check if .bigcommerce/dist is not empty
  const buildDirContents = await readdir(distDir);

  if (buildDirContents.length === 0) {
    consola.error(`Dist directory is empty: ${distDir}`);
    process.exit(1);
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

  try {
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
      consola.error(`Failed to fetch upload signature: ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const json = (await response.json()) as BigCommerceResponse<{
      upload_url: string;
      upload_uuid: string;
    }>;

    const { data } = UploadSignatureSchema.parse(json);

    consola.success('Upload signature generated.');

    return data;
  } catch (error) {
    consola.error('Error in generateUploadSignature:', error);
    process.exit(1);
  }
};

export const uploadBundleZip = async (uploadUrl: string, rootDir: string) => {
  consola.info('Uploading bundle...');

  const zipPath = join(rootDir, '.bigcommerce/dist/bundle.zip');

  // Read the zip file as a buffer
  const fileBuffer = await readFile(zipPath);

  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/zip',
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      consola.error(`Failed to upload bundle: ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    consola.success('Bundle uploaded successfully.');

    return true;
  } catch (error) {
    consola.error('Error in uploadBundleZip:', error);
    process.exit(1);
  }
};

interface DeployOptions {
  storeHash?: string;
  accessToken?: string;
  rootDir: string;
  apiHost: string;
}

export const deploy = new Command('deploy')
  .description('Deploy the application to Cloudflare')
  .addOption(
    new Option(
      '--store-hash <hash>',
      'BigCommerce store hash. Can be found in the URL of your store Control Panel.',
    ).env('BIGCOMMERCE_STORE_HASH'),
  )
  .addOption(
    new Option(
      '--access-token <token>',
      'BigCommerce access token. Can be found after creating a store-level API account.',
    ).env('BIGCOMMERCE_ACCESS_TOKEN'),
  )
  .option('--root-dir <rootDir>', 'Root directory to deploy from.', process.cwd())
  .option(
    '--api-host <apiHost>',
    'Modifies API host endpoint. Useful for testing other environments.',
    'api.bigcommerce.com',
  )
  .action(async (opts: DeployOptions) => {
    if (!opts.storeHash || !opts.accessToken) {
      consola.error('Missing store hash and access token.');
      process.exit(1);
    }

    await generateBundleZip(opts.rootDir);

    const uploadSignature = await generateUploadSignature(
      opts.storeHash,
      opts.accessToken,
      opts.apiHost,
    );

    await uploadBundleZip(uploadSignature.upload_url, opts.rootDir);

    // @todo rest of upload flow
    process.exit(0);
  });
