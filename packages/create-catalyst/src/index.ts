import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

// `create-catalyst` is a thin wrapper around `@bigcommerce/catalyst`: it forwards
// everything to `catalyst create` so all scaffolding logic lives in one place
// (mirroring how `create-next-app` fronts `next`). `pnpm create catalyst` /
// `npx create-catalyst` install `@bigcommerce/catalyst` as a dependency, so its
// bin is resolvable from this package — no global `catalyst` install required.
function resolveCatalystBin(): string {
  const packageJsonPath = require.resolve('@bigcommerce/catalyst/package.json');
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const { bin } = require('@bigcommerce/catalyst/package.json') as {
    bin: string | Record<string, string>;
  };
  const relativeBin = typeof bin === 'string' ? bin : bin.catalyst;

  return join(dirname(packageJsonPath), relativeBin);
}

const child = spawn(process.execPath, [resolveCatalystBin(), 'create', ...process.argv.slice(2)], {
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

// Mirror the child's exit so CI/automation sees the real status code, and
// re-raise signals (e.g. Ctrl-C) rather than swallowing them.
child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
