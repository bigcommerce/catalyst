import { Layer } from 'effect';

import { BrowserOpenLive } from './services/BrowserOpen';
import { ProcessRunnerLive } from './services/ProcessRunner';
import { ProjectConfigLive } from './services/ProjectConfig';
import { TelemetryLive } from './services/Telemetry';
import { ZipArchiveLive } from './services/ZipArchive';

export const ProvidersLive = Layer.mergeAll(
  ProjectConfigLive,
  ProcessRunnerLive,
  ZipArchiveLive,
  BrowserOpenLive,
  TelemetryLive,
);
