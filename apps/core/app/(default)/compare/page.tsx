import * as z from 'zod';

import client from '~/client';

const MAX_COMPARE_LIMIT = 10;

const CompareParamsSchema = z.object({
  ids: z
    .union([z.string(), z.array(z.string()), z.undefined()])
    .transform((value) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === 'string') {
        return [...value.split(',')];
      }

      return undefined;
    })
    .transform((value) => value?.map((id) => parseInt(id, 10))),
});

export default async function Compare({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const parsed = CompareParamsSchema.parse(searchParams);
  const productIds = parsed.ids?.filter((id) => !Number.isNaN(id));

  const response = await client.getProducts({
    productIds: productIds ?? [],
    first: productIds?.length ? MAX_COMPARE_LIMIT : 0,
    images: { width: 300 },
  });

  const products = response.data.site.products.edges;

  if (!products || !products.length) {
    return <h1 className="text-h2">Well, there's nothing to compare!</h1>;
  }

  return (
    <>
      <h1 className="text-h2">Comparing {products.length} products</h1>
      <p className="my-4 italic text-gray-400">
        Only {MAX_COMPARE_LIMIT} products can be compared at a time. Below are the first{' '}
        {MAX_COMPARE_LIMIT}.
      </p>
    </>
  );
}
