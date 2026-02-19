import Conf from 'conf';
import { Context, Effect, Layer } from 'effect';

import {
  getProjectConfig,
  type ProjectConfigSchema,
} from '../../lib/project-config';

export class ProjectConfig extends Context.Tag('@catalyst/ProjectConfig')<
  ProjectConfig,
  {
    readonly get: <K extends keyof ProjectConfigSchema>(
      key: K,
    ) => Effect.Effect<ProjectConfigSchema[K] | undefined>;
    readonly set: <K extends keyof ProjectConfigSchema>(
      key: K,
      value: ProjectConfigSchema[K],
    ) => Effect.Effect<void>;
    readonly delete: <K extends keyof ProjectConfigSchema>(key: K) => Effect.Effect<void>;
    readonly getConfig: () => Conf<ProjectConfigSchema>;
  }
>() {}

export const ProjectConfigLive = Layer.sync(ProjectConfig, () => {
  const config = getProjectConfig();

  return {
    get: (key) => Effect.sync(() => config.get(key)),
    set: (key, value) => Effect.sync(() => config.set(key, value)),
    delete: (key) => Effect.sync(() => config.delete(key)),
    getConfig: () => config,
  };
});
