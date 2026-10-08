import { homedir } from 'node:os';

import { collectDiagnostics } from './collect-diagnostics';
import type { DiagnosticsSection } from './feedback';
import { formatDiagnosticsReport } from './format-diagnostics';

// Replaces the home directory with `~`, so the OS user name is not sent.
export function redactHome(text: string, home: string = homedir()): string {
  return home ? text.split(home).join('~') : text;
}

// The same report as `catalyst debug`, for feedback and error reports. It
// never contains secret values.
export function diagnosticsReportSection(): DiagnosticsSection {
  const diagnostics = collectDiagnostics();

  return {
    title: 'Catalyst CLI diagnostics',
    body: formatDiagnosticsReport({
      ...diagnostics,
      project: { ...diagnostics.project, cwd: redactHome(diagnostics.project.cwd) },
    }),
  };
}
