import { Layer } from 'effect';

import { LoggerLive } from './services/Logger';
import { SpinnerLive } from './services/Spinner';

export const PresentationLive = Layer.mergeAll(LoggerLive, SpinnerLive);
