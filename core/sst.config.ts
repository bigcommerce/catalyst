/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable no-new */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: `${process.env.STAGE}-wf-catalyst`,
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
    new sst.aws.Nextjs(`${process.env.STAGE}-wf-catalyst`, {
      environment: {
        BIGCOMMERCE_STORE_HASH: process.env.BIGCOMMERCE_STORE_HASH as string,
        BIGCOMMERCE_STOREFRONT_TOKEN: process.env.BIGCOMMERCE_STOREFRONT_TOKEN as string,
        BIGCOMMERCE_CHANNEL_ID: process.env.BIGCOMMERCE_CHANNEL_ID as string,
        ENABLE_ADMIN_ROUTE: 'true',
        AUTH_SECRET: process.env.AUTH_SECRET as string,
        TURBO_REMOTE_CACHE_SIGNATURE_KEY: process.env.TURBO_REMOTE_CACHE_SIGNATURE_KEY as string,
        MAKESWIFT_SITE_API_KEY: process.env.MAKESWIFT_SITE_API_KEY as string,
        TRAILING_SLASH: 'false',
      },
    });
  },
});
