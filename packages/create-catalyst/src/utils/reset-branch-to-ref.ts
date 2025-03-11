import { sync as spawnSync } from 'cross-spawn';

export function resetBranchToRef(projectDir: string, ghRef: string) {
  const spawn = spawnSync('git', ['reset', '--hard', ghRef, '--'], {
    cwd: projectDir,
    encoding: 'utf8',
    // Explicitly set shell to false to avoid shell injection
    // Don't use shell: true as it's a security risk
    shell: false,
  });

  const stderr = spawn.stderr.trim();

  if (spawn.status !== 0 && stderr) {
    throw new Error(stderr);
  }
}
