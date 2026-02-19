import { Context, Effect, Layer } from 'effect';
import { z } from 'zod';

import { AuthError } from '../errors';

import {
  DEVICE_OAUTH_CLIENT_ID,
  DEVICE_OAUTH_SCOPES,
  DeviceCodeResponseSchema,
  DeviceCodeSuccessSchema,
} from '../../lib/auth';

export interface DeviceCodeResponse {
  readonly device_code: string;
  readonly user_code: string;
  readonly verification_uri: string;
  readonly expires_in: number;
  readonly interval: number;
}

export interface DeviceTokenResponse {
  readonly access_token: string;
  readonly store_hash: string;
  readonly context: string;
  readonly api_uri: string;
}

export class AuthService extends Context.Tag('@catalyst/AuthService')<
  AuthService,
  {
    readonly requestDeviceCode: (
      loginUrl: string,
    ) => Effect.Effect<DeviceCodeResponse, AuthError>;
    readonly waitForDeviceToken: (
      loginUrl: string,
      deviceCode: string,
      interval: number,
    ) => Effect.Effect<DeviceTokenResponse, AuthError>;
  }
>() {}

const pollDeviceToken = (
  loginUrl: string,
  deviceCode: string,
): Effect.Effect<z.infer<typeof DeviceCodeSuccessSchema> | null, AuthError> =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch(`${loginUrl}/device/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_code: deviceCode,
          client_id: DEVICE_OAUTH_CLIENT_ID,
        }),
      });

      if (response.status !== 200) {
        return null;
      }

      const res: unknown = await response.json();

      return DeviceCodeSuccessSchema.parse(res);
    },
    catch: (error) =>
      new AuthError({
        message: error instanceof Error ? error.message : String(error),
      }),
  });

export const AuthServiceLive = Layer.succeed(AuthService, {
  requestDeviceCode: (loginUrl) =>
    Effect.tryPromise({
      try: async () => {
        const response = await fetch(`${loginUrl}/device/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: DEVICE_OAUTH_CLIENT_ID,
            scopes: DEVICE_OAUTH_SCOPES,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to request device code: ${response.status} ${response.statusText}`,
          );
        }

        const res: unknown = await response.json();

        return DeviceCodeResponseSchema.parse(res);
      },
      catch: (error) =>
        new AuthError({
          message: error instanceof Error ? error.message : String(error),
        }),
    }),

  waitForDeviceToken: (loginUrl, deviceCode, interval) => {
    const poll: Effect.Effect<DeviceTokenResponse, AuthError> = Effect.gen(
      function* () {
        const credentials = yield* pollDeviceToken(loginUrl, deviceCode);

        if (credentials) {
          return credentials;
        }

        yield* Effect.sleep(`${interval} seconds`);

        return yield* poll;
      },
    );

    return poll;
  },
});
