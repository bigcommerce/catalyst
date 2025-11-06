import { z } from 'zod';

import { testEnv } from '~/tests/environment';

import { httpClient } from '../client';
import { apiResponseSchema } from '../schema';

import { Redirect, RedirectsApi, UpsertRedirectData } from '.';

const RedirectToTypeSchema = z.enum(['product', 'brand', 'category', 'page', 'post', 'url']);

const RedirectToEntitySchema = z.object({
  type: RedirectToTypeSchema.exclude(['url']),
  entity_id: z.number(),
});

const RedirectToUrlSchema = z.object({
  type: z.literal('url'),
  url: z.string(),
});

const RedirectToSchema = z.union([RedirectToEntitySchema, RedirectToUrlSchema]);

const RedirectSchema = z
  .object({
    id: z.number(),
    site_id: z.number(),
    from_path: z.string(),
    to: RedirectToSchema,
  })
  .transform(
    (data): Redirect => ({
      id: data.id,
      siteId: data.site_id,
      fromPath: data.from_path,
      to:
        data.to.type === 'url'
          ? { type: 'url', url: data.to.url }
          : {
              type: data.to.type,
              entityId: data.to.entity_id,
            },
    }),
  );

const RedirectUpsertDataSchema = z.object({
  site_id: z.number(),
  from_path: z.string(),
  to: RedirectToSchema,
});

const transformRedirectTo = (data: UpsertRedirectData['to']) => {
  if (data.type === 'url') {
    return RedirectToSchema.parse({
      type: 'url',
      url: data.url,
    });
  }

  return RedirectToSchema.parse({
    type: data.type,
    entity_id: data.entityId,
  });
};

const transformRedirectUpsertData = (data: UpsertRedirectData & { siteId: number }) =>
  RedirectUpsertDataSchema.parse({
    site_id: data.siteId,
    from_path: data.fromPath,
    to: transformRedirectTo(data.to),
  });

export const redirectsHttpClient: RedirectsApi = {
  upsert: async (data) => {
    // Redirects require a siteID, so it must be fetched via the channel ID
    const channelId = Number(testEnv.BIGCOMMERCE_CHANNEL_ID);
    const {
      data: { id: siteId },
    } = await httpClient
      .get(`/v3/channels/${channelId}/site`)
      .parse(apiResponseSchema(z.object({ id: z.number() })));

    await httpClient
      .put('/v3/storefront/redirects', [transformRedirectUpsertData({ ...data, siteId })])
      .parse(apiResponseSchema(z.array(RedirectSchema)));

    // Upsert redirects API will not return created redirects, just a 200 success with an empty array.
    // Because of this, a GET needs to be done for the newly created redirect in order to get the ID.

    const created = await httpClient
      .get(`/v3/storefront/redirects?site_id=${siteId}&keyword=${data.fromPath}`)
      .parse(apiResponseSchema(z.array(RedirectSchema)));

    return created.data[0];
  },
  delete: async (ids: number[]) => {
    if (ids.length > 0) {
      await httpClient.delete(`/v3/storefront/redirects?id:in=${ids.join(',')}`);
    }
  },
};
