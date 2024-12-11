import { execSync } from 'node:child_process';

export function resetBranchToRef(projectDir: string, ghRef: string): void {
  execSync(`git reset --hard ${ghRef}`, {
    cwd: projectDir,
    stdio: 'inherit',
    encoding: 'utf8',
  });
}
