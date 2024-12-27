import type { Channel, CreateChannelResponse, EligibilityResponse } from './utils/https';

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

export interface BigCommerceCredentials {
  storeHash: string;
  accessToken: string;
}

export interface BigCommerceService {
  login(authUrl: string): Promise<BigCommerceCredentials>;
  getChannels(): Promise<Channel[]>;
  createChannel(name: string): Promise<CreateChannelResponse['data']>;
  checkEligibility(): Promise<EligibilityResponse['data']>;
  updateCredentials(storeHash: string, accessToken: string): void;
}

export interface GitService {
  clone(repository: string, name: string, directory: string): void;
  checkoutRef(directory: string, ref: string): void;
  resetBranchToRef(directory: string, ref: string): void;
  hasGitHubSSH(): boolean;
}
