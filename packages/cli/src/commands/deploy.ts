import AdmZip from 'adm-zip';
import { Command } from 'commander';
import { consola } from 'consola';
import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { BigCommerceResponse } from '../types';

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
    const { data } = (await response.json()) as BigCommerceResponse<{
      upload_url: string;
      upload_uuid: string;
    }>;

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
  rootDir: string;
  apiHost: string;
}

export const deploy = new Command('deploy')
  .description('Deploy the application to Cloudflare')
  .argument('<storeHash>')
  .argument('<accessToken>')
  .option('--root-dir <rootDir>', 'Root directory', process.cwd())
  .option('--api-host <apiHost>', 'API host endpoint', 'api.bigcommerce.com')
  .action(async (storeHash: string, accessToken: string, opts: DeployOptions) => {
    await generateBundleZip(opts.rootDir);

    const uploadSignature = await generateUploadSignature(storeHash, accessToken, opts.apiHost);

    await uploadBundleZip(uploadSignature.upload_url, opts.rootDir);

    // @todo rest of upload flow
    process.exit(0);
  });
