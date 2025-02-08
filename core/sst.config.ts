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
    new sst.aws.Nextjs(`${process.env.STAGE}-wf-catalyst`);
  },
});
