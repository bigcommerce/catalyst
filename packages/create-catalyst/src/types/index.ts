// Core configuration types
export interface Config {
  bigCommerceHostname: string;
  sampleDataApiUrl: string;
}

// Command options types
export interface CreateCommandOptions {
  projectName?: string;
  projectDir?: string;
  storeHash?: string;
  accessToken?: string;
  channelId?: string;
  storefrontToken?: string;
  ghRef?: string;
  resetMain?: boolean;
  repository?: string;
  env?: string[];
  bigcommerceHostname?: string;
  sampleDataApiUrl?: string;
  cliApiHostname?: string;
}

export interface InitCommandOptions {
  storeHash?: string;
  accessToken?: string;
  bigcommerceHostname?: string;
  sampleDataApiUrl?: string;
  cliApiHostname?: string;
}

export interface TelemetryCommandOptions {
  enable?: boolean;
  disable?: boolean;
}

export interface IntegrationCommandOptions {
  commitHash?: string;
}

// Service interfaces
export interface GitService {
  clone(repository: string, projectName: string, projectDir: string): void;
  checkoutRef(projectDir: string, ref: string): void;
  resetBranchToRef(projectDir: string, ref: string): void;
  hasGitHubSSH(): boolean;
}

export interface ProjectService {
  create(options: CreateCommandOptions): Promise<void>;
  init(options: InitCommandOptions): Promise<void>;
  validateProjectName(name: string): boolean;
  validateProjectDir(dir: string): boolean;
}

export interface TelemetryService {
  track(eventName: string, payload: Record<string, unknown>): Promise<void>;
  identify(storeHash: string): Promise<void>;
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
}

export interface BigCommerceService {
  getChannels(): Promise<
    Array<{
      id: number;
      name: string;
      platform: 'catalyst';
      type: 'storefront';
      storefront_api_token: string;
      site: { url: string };
      deployment?: { id: string; url: string; created_at: string };
      makeswift_api_key?: string;
      envVars?: Record<string, string>;
    }>
  >;
  createChannel(name: string): Promise<{
    id: number;
    name: string;
    platform: 'catalyst';
    type: 'storefront';
    storefront_api_token: string;
    site: { url: string };
    deployment?: { id: string; url: string; created_at: string };
    makeswift_api_key?: string;
    envVars?: Record<string, string>;
  }>;
  checkEligibility(): Promise<{ eligible: boolean; message: string }>;
  login(authUrl: string): Promise<{ storeHash: string; accessToken: string }>;
  updateCredentials(storeHash: string, accessToken: string): void;
}
