import rawBuildConfig from './build-config.json';
import { buildConfigSchema, BuildConfigSchema } from './schema';

class BuildConfig {
  private config = buildConfigSchema.parse(rawBuildConfig);

  get<K extends keyof BuildConfigSchema>(key: K): BuildConfigSchema[K] {
    if (key in this.config) {
      return this.config[key];
    }

    throw new Error(`Key "${key}" not found in BuildConfig`);
  }
}

export const buildConfig = new BuildConfig();
