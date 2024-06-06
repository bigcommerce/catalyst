import { z } from 'zod';

import { MemoryKvAdapter } from '~/lib/kv/adapters/memory';

const kv = new MemoryKvAdapter();

const RedirectSchema = z.object({
  __typename: z.string(),
  to: z.object({
    __typename: z.string(),
  }),
  toUrl: z.string(),
});

const NodeSchema = z.union([
  z.object({ __typename: z.literal('Product'), entityId: z.number() }),
  z.object({ __typename: z.literal('Category'), entityId: z.number() }),
  z.object({ __typename: z.literal('Brand'), entityId: z.number() }),
  z.object({ __typename: z.literal('ContactPage'), id: z.string() }),
  z.object({ __typename: z.literal('NormalPage'), id: z.string() }),
  z.object({ __typename: z.literal('RawHtmlPage'), id: z.string() }),
]);

export const RouteSchema = z.object({
  redirect: z.nullable(RedirectSchema),
  node: z.nullable(NodeSchema),
});

export const getRoute = async (path: string) => {
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH ?? '';
  const token = process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ?? '';
  const channelId = process.env.BIGCOMMERCE_CHANNEL_ID ?? 1;

  const response = await kv.get<z.infer<typeof RouteSchema>>(path);

  if (response) {
    // eslint-disable-next-line no-console
    console.log('Response found in memory kv!');

    return response;
  }

  // eslint-disable-next-line no-console
  console.time('getRoute');

  const data = await fetch(
    `https://catalyst-worker.bigcommerce-testing-7727.workers.dev/v1/${storeHash}/${channelId}/route?path=${path}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token,
      },
    },
  );

  // eslint-disable-next-line no-console
  console.timeEnd('getRoute');

  const route = RouteSchema.parse(await data.json());

  await kv.set(path, route);

  return route;
};
