import AdmZip from 'adm-zip';
import { Command } from 'commander';
import { consola } from 'consola';
import { access, readdir } from 'node:fs/promises';
import { join } from 'node:path';

export const generateBundleZip = async (rootDir: string) => {
  consola.info('Generating bundle.zip');

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

  consola.success(`Created ${outputZip}`);
};

interface DeployOptions {
  rootDir: string;
}

export const deploy = new Command('deploy')
  .description('Deploy the application to Cloudflare')
  .option('--root-dir <rootDir>', 'Root directory', process.cwd())
  .action(async (opts: DeployOptions) => {
    await generateBundleZip(opts.rootDir);

    // @todo rest of upload flow
    process.exit(0);
  });
