import { execSync } from 'child_process';

import { checkoutRef } from './checkout-ref';
import { hasGitHubSSH } from './has-github-ssh';

export const cloneCatalyst = ({
  repository,
  projectName,
  projectDir,
  ghRef,
}: {
  repository: string;
  projectName: string;
  projectDir: string;
  ghRef?: string;
}) => {
  const useSSH = hasGitHubSSH();

  console.log(`Cloning ${repository} using ${useSSH ? 'SSH' : 'HTTPS'}...\n`);

  const cloneCommand = `git clone ${
    useSSH ? `git@github.com:${repository}` : `https://github.com/${repository}`
  }.git${projectName ? ` ${projectName}` : ''}`;

  execSync(cloneCommand, { stdio: 'inherit' });
  console.log();

  execSync('git remote rename origin upstream', { cwd: projectDir, stdio: 'inherit' });
  console.log();

  if (ghRef) {
    checkoutRef(projectDir, ghRef);
    console.log();
  }
};
