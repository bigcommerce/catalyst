import {
  type Analytics,
  type AnalyticsConfig,
  AnalyticsEvent,
  type AnalyticsProvider,
  Customer,
} from './types';

export { Bodl } from './providers/bodl';

export class BcAnalytics implements Analytics {
  constructor(
    private providers: AnalyticsProvider[],
    private config: AnalyticsConfig,
  ) {}

  init() {
    this.providers.forEach((provider) => provider.init(this.config));
  }

  trackEvent(event: AnalyticsEvent) {
    this.providers.forEach((provider) => provider.trackEvent(event, this.config));
  }

  setCustomer(customer: Customer) {
    this.providers.forEach((provider) => provider.setCustomer(customer, this.config));
  }
}
