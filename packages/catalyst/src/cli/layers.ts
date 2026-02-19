import { Layer } from 'effect';

import { ProvidersLive } from './providers/layers';
import { PresentationLive } from './presentation/layers';
import { AuthServiceLive } from './core/services/AuthService';
import { BuildServiceLive } from './core/services/BuildService';
import { DeployServiceLive } from './core/services/DeployService';
import { ProjectServiceLive } from './core/services/ProjectService';

const CoreServicesLive = Layer.mergeAll(
  AuthServiceLive,
  BuildServiceLive.pipe(Layer.provide(ProvidersLive)),
  DeployServiceLive.pipe(Layer.provide(ProvidersLive)),
  ProjectServiceLive.pipe(Layer.provide(ProvidersLive)),
);

export const LiveLayer = Layer.mergeAll(ProvidersLive, PresentationLive, CoreServicesLive);
