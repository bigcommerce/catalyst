import type { NextFetchEvent } from 'next/server';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { kv } from '~/lib/kv';
import { COOKIE_CONSENT_KEY, kvKey } from '~/lib/kv/keys';

const CookieConsentSettingQuery = graphql(`
  query CookieConsentSettingQuery {
    site {
      settings {
        privacy {
          cookieConsentEnabled
        }
      }
    }
  }
`);

const CookieConsentCacheSchema = z.object({
  cookieConsentEnabled: z.boolean(),
  expiryTime: z.number(),
});

const CACHE_TTL = 1000 * 60 * 30;

const fetchCookieConsentSetting = async () => {
  const { data } = await client.fetch({
    document: CookieConsentSettingQuery,
    fetchOptions: { cache: 'no-store' },
  });

  return data.site.settings?.privacy?.cookieConsentEnabled ?? false;
};

const writeCache = (cookieConsentEnabled: boolean) =>
  kv.set(kvKey(COOKIE_CONSENT_KEY), {
    cookieConsentEnabled,
    expiryTime: Date.now() + CACHE_TTL,
  });

const runInBackground = (promise: Promise<unknown>, event?: NextFetchEvent) => {
  if (event) {
    event.waitUntil(promise);
  } else {
    void promise.catch(() => undefined);
  }
};

// The analytics proxy runs before channel resolution, so this reads the default
// channel's setting. Stores mapping locales to different channels with different
// consent settings are not handled.
export async function isCookieConsentEnabled(event?: NextFetchEvent): Promise<boolean | null> {
  try {
    const cached = await kv.get<unknown>(kvKey(COOKIE_CONSENT_KEY));
    const parsed = CookieConsentCacheSchema.safeParse(cached);

    if (parsed.success) {
      if (parsed.data.expiryTime >= Date.now()) {
        return parsed.data.cookieConsentEnabled;
      }

      runInBackground(
        fetchCookieConsentSetting().then((enabled) => writeCache(enabled)),
        event,
      );

      return parsed.data.cookieConsentEnabled;
    }

    const cookieConsentEnabled = await fetchCookieConsentSetting();

    runInBackground(writeCache(cookieConsentEnabled), event);

    return cookieConsentEnabled;
  } catch {
    return null;
  }
}
