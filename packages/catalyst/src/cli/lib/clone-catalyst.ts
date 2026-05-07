import { execSync } from 'child_process';

import { checkoutRef } from './checkout-ref';
import { hasGitHubSSH } from './has-github-ssh';
import { consola } from './logger';
import { resetBranchToRef } from './reset-branch-to-ref';

export const cloneCatalyst = ({
  repository,
  projectName,
  projectDir,
  ghRef,
  resetMain = false,
}: {
  repository: string;
  projectName: string;
  projectDir: string;
  ghRef?: string;
  resetMain?: boolean;
}) => {
  const useSSH = hasGitHubSSH();

  consola.info(`Cloning ${repository} using ${useSSH ? 'SSH' : 'HTTPS'}...`);

  const cloneCommand = `git clone ${
    useSSH ? `git@github.com:${repository}` : `https://github.com/${repository}`
  }.git${projectName ? ` ${projectName}` : ''}`;

  execSync(cloneCommand, { stdio: 'inherit' });

  execSync('git remote rename origin upstream', { cwd: projectDir, stdio: 'inherit' });

  if (ghRef) {
    if (resetMain) {
      execSync('git checkout -b main', { cwd: projectDir, stdio: 'inherit' });

      resetBranchToRef(projectDir, ghRef);

      consola.success(`Reset main to ${ghRef} successfully.`);

      return;
    }

    checkoutRef(projectDir, ghRef);
  }
};
