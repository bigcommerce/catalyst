export interface AnalyticsProvider {
  cart: Analytics.Cart.ProviderEvents;
  navigation: Analytics.Navigation.ProviderEvents;

  initialize: () => void;
}

export interface AnalyticsConfig {
  channelId: number;
  providers: AnalyticsProvider[];
}

export interface Analytics {
  readonly cart: Analytics.Cart.Events;
  readonly navigation: Analytics.Navigation.Events;

  initialize(): void;
}
