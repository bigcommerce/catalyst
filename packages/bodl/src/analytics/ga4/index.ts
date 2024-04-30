import { Analytics, bodlEvent } from '../../types';
import subscribeOnBodlEvents from './google_analytics4';

export interface Ga4Config {
  gaId: string;
  developerId: number;
  consentModeEnabled: boolean;
}

export class Ga4 implements Analytics {
  constructor(private config: Ga4Config) {}

  init(event: Event) {
    subscribeOnBodlEvents(
      this.config.gaId,
      this.config.developerId,
      this.config.consentModeEnabled,
    );
  }

  sendEvent(event: bodlEvent, payload: any) {
    // Do nothing, as GA4 events are handled by subscribeOnBodlEvents
  }
}
