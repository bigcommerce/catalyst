import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import yoctoSpinner from 'yocto-spinner';

const WORKSPACE_PACKAGES = ['packages/catalyst', 'packages/client'] as const;

// Catalyst monorepo layouts ship pre-built workspace packages, but a fresh
// clone needs them rebuilt before `core` can resolve them. Skip silently when
// the layout doesn't match (e.g. flat repo, custom fork) so this stays a no-op
// for non-monorepo scaffolds.
export const buildWorkspacePackages = (projectDir: string) => {
  const hasCore = existsSync(join(projectDir, 'core'));
  const hasAllWorkspacePackages = WORKSPACE_PACKAGES.every((pkg) =>
    existsSync(join(projectDir, pkg)),
  );

  if (!hasCore || !hasAllWorkspacePackages) return;

  WORKSPACE_PACKAGES.forEach((pkg) => {
    const spinner = yoctoSpinner().start(`Building ${pkg}...`);

    try {
      execSync('pnpm build', { cwd: join(projectDir, pkg), stdio: 'ignore' });
      spinner.success(`Built ${pkg}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';

      spinner.error(`Failed to build ${pkg}: ${message}`);
      throw error;
    }
  });
};
