import messages from '~/messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    // Locales come from merchant configuration and are resolved at runtime, so there is no
    // build-time union to narrow this to.
    Locale: string;
    Messages: typeof messages;
  }
}
