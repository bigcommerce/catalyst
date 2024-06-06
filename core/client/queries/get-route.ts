import { z } from 'zod';

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

  // eslint-disable-next-line no-console
  console.time('getRoute');

  const data = await fetch(
    `https://catalyst-worker.bigcommerce-testing-7727.workers.dev/v1/${storeHash}/${channelId}/route?path=${path}`,
    // `http://localhost:8787/v1/${storeHash}/${channelId}/route?path=${path}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token,
        'x-db-type': 'kv',
      },
    },
  );

  // eslint-disable-next-line no-console
  console.timeEnd('getRoute');

  return RouteSchema.parse(await data.json());
};
