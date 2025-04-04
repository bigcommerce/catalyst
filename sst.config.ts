/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "core",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const { generateEnvConfig } = await import("./core/lib/generateEnvConfig");
    const crypto = require("crypto");
    const env = await generateEnvConfig();
    const authSecret =
        env.AUTH_SECRET || crypto.randomBytes(32).toString("hex");
    new sst.aws.Nextjs("CatalystStore", {
      path: "core",
      environment: {
        ENV_SECRET_NAME: "dev",
        BIGCOMMERCE_CHANNEL_ID: env.BIGCOMMERCE_CHANNEL_ID,
        BIGCOMMERCE_STOREFRONT_TOKEN: env.BIGCOMMERCE_STOREFRONT_TOKEN,
        BIGCOMMERCE_ACCESS_TOKEN: env.BIGCOMMERCE_ACCESS_TOKEN,
        BIGCOMMERCE_STORE_HASH: env.BIGCOMMERCE_STORE_HASH,
        AUTH_SECRET: authSecret,
        ...env,
      },
      permissions: [
        {
          actions: ["secretsmanager:GetSecretValue"],
          resources: [
            "arn:aws:secretsmanager:us-east-1:<AWS_ACCOUNT_ID>:secret:<SECRET_NAME>*",
          ],
        },
      ],
    });

    return {
      buildEnv: {
        TRAILING_SLASH: env.TRAILING_SLASH,
        BIGCOMMERCE_CHANNEL_ID: env.BIGCOMMERCE_CHANNEL_ID,
        BIGCOMMERCE_STOREFRONT_TOKEN: env.BIGCOMMERCE_STOREFRONT_TOKEN,
        BIGCOMMERCE_ACCESS_TOKEN: env.BIGCOMMERCE_ACCESS_TOKEN,
        BIGCOMMERCE_STORE_HASH: env.BIGCOMMERCE_STORE_HASH,
        CLIENT_LOGGER: env.CLIENT_LOGGER,
        NODE_ENV: env.NODE_ENV,
        ...env,
      },
    };
  },
});
