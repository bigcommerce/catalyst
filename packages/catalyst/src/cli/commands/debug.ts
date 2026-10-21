import { Command, Option } from 'commander';

import { collectDiagnostics } from '../lib/collect-diagnostics';
import { formatDiagnosticsReport } from '../lib/format-diagnostics';
import { consola } from '../lib/logger';

export const debug = new Command('debug')
  .configureHelp({ showGlobalOptions: true })
  .description(
    'Print a diagnostic report (CLI, runtime, project, and config state) to include when filing a bug report. Never prints secret values — credentials and env vars are reported by presence only.',
  )
  .addHelpText(
    'after',
    `
Examples:
  # Print a human-readable report
  $ catalyst debug

  # Print machine-readable JSON (useful for copy/paste or piping)
  $ catalyst debug --json`,
  )
  .addOption(new Option('--json', 'Output the report as JSON.'))
  .action((options: { json?: boolean }) => {
    const diagnostics = collectDiagnostics();

    if (options.json) {
      consola.log(JSON.stringify(diagnostics, null, 2));

      return;
    }

    consola.log(formatDiagnosticsReport(diagnostics));
  });
