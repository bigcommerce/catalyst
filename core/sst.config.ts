/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable no-new */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: `catalyst`,
      removal: input.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input.stage),
      home: 'aws',
      providers: {
        aws: {
          region: 'eu-west-2',
          profile: 'AdministratorAccess-242201303751',
        },
      },
    };
  },
  async run() {
    const BIGCOMMERCE_STORE_HASH = new sst.Secret('BIGCOMMERCE_STORE_HASH');
    const BIGCOMMERCE_STOREFRONT_TOKEN = new sst.Secret('BIGCOMMERCE_STOREFRONT_TOKEN');
    const BIGCOMMERCE_CHANNEL_ID = new sst.Secret('BIGCOMMERCE_CHANNEL_ID');
    const AUTH_SECRET = new sst.Secret('AUTH_SECRET');
    const TURBO_REMOTE_CACHE_SIGNATURE_KEY = new sst.Secret('TURBO_REMOTE_CACHE_SIGNATURE_KEY');
    const MAKESWIFT_SITE_API_KEY = new sst.Secret('MAKESWIFT_SITE_API_KEY');
    const NEXT_PUBLIC_CONTENTFUL_SPACE_ID = new sst.Secret('NEXT_PUBLIC_CONTENTFUL_SPACE_ID');
    const NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN = new sst.Secret(
      'NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN',
    );
    const NEXT_PUBLIC_GTM_ID = new sst.Secret('NEXT_PUBLIC_GTM_ID');
    const AVIOS_NPM_AUTH_TOKEN = new sst.Secret('AVIOS_NPM_AUTH_TOKEN');
    const NEXT_PUBLIC_AVIOS_SHARED_CMS_ACCESS_TOKEN = new sst.Secret(
      'NEXT_PUBLIC_AVIOS_SHARED_CMS_ACCESS_TOKEN',
    );
    const NEXT_PUBLIC_AVIOS_SHARED_LOGIN_CALLBACK = new sst.Secret(
      'NEXT_PUBLIC_AVIOS_SHARED_LOGIN_CALLBACK',
    );
    const NEXT_PUBLIC_AVIOS_SHARED_LOGOUT_CALLBACK = new sst.Secret(
      'NEXT_PUBLIC_AVIOS_SHARED_LOGOUT_CALLBACK',
    );

    new sst.aws.Nextjs('catalyst', {
      environment: {
        BIGCOMMERCE_STORE_HASH: BIGCOMMERCE_STORE_HASH.value,
        BIGCOMMERCE_STOREFRONT_TOKEN: BIGCOMMERCE_STOREFRONT_TOKEN.value,
        BIGCOMMERCE_CHANNEL_ID: BIGCOMMERCE_CHANNEL_ID.value,
        ENABLE_ADMIN_ROUTE: 'true',
        AUTH_SECRET: AUTH_SECRET.value,
        TURBO_REMOTE_CACHE_SIGNATURE_KEY: TURBO_REMOTE_CACHE_SIGNATURE_KEY.value,
        MAKESWIFT_SITE_API_KEY: MAKESWIFT_SITE_API_KEY.value,
        NEXT_PUBLIC_CONTENTFUL_SPACE_ID: NEXT_PUBLIC_CONTENTFUL_SPACE_ID.value,
        NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN: NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN.value,
        TRAILING_SLASH: 'false',
        NEXT_PUBLIC_GTM_ID: NEXT_PUBLIC_GTM_ID.value,
        AVIOS_NPM_AUTH_TOKEN: AVIOS_NPM_AUTH_TOKEN.value,
        NEXT_PUBLIC_AVIOS_SHARED_CMS_ACCESS_TOKEN: NEXT_PUBLIC_AVIOS_SHARED_CMS_ACCESS_TOKEN.value,
        NEXT_PUBLIC_AVIOS_SHARED_LOGIN_CALLBACK: NEXT_PUBLIC_AVIOS_SHARED_LOGIN_CALLBACK.value,
        NEXT_PUBLIC_AVIOS_SHARED_LOGOUT_CALLBACK: NEXT_PUBLIC_AVIOS_SHARED_LOGOUT_CALLBACK.value,
      },
    });
  },
});
