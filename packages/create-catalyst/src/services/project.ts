import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { pathExistsSync } from 'fs-extra/esm';
import kebabCase from 'lodash.kebabcase';
import { join } from 'path';

import { ValidationError } from '../errors/validation-error';
import { BigCommerceService, CreateCommandOptions, GitService, InitCommandOptions } from '../types';
import { writeEnv } from '../utils/write-env';

import { BigCommerceServiceImpl } from './bigcommerce';

export interface ProjectService {
  create(options: CreateCommandOptions): Promise<void>;
  init(options: InitCommandOptions): Promise<void>;
  validateProjectName(name: string): boolean;
  validateProjectDir(dir: string): boolean;
}

export class ProjectServiceImpl implements ProjectService {
  constructor(
    private readonly gitService: GitService,
    private readonly bigCommerceService: BigCommerceService,
  ) {}

  async create(options: CreateCommandOptions): Promise<void> {
    this.checkDependencies();

    const { projectName, projectDir } = await this.validateAndNormalizeProjectOptions(options);
    const { storeHash, accessToken } = await this.getStoreCredentials(options);

    if (!storeHash || !accessToken) {
      console.log(`\nCreating '${projectName}' at '${projectDir}'\n`);

      this.gitService.clone(options.repository ?? 'bigcommerce/catalyst', projectName, projectDir);

      this.handleGitRef(options, projectDir);

      await this.installDependencies(projectDir);

      console.log(
        [
          `\n${chalk.green('Success!')} Created '${projectName}' at '${projectDir}'\n`,
          `Next steps:`,
          chalk.yellow(`\n- cd ${projectName} && cp .env.example .env.local`),
          chalk.yellow(`\n- Populate .env.local with your BigCommerce API credentials\n`),
        ].join('\n'),
      );

      return;
    }

    // Update BigCommerce service with new credentials
    if (this.bigCommerceService instanceof BigCommerceServiceImpl) {
      this.bigCommerceService.updateCredentials(storeHash, accessToken);
    }

    // If we have store credentials, set up the channel
    const { channelId, storefrontToken } = await this.setupChannel();

    console.log(`\nCreating '${projectName}' at '${projectDir}'\n`);

    this.gitService.clone(options.repository ?? 'bigcommerce/catalyst', projectName, projectDir);

    this.handleGitRef(options, projectDir);

    writeEnv(projectDir, {
      channelId: channelId.toString(),
      storeHash,
      storefrontToken,
      arbitraryEnv: options.env,
    });

    await this.installDependencies(projectDir);

    console.log(
      `\n${chalk.green('Success!')} Created '${projectName}' at '${projectDir}'\n`,
      '\nNext steps:\n',
      chalk.yellow(`\ncd ${projectName} && pnpm run dev\n`),
    );
  }

  async init(options: InitCommandOptions): Promise<void> {
    const projectDir = process.cwd();
    const { storeHash, accessToken } = await this.getStoreCredentials(options);

    if (!storeHash || !accessToken) {
      console.log(
        chalk.yellow('\nYou must authenticate with a store to overwrite your local environment.\n'),
      );
      process.exit(1);
    }

    // Update BigCommerce service with new credentials
    if (this.bigCommerceService instanceof BigCommerceServiceImpl) {
      this.bigCommerceService.updateCredentials(storeHash, accessToken);
    }

    const { channelId, storefrontToken } = await this.setupChannel();

    writeEnv(projectDir, {
      channelId: channelId.toString(),
      storeHash,
      storefrontToken,
    });
  }

  validateProjectName(name: string): boolean {
    const formatted = kebabCase(name);

    return Boolean(formatted);
  }

  validateProjectDir(dir: string): boolean {
    return pathExistsSync(dir);
  }

  private async validateAndNormalizeProjectOptions(
    options: CreateCommandOptions,
  ): Promise<{ projectName: string; projectDir: string }> {
    if (!this.validateProjectDir(options.projectDir ?? process.cwd())) {
      throw new ValidationError(`Invalid project directory: ${options.projectDir}`);
    }

    let projectName = options.projectName;
    let projectDir = options.projectDir ?? process.cwd();

    if (!projectName) {
      projectName = await this.promptForProjectName(projectDir);
    } else {
      projectName = kebabCase(projectName);
      projectDir = join(projectDir, projectName);

      if (pathExistsSync(projectDir)) {
        throw new ValidationError(`Directory already exists: ${projectDir}`);
      }
    }

    return { projectName, projectDir };
  }

  private async promptForProjectName(baseDir: string): Promise<string> {
    const validateProjectName = (projectInput: string) => {
      const formatted = kebabCase(projectInput);

      if (!formatted) {
        return 'Project name is required';
      }

      const targetDir = join(baseDir, formatted);

      if (pathExistsSync(targetDir)) {
        return `Directory already exists: ${targetDir}`;
      }

      return true;
    };

    const result = await input({
      message: 'What is the name of your project?',
      default: 'my-catalyst-app',
      validate: validateProjectName,
    });

    return kebabCase(result);
  }

  private async getStoreCredentials(options: CreateCommandOptions | InitCommandOptions) {
    let { storeHash, accessToken } = options;

    if (!storeHash || !accessToken) {
      const authUrl = `https://login.${options.bigcommerceHostname ?? 'bigcommerce.com'}`;
      const credentials = await this.bigCommerceService.login(authUrl);

      storeHash = credentials.storeHash;
      accessToken = credentials.accessToken;
    }

    return { storeHash, accessToken };
  }

  private async setupChannel() {
    const eligibility = await this.bigCommerceService.checkEligibility();

    if (!eligibility.eligible) {
      console.warn(chalk.yellow(eligibility.message));
    }

    const shouldCreateChannel = await select({
      message: 'Would you like to create a new channel?',
      choices: [
        { name: 'Yes', value: true },
        { name: 'No', value: false },
      ],
    });

    if (shouldCreateChannel) {
      const channelName = await input({
        message: 'What would you like to name your new channel?',
      });

      const { id: channelId, storefront_api_token: storefrontToken } =
        await this.bigCommerceService.createChannel(channelName);

      return { channelId, storefrontToken };
    }

    // If not creating a new channel, let them select an existing one
    const channels = await this.bigCommerceService.getChannels();
    const selectedChannel = await select<{
      id: number;
      name: string;
      platform: 'catalyst';
      type: 'storefront';
      storefront_api_token: string;
      site: { url: string };
    }>({
      message: 'Which channel would you like to use?',
      choices: channels
        .filter(
          (
            channel,
          ): channel is {
            id: number;
            name: string;
            platform: 'catalyst';
            type: 'storefront';
            storefront_api_token: string;
            site: { url: string };
          } => channel.platform === 'catalyst' && 'site' in channel,
        )
        .map((channel) => ({
          name: channel.name,
          value: channel,
          description: `Channel Platform: ${channel.platform.charAt(0).toUpperCase() + channel.platform.slice(1)}`,
        })),
    });

    return {
      channelId: selectedChannel.id,
      storefrontToken: selectedChannel.storefront_api_token,
    };
  }

  private handleGitRef(options: CreateCommandOptions, projectDir: string): void {
    if (options.ghRef) {
      if (options.resetMain) {
        this.gitService.checkoutRef(projectDir, 'main');
        this.gitService.resetBranchToRef(projectDir, options.ghRef);
        console.log(`Reset main to ${options.ghRef} successfully.\n`);
      } else {
        this.gitService.checkoutRef(projectDir, options.ghRef);
      }
    }
  }

  private checkDependencies() {
    try {
      execSync('git --version', { stdio: 'ignore' });
    } catch {
      throw new Error('Git is required but not installed.');
    }

    try {
      execSync('pnpm --version', { stdio: 'ignore' });
    } catch {
      throw new Error('pnpm is required but not installed.');
    }
  }

  private installDependencies(projectDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        execSync('pnpm install', { cwd: projectDir, stdio: 'inherit' });
        resolve();
      } catch (error) {
        if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error('Failed to install dependencies'));
        }
      }
    });
  }
}
