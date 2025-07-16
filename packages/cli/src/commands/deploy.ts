import AdmZip from 'adm-zip';
import { Command } from 'commander';
import { consola } from 'consola';
import { access, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const generateBundleZip = async (rootDir: string) => {
  consola.info('Generating bundle.zip');

  const buildDir = join(rootDir, '.open-next');
  const distDir = join(rootDir, '.bigcommerce/dist');

  // Check for distDir or create one
  try {
    await access(distDir);
  } catch {
    await mkdir(distDir, { recursive: true });
  }

  const outputZip = join(distDir, 'bundle.zip');

  // Use AdmZip to create the zip
  const zip = new AdmZip();

  zip.addLocalFolder(buildDir, 'output');
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
  });
