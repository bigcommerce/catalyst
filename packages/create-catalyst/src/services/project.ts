import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { pathExistsSync } from 'fs-extra/esm';
import kebabCase from 'lodash.kebabcase';
import { join } from 'path';
import { execSync } from 'child_process';

import { CreateCommandOptions, InitCommandOptions, ProjectService, ValidationError } from '../types';
import { GitService } from '../types';
import { BigCommerceService } from '../types';
import { writeEnv } from '../utils/write-env';
import { BigCommerceServiceImpl } from './bigcommerce';

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
      await this.gitService.clone(
        options.repository || 'bigcommerce/catalyst',
        projectName,
        projectDir,
      );
      await this.handleGitRef(options, projectDir);
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
    const { channelId, storefrontToken } = await this.setupChannel(storeHash, accessToken);

    console.log(`\nCreating '${projectName}' at '${projectDir}'\n`);

    await this.gitService.clone(
      options.repository || 'bigcommerce/catalyst',
      projectName,
      projectDir,
    );

    await this.handleGitRef(options, projectDir);

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

    const { channelId, storefrontToken } = await this.setupChannel(storeHash, accessToken);

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

  private async validateAndNormalizeProjectOptions(options: CreateCommandOptions): Promise<{ projectName: string; projectDir: string }> {
    if (!this.validateProjectDir(options.projectDir || process.cwd())) {
      throw new ValidationError(`Invalid project directory: ${options.projectDir}`);
    }

    let projectName = options.projectName;
    let projectDir = options.projectDir || process.cwd();

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
    const validateProjectName = (input: string) => {
      const formatted = kebabCase(input);

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
      const authUrl = `https://login.${options.bigcommerceHostname || 'bigcommerce.com'}`;
      const credentials = await this.bigCommerceService.login(authUrl);
      storeHash = credentials.storeHash;
      accessToken = credentials.accessToken;
    }

    return { storeHash, accessToken };
  }

  private async setupChannel(storeHash: string, accessToken: string) {
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

      const { id: channelId, token: storefrontToken } = await this.bigCommerceService.createChannel(channelName);
      return { channelId, storefrontToken };
    }

    // If not creating a new channel, let them select an existing one
    const channels = await this.bigCommerceService.getChannels();
    const selectedChannel = await select({
      message: 'Which channel would you like to use?',
      choices: channels.map(ch => ({
        name: ch.name,
        value: ch,
        description: `Channel Platform: ${
          ch.platform === 'bigcommerce'
            ? 'Stencil'
            : ch.platform.charAt(0).toUpperCase() + ch.platform.slice(1)
        }`,
      })),
    });

    // Get a storefront token for the selected channel
    const { token: storefrontToken } = await this.bigCommerceService.createChannel(selectedChannel.name);
    return { channelId: selectedChannel.id, storefrontToken };
  }

  private async handleGitRef(options: CreateCommandOptions, projectDir: string) {
    if (options.ghRef) {
      if (options.resetMain) {
        await this.gitService.checkoutRef(projectDir, 'main');
        await this.gitService.resetBranchToRef(projectDir, options.ghRef);
        console.log(`Reset main to ${options.ghRef} successfully.\n`);
      } else {
        await this.gitService.checkoutRef(projectDir, options.ghRef);
      }
    }
  }

  private checkDependencies() {
    try {
      execSync('git --version', { stdio: 'ignore' });
    } catch {
      throw new ValidationError('git is required to create a Catalyst project');
    }

    try {
      execSync('pnpm --version', { stdio: 'ignore' });
    } catch {
      throw new ValidationError('pnpm is required to create a Catalyst project. Enable it by running `corepack enable pnpm`');
    }
  }

  private async installDependencies(projectDir: string) {
    console.log('\nInstalling dependencies...');
    execSync('pnpm install', { stdio: 'inherit', cwd: projectDir });
  }
} 