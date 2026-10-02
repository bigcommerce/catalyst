import { input } from '@inquirer/prompts';
import { Command, Option } from 'commander';
import { homedir } from 'node:os';

import { canPrompt } from '../lib/can-prompt';
import { collectDiagnostics } from '../lib/collect-diagnostics';
import { UserActionableError } from '../lib/errors';
import { type DiagnosticsSection, submitFeedback, validateFeedbackField } from '../lib/feedback';
import { formatDiagnosticsReport } from '../lib/format-diagnostics';
import { consola } from '../lib/logger';
import { getProjectConfig } from '../lib/project-config';
import { resolveCredentials } from '../lib/resolve-credentials';
import {
  accessTokenOption,
  apiHostOption,
  resolveApiHost,
  storeHashOption,
} from '../lib/shared-options';
import { getTelemetry } from '../lib/telemetry';

type Field = 'Title' | 'Description';

const FLAGS: Record<Field, string> = {
  Title: '--title',
  Description: '--description',
};

const PROMPTS: Record<Field, string> = {
  Title: 'Title (a short summary):',
  Description: 'Description (what happened, and what you expected):',
};

// Use the flag value when given, else ask. Without a terminal there is nobody
// to answer, so a missing value is an error.
async function resolveField(field: Field, value: string | undefined): Promise<string> {
  if (value !== undefined) {
    const error = validateFeedbackField(field, value);

    if (error) {
      throw new UserActionableError(error);
    }

    return value.trim();
  }

  if (!canPrompt()) {
    throw new UserActionableError(
      `${FLAGS[field]} is required when the CLI cannot prompt (no TTY or CI).`,
    );
  }

  const answer = await input({
    message: PROMPTS[field],
    validate: (text) => validateFeedbackField(field, text) ?? true,
  });

  return answer.trim();
}

// The same report as `catalyst debug`. It never contains secret values. The
// home directory is replaced with `~` so the OS user name is not sent.
function diagnosticsSection(): DiagnosticsSection {
  const diagnostics = collectDiagnostics();
  const home = homedir();
  const cwd = diagnostics.project.cwd.startsWith(home)
    ? `~${diagnostics.project.cwd.slice(home.length)}`
    : diagnostics.project.cwd;

  return {
    title: 'Catalyst CLI diagnostics',
    body: formatDiagnosticsReport({ ...diagnostics, project: { ...diagnostics.project, cwd } }),
  };
}

export const feedback = new Command('feedback')
  .configureHelp({ showGlobalOptions: true })
  .description(
    'Send feedback, a bug report, or a feature request to the BigCommerce team. A diagnostic report (the same as `catalyst debug`, with no secret values) is attached unless you use --no-diagnostics.',
  )
  .addHelpText(
    'after',
    `
Examples:
  # Answer prompts for the title and description
  $ catalyst feedback

  # Send without prompts
  $ catalyst feedback --title "Deploy hangs" --description "catalyst deploy stops at 'Uploading bundle'."

  # Do not attach the diagnostic report
  $ catalyst feedback --no-diagnostics`,
  )
  .addOption(new Option('--title <title>', 'A short summary of the feedback.'))
  .addOption(new Option('--description <text>', 'The details of the feedback.'))
  .addOption(new Option('--no-diagnostics', 'Do not attach the diagnostic report.'))
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .action(
    async (options: {
      title?: string;
      description?: string;
      diagnostics: boolean;
      storeHash?: string;
      accessToken?: string;
      apiHost?: string;
    }) => {
      const config = getProjectConfig();
      const apiHost = resolveApiHost(options, config);
      const { storeHash, accessToken } = resolveCredentials(options, config);

      await getTelemetry().identify(storeHash);

      const title = await resolveField('Title', options.title);
      const description = await resolveField('Description', options.description);
      const diagnostics = options.diagnostics ? [diagnosticsSection()] : [];

      if (options.diagnostics) {
        consola.info('Attaching the diagnostic report (see `catalyst debug`).');
      }

      consola.start('Sending feedback...');

      await submitFeedback({ title, description, diagnostics }, storeHash, accessToken, apiHost);

      consola.success('Feedback sent. Thank you!');
    },
  );
