import { execSync } from 'child_process';

import { checkoutRef } from './checkout-ref';
import { hasGitHubSSH } from './has-github-ssh';

export const cloneCatalyst = ({
  projectName,
  projectDir,
  ghRef,
}: {
  projectName: string;
  projectDir: string;
  ghRef?: string;
}) => {
  const repositoryName = 'bigcommerce/catalyst';
  const useSSH = hasGitHubSSH();

  console.log(`Cloning ${repositoryName} using ${useSSH ? 'SSH' : 'HTTPS'}...\n`);

  const cloneCommand = `git clone ${
    useSSH ? `git@github.com:${repositoryName}` : `https://github.com/${repositoryName}`
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
