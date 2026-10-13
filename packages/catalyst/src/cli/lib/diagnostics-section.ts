import { homedir } from 'node:os';

import { collectDiagnostics } from './collect-diagnostics';
import type { DiagnosticsSection } from './feedback';
import { formatDiagnosticsReport } from './format-diagnostics';

// Replaces the home directory with `~`, so the OS user name is not sent.
export function redactHome(text: string): string {
  const home = homedir();

  // An empty `home` would split the text into characters.
  return home ? text.split(home).join('~') : text;
}

// The `catalyst debug` report, for feedback and error reports. It never
// contains secret values.
export function diagnosticsReportSection(): DiagnosticsSection {
  return {
    title: 'Catalyst CLI diagnostics',
    body: redactHome(formatDiagnosticsReport(collectDiagnostics())),
  };
}
