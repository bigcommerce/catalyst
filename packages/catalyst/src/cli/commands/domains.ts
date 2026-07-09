import { confirm, select } from '@inquirer/prompts';
import { Command, Option } from 'commander';
import { colorize } from 'consola/utils';

import {
  claimDomain,
  createDomain,
  deleteDomain,
  Domain,
  DomainBoundToProjectError,
  DomainOwnershipVerificationError,
  DomainStatus,
  DomainStatusFilter,
  findDomain,
  getDomain,
  listDomains,
  OwnershipVerification,
  transferDomain,
} from '../lib/domains';
import { UserActionableError } from '../lib/errors';
import { consola } from '../lib/logger';
import { fetchProjects } from '../lib/project';
import { getProjectConfig } from '../lib/project-config';
import { resolveCredentials } from '../lib/resolve-credentials';
import {
  accessTokenOption,
  apiHostOption,
  projectUuidOption,
  resolveProjectUuid,
  storeHashOption,
} from '../lib/shared-options';
import { getTelemetry } from '../lib/telemetry';

const WAIT_INTERVAL_MS = 5000;
const WAIT_TIMEOUT_MS = 5 * 60 * 1000;
const DOMAIN_STATUS_FILTERS: DomainStatusFilter[] = ['pending', 'verified', 'failed'];

const STATUS_COLORS: Record<DomainStatus, Parameters<typeof colorize>[0]> = {
  pending: 'yellow',
  verified: 'green',
  failed: 'red',
  unknown: 'gray',
};

const STATUS_LABELS: Record<DomainStatus, string> = {
  pending: 'pending',
  verified: 'active',
  failed: 'failed',
  unknown: 'unknown',
};

interface DomainCommandContext {
  projectUuid: string;
  storeHash: string;
  accessToken: string;
  apiHost: string;
}

interface DomainCommandOptions {
  storeHash?: string;
  accessToken?: string;
  apiHost: string;
  projectUuid?: string;
}

interface WaitForDomainVerificationOptions extends DomainCommandContext {
  domain: string;
  intervalMs?: number;
  timeoutMs?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function resolveDomainCommandContext(options: DomainCommandOptions): DomainCommandContext {
  const config = getProjectConfig();
  const { storeHash, accessToken } = resolveCredentials(options, config);
  const projectUuid = resolveProjectUuid(options);

  return {
    projectUuid,
    storeHash,
    accessToken,
    apiHost: options.apiHost,
  };
}

// Resolves the destination project for a transfer. Uses `--to-project-uuid`
// when given; otherwise fetches the store's projects and prompts the user to
// pick one, excluding the source project (a domain can't be transferred to the
// project it already belongs to).
async function resolveDestinationProject(
  domain: string,
  context: DomainCommandContext,
  toProjectUuid?: string,
): Promise<string> {
  if (toProjectUuid) {
    if (toProjectUuid === context.projectUuid) {
      throw new UserActionableError('The destination project must differ from the source project.');
    }

    return toProjectUuid;
  }

  consola.start('Fetching projects...');

  const projects = await fetchProjects(context.storeHash, context.accessToken, context.apiHost);

  consola.success('Projects fetched.');

  const destinations = projects.filter((project) => project.uuid !== context.projectUuid);

  if (destinations.length === 0) {
    throw new UserActionableError(
      'No other projects to transfer to. Create another project with `catalyst project create` first.',
    );
  }

  return select({
    message: `Select the project to transfer ${domain} to (Press <enter> to select).`,
    choices: destinations.map((project) => ({
      name: project.name,
      value: project.uuid,
      description: project.uuid,
    })),
  });
}

export function formatDomainStatus(status: DomainStatus): string {
  return colorize(STATUS_COLORS[status], STATUS_LABELS[status]);
}

export function formatDomain(domain: Domain): string {
  return `${domain.domain} ${formatDomainStatus(domain.verification_status)}`;
}

export function formatOwnershipVerification(record: OwnershipVerification): string {
  const lines = [
    'Add this DNS record to verify ownership:',
    `  Type:  ${record.type}`,
    `  Name:  ${record.name}`,
  ];

  if (record.value) {
    lines.push(`  Value: ${record.value}`);
  }

  return lines.join('\n');
}

export async function waitForDomainVerification({
  domain,
  projectUuid,
  storeHash,
  accessToken,
  apiHost,
  intervalMs = WAIT_INTERVAL_MS,
  timeoutMs = WAIT_TIMEOUT_MS,
}: WaitForDomainVerificationOptions): Promise<Domain> {
  const startedAt = Date.now();
  let current = await getDomain(domain, projectUuid, storeHash, accessToken, apiHost);

  while (current.verification_status === 'pending' && Date.now() - startedAt < timeoutMs) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(intervalMs);
    // eslint-disable-next-line no-await-in-loop
    current = await getDomain(domain, projectUuid, storeHash, accessToken, apiHost);
  }

  return current;
}

const add = new Command('add')
  .configureHelp({ showGlobalOptions: true })
  .description('Add a custom domain to the current Native Hosting project.')
  .argument('<domain>', 'Custom domain to add.')
  .addHelpText(
    'after',
    `
Examples:
  $ catalyst domains add www.example.com

  # Wait until the domain leaves pending verification
  $ catalyst domains add www.example.com --wait`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .option('--wait', 'Poll until domain verification completes or times out.')
  .action(async (domain, options) => {
    const context = resolveDomainCommandContext(options);

    await getTelemetry().identify(context.storeHash);

    consola.start(`Adding domain ${domain}...`);

    let result: Domain;

    try {
      result = await createDomain(
        domain,
        context.projectUuid,
        context.storeHash,
        context.accessToken,
        context.apiHost,
      );
    } catch (error) {
      if (error instanceof DomainOwnershipVerificationError) {
        consola.warn(`${domain} is already in use on another store.`);
        consola.log(formatOwnershipVerification(error.ownershipVerification));
        consola.info('Once the record is live, claim it with:');
        consola.log(`  catalyst domains claim ${domain}`);
        process.exit(1);

        return;
      }

      if (error instanceof DomainBoundToProjectError) {
        consola.warn(`${domain} is already bound to another project in this store.`);
        consola.info('To move it to this project, run:');
        consola.log(
          `  catalyst domains transfer ${domain} --project-uuid ${error.projectUuid} --to-project-uuid ${context.projectUuid}`,
        );
        process.exit(1);

        return;
      }

      throw error;
    }

    consola.success(`Domain ${result.domain} added.`);

    if (options.wait && result.verification_status === 'pending') {
      consola.start(`Waiting for ${result.domain} to verify...`);
      result = await waitForDomainVerification({ domain: result.domain, ...context });
    }

    consola.log(formatDomain(result));
    process.exit(0);
  });

const list = new Command('list')
  .configureHelp({ showGlobalOptions: true })
  .description('List custom domains for the current Native Hosting project.')
  .addHelpText(
    'after',
    `
Examples:
  $ catalyst domains list

  # Show pending domains only
  $ catalyst domains list --status pending`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .option('--domain <domain>', 'Only show a specific domain.')
  .addOption(
    new Option('--status <status>', 'Filter by verification status.').choices(
      DOMAIN_STATUS_FILTERS,
    ),
  )
  .action(async (options) => {
    const context = resolveDomainCommandContext(options);

    await getTelemetry().identify(context.storeHash);

    consola.start('Fetching domains...');

    const result = await listDomains(
      context.projectUuid,
      context.storeHash,
      context.accessToken,
      context.apiHost,
      {
        domains: options.domain ? [options.domain] : undefined,
        verificationStatus: options.status,
      },
    );

    consola.success('Domains fetched.');

    if (result.length === 0) {
      consola.info('No custom domains found.');
      process.exit(0);

      return;
    }

    result.forEach((item) => consola.log(formatDomain(item)));
    process.exit(0);
  });

const showStatus = new Command('status')
  .configureHelp({ showGlobalOptions: true })
  .description('Show the status of a custom domain on the current Native Hosting project.')
  .argument('<domain>', 'Custom domain to check.')
  .addHelpText(
    'after',
    `
Examples:
  $ catalyst domains status www.example.com

  # Wait until the domain leaves pending verification
  $ catalyst domains status www.example.com --wait`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .option('--wait', 'Poll until domain verification completes or times out.')
  .action(async (domain, options) => {
    const context = resolveDomainCommandContext(options);

    await getTelemetry().identify(context.storeHash);

    consola.start(`Fetching status for ${domain}...`);

    let result = await getDomain(
      domain,
      context.projectUuid,
      context.storeHash,
      context.accessToken,
      context.apiHost,
    );

    consola.success('Domain status fetched.');

    if (options.wait && result.verification_status === 'pending') {
      consola.start(`Waiting for ${result.domain} to verify...`);
      result = await waitForDomainVerification({ domain: result.domain, ...context });
    }

    consola.log(formatDomain(result));
    process.exit(0);
  });

const claim = new Command('claim')
  .configureHelp({ showGlobalOptions: true })
  .description('Claim a custom domain that is currently in use on another store.')
  .argument('<domain>', 'Custom domain to claim.')
  .addHelpText(
    'after',
    `
Claiming requires publishing the ownership-verification TXT record returned when
you try to add a domain that is already in use on another store. Publish the
record with your DNS provider, then run this command to complete the claim.

Examples:
  $ catalyst domains claim www.example.com

  # Wait until the claimed domain leaves pending verification
  $ catalyst domains claim www.example.com --wait`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .option('--wait', 'Poll until domain verification completes or times out.')
  .action(async (domain, options) => {
    const context = resolveDomainCommandContext(options);

    await getTelemetry().identify(context.storeHash);

    consola.start(`Claiming domain ${domain}...`);

    try {
      await claimDomain(
        domain,
        context.projectUuid,
        context.storeHash,
        context.accessToken,
        context.apiHost,
      );
    } catch (error) {
      if (error instanceof DomainOwnershipVerificationError) {
        consola.warn(`Ownership of ${domain} could not be verified yet.`);
        consola.log(formatOwnershipVerification(error.ownershipVerification));
        consola.info('Once the record is live, run the claim again:');
        consola.log(`  catalyst domains claim ${domain}`);
        process.exit(1);

        return;
      }

      throw error;
    }

    consola.success(`Domain ${domain} claimed.`);

    let result = await getDomain(
      domain,
      context.projectUuid,
      context.storeHash,
      context.accessToken,
      context.apiHost,
    );

    if (options.wait && result.verification_status === 'pending') {
      consola.start(`Waiting for ${result.domain} to verify...`);
      result = await waitForDomainVerification({ domain: result.domain, ...context });
    }

    consola.log(formatDomain(result));
    process.exit(0);
  });

const transfer = new Command('transfer')
  .configureHelp({ showGlobalOptions: true })
  .description('Transfer a custom domain to another project in the same store.')
  .argument('<domain>', 'Custom domain to transfer.')
  .addHelpText(
    'after',
    `
The domain is transferred from the current project to the destination project.
Omit --to-project-uuid to pick the destination from a list of your projects.

Examples:
  # Pick the destination project interactively
  $ catalyst domains transfer www.example.com

  # Transfer to a specific project
  $ catalyst domains transfer www.example.com --to-project-uuid <uuid>`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .option('--to-project-uuid <uuid>', 'Destination project UUID. Prompts to choose one if omitted.')
  .option('--wait', 'Poll until domain verification completes or times out.')
  .action(async (domain, options) => {
    const context = resolveDomainCommandContext(options);

    await getTelemetry().identify(context.storeHash);

    // Confirm the domain is on the source project before doing anything else.
    // `transfer` moves a domain *from* the current project, so a domain that
    // lives elsewhere can't be transferred from here — catch it now instead of
    // letting the API reject the transfer with an opaque ownership error after
    // the user has already picked a destination.
    consola.start(`Checking ${domain} on the current project...`);

    const owned = await findDomain(
      domain,
      context.projectUuid,
      context.storeHash,
      context.accessToken,
      context.apiHost,
    );

    if (!owned) {
      // The domain isn't on the linked project. Scan the store's other projects
      // so we can point the user at the exact owner — `domains list` only shows
      // the *current* project's domains, so it can't help them find where the
      // domain actually lives.
      consola.start(`Locating the project that owns ${domain}...`);

      const projects = await fetchProjects(context.storeHash, context.accessToken, context.apiHost);
      const candidates = projects.filter((project) => project.uuid !== context.projectUuid);
      const matches = await Promise.all(
        candidates.map(async (project) => ({
          project,
          found: await findDomain(
            domain,
            project.uuid,
            context.storeHash,
            context.accessToken,
            context.apiHost,
          ),
        })),
      );
      const owner = matches.find((match) => match.found)?.project;

      if (!owner) {
        throw new UserActionableError(
          `${domain} isn't on any project in this store. If it's in use on another store, ` +
            `claim it with \`catalyst domains claim ${domain}\`; otherwise double-check the domain name.`,
        );
      }

      const toSuffix = options.toProjectUuid ? ` --to-project-uuid ${options.toProjectUuid}` : '';

      consola.warn(
        `${domain} is on project "${owner.name}" (${owner.uuid}), not the current project.`,
      );
      consola.info('Re-run the transfer from that project:');
      consola.log(`  catalyst domains transfer ${domain} --project-uuid ${owner.uuid}${toSuffix}`);
      process.exit(1);

      return;
    }

    consola.success(`${domain} found on the current project.`);

    const newProjectUuid = await resolveDestinationProject(domain, context, options.toProjectUuid);

    consola.start(`Transferring domain ${domain}...`);

    await transferDomain(
      domain,
      context.projectUuid,
      newProjectUuid,
      context.storeHash,
      context.accessToken,
      context.apiHost,
    );

    consola.success(`Domain ${domain} transferred.`);

    let result = await getDomain(
      domain,
      newProjectUuid,
      context.storeHash,
      context.accessToken,
      context.apiHost,
    );

    if (options.wait && result.verification_status === 'pending') {
      consola.start(`Waiting for ${result.domain} to verify...`);
      result = await waitForDomainVerification({
        domain: result.domain,
        projectUuid: newProjectUuid,
        storeHash: context.storeHash,
        accessToken: context.accessToken,
        apiHost: context.apiHost,
      });
    }

    consola.log(formatDomain(result));
    process.exit(0);
  });

const remove = new Command('remove')
  .configureHelp({ showGlobalOptions: true })
  .description('Remove a custom domain from the current Native Hosting project.')
  .argument('<domain>', 'Custom domain to remove.')
  .addHelpText(
    'after',
    `
Examples:
  $ catalyst domains remove www.example.com

  # Skip confirmation for an active domain
  $ catalyst domains remove www.example.com --force`,
  )
  .addOption(storeHashOption())
  .addOption(accessTokenOption())
  .addOption(apiHostOption())
  .addOption(projectUuidOption())
  .option('--force', 'Skip the confirmation prompt before removing an active domain.')
  .action(async (domain, options) => {
    const context = resolveDomainCommandContext(options);

    await getTelemetry().identify(context.storeHash);

    consola.start(`Fetching status for ${domain}...`);

    const current = await getDomain(
      domain,
      context.projectUuid,
      context.storeHash,
      context.accessToken,
      context.apiHost,
    );

    if (current.verification_status === 'verified' && !options.force) {
      const confirmed = await confirm({
        message: `Remove active domain ${current.domain}? Traffic may stop routing to this project.`,
        default: false,
      });

      if (!confirmed) {
        consola.info('Aborted. No domain was removed.');
        process.exit(0);

        return;
      }
    }

    consola.start(`Removing domain ${current.domain}...`);

    await deleteDomain(
      current.domain,
      context.projectUuid,
      context.storeHash,
      context.accessToken,
      context.apiHost,
    );

    consola.success(`Domain ${current.domain} removed.`);
    process.exit(0);
  });

export const domains = new Command('domains')
  .configureHelp({ showGlobalOptions: true })
  .description('Manage custom domains for the current Native Hosting project.')
  .addCommand(add)
  .addCommand(list)
  .addCommand(showStatus)
  .addCommand(claim)
  .addCommand(transfer)
  .addCommand(remove);
