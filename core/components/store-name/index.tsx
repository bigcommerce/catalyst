import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const StoreNameQuery = graphql(`
  query StoreNameQuery {
    site {
      settings {
        storeName
      }
    }
  }
`);

export async function loader(ctx: { customerAccessToken: string | undefined; locale: string }) {
  const { data } = await client.fetch({
    document: StoreNameQuery,
    customerAccessToken: ctx.customerAccessToken,
  });

  return {
    storeName: data.site.settings?.storeName,
    locale: ctx.locale,
  };
}

interface Props {
  data: Streamable<Awaited<ReturnType<typeof loader>>>;
}

export function StoreName({ data }: Props) {
  return (
    <Stream fallback={<div>Loading...</div>} value={data}>
      {({ storeName }) => <div>{storeName}</div>}
    </Stream>
  );
}
