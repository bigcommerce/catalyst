import archiver from 'archiver';
import { Command } from 'commander';
import { consola } from 'consola';
import { createWriteStream } from 'node:fs';
import { access, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const generateBundleZip = async (rootDir: string) => {
  consola.info('Generating bundle.zip');

  const buildDir = join(rootDir, '.open-next');
  const distDir = join(rootDir, '.bigcommerce/dist');

  try {
    await access(distDir);
  } catch {
    await mkdir(distDir, { recursive: true });
  }

  const outputZip = join(distDir, 'bundle.zip');

  const output = createWriteStream(outputZip);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    consola.success(`Created ${outputZip} (${archive.pointer()} total bytes)`);
  });

  archive.on('error', (err) => {
    consola.error('Error creating zip:', err);
    process.exit(1);
  });

  archive.pipe(output);

  archive.directory(buildDir, 'output');

  await archive.finalize();
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
