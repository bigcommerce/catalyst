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
}

export interface InitCommandOptions {
  storeHash?: string;
  accessToken?: string;
  bigcommerceHostname?: string;
  sampleDataApiUrl?: string;
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
  clone(repository: string, projectName: string, projectDir: string): Promise<void>;
  checkoutRef(projectDir: string, ref: string): Promise<void>;
  resetBranchToRef(projectDir: string, ref: string): Promise<void>;
  hasGitHubSSH(): Promise<boolean>;
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
  login(authUrl: string): Promise<{ storeHash: string; accessToken: string }>;
  createChannel(name: string): Promise<{ id: number; token: string }>;
  getChannels(): Promise<Array<{ id: number; name: string; platform: string }>>;
  checkEligibility(): Promise<{ eligible: boolean; message: string }>;
  updateCredentials(storeHash: string, accessToken: string): void;
}

// Error types
export class CatalystError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CatalystError';
  }
}

export class ValidationError extends CatalystError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends CatalystError {
  constructor(message: string) {
    super(message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class DependencyError extends CatalystError {
  constructor(message: string) {
    super(message, 'DEPENDENCY_ERROR');
    this.name = 'DependencyError';
  }
} 