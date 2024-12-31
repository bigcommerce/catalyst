import { parse as parseTOML, stringify as stringifyTOML } from '@iarna/toml';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

interface CatalystConfig {
  auth?: {
    storeHash?: string;
    accessToken?: string;
  };
}

interface TomlRecord {
  [key: string]: string | number | boolean | TomlRecord | TomlRecord[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCatalystConfig(obj: unknown): obj is CatalystConfig {
  if (!isRecord(obj)) {
    return false;
  }

  if ('auth' in obj) {
    if (!isRecord(obj.auth)) {
      return false;
    }

    const { storeHash, accessToken } = obj.auth;

    return (
      (storeHash === undefined || typeof storeHash === 'string') &&
      (accessToken === undefined || typeof accessToken === 'string')
    );
  }

  return true;
}

export class Config {
  private configPath: string;
  private config: CatalystConfig;

  constructor(projectDir: string) {
    this.configPath = join(projectDir, '.catalyst');
    this.config = this.read();
  }

  getAuth(): { storeHash?: string; accessToken?: string } {
    return this.config.auth ?? {};
  }

  setAuth(storeHash: string, accessToken: string): void {
    this.config.auth = { storeHash, accessToken };
    this.save();
  }

  save(): void {
    const configObj: TomlRecord = {};

    if (this.config.auth?.storeHash && this.config.auth.accessToken) {
      configObj.auth = {
        storeHash: this.config.auth.storeHash,
        accessToken: this.config.auth.accessToken,
      };
    }

    const dir = dirname(this.configPath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const preamble = `# DO NOT commit this file to your repository!
# This file contains sensitive configuration specific to your local CLI setup.
# It includes authentication tokens and store-specific information.
# If using version control, make sure to add .catalyst to your .gitignore file.

`;

    writeFileSync(this.configPath, preamble + stringifyTOML(configObj));
  }

  private read(): CatalystConfig {
    if (!existsSync(this.configPath)) {
      return {};
    }

    try {
      const contents = readFileSync(this.configPath, 'utf-8');
      const parsed = parseTOML(contents);

      if (isCatalystConfig(parsed)) {
        return parsed;
      }

      console.warn('Invalid config format in .catalyst file, using defaults');

      return {};
    } catch {
      console.warn('Failed to parse .catalyst config file, using defaults');

      return {};
    }
  }
}
