import { sync as spawnSync } from 'cross-spawn';

export function resetBranchToRef(projectDir: string, ghRef: string) {
  const spawn = spawnSync('git', ['reset', '--hard', ghRef, '--'], {
    cwd: projectDir,
    encoding: 'utf8',
    shell: false,
  });

  const stderr = spawn.stderr.trim();

  if (spawn.status !== 0 && stderr) {
    throw new Error(stderr);
  }
}
