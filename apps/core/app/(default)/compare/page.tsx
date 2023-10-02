import { Button } from '@bigcommerce/reactant/Button';
import Image from 'next/image';
import Link from 'next/link';
import * as z from 'zod';

import client from '~/client';
import { SearchForm } from '~/components/SearchForm';

import { AddToCartForm } from './AddToCartForm';

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

type Prices = Awaited<ReturnType<typeof client.getProducts>>[number]['prices'];

const Prices = ({ prices }: { prices: Prices }) => {
  if (!prices) {
    return <p>N/A</p>;
  }

  const { format } = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: prices.price.currencyCode,
  });

  const { retailPrice, price, basePrice } = prices;

  if (retailPrice) {
    if (basePrice && basePrice.value !== price.value) {
      return (
        <>
          <p className="text-gray-500 line-through">{format(Number(retailPrice.value))}</p>
          <p className="text-gray-500 line-through">{format(Number(basePrice.value))}</p>
          <p>{format(Number(price.value))}</p>
        </>
      );
    }

    return (
      <>
        <p className="text-gray-500 line-through">{format(Number(retailPrice.value))}</p>
        <p>{format(Number(price.value))}</p>
      </>
    );
  }

  return <p>{format(Number(price.value))}</p>;
};

export default async function Compare({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const parsed = CompareParamsSchema.parse(searchParams);
  const productIds = parsed.ids?.filter((id) => !Number.isNaN(id));

  const products = await client.getProducts({
    productIds: productIds ?? [],
    first: productIds?.length ? MAX_COMPARE_LIMIT : 0,
    images: { width: 300 },
  });

  if (!products.length) {
    return (
      <div className="flex w-full justify-center py-16 align-middle">
        <div className="flex max-w-2xl flex-col gap-8 pb-8">
          <h1 className="text-h2">Well, there's nothing to compare!</h1>
          <p className="text-lg">
            You somehow managed to land here, but you need to select a few products first.
          </p>
          <SearchForm />
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="pb-8 text-h2">Comparing {products.length} products</h1>

      <div className="-mx-6 overflow-auto overscroll-x-contain px-6 sm:-mx-10 sm:px-10 lg:-mx-12 lg:px-12">
        <table className="mx-auto w-full max-w-full table-fixed text-base md:w-fit">
          <caption className="sr-only">Product Comparison</caption>

          <colgroup>
            <col className="w-80" span={products.length} />
          </colgroup>

          <thead>
            <tr>
              {products.map((product) => (
                <th className="sr-only" key={product.entityId} scope="col">
                  {product.name}
                </th>
              ))}
            </tr>
            <tr>
              {products.map((product) => {
                const defaultImg = product.images.find((image) => image.isDefault);

                if (defaultImg) {
                  const defaultImgUrl = defaultImg.url;
                  const defaultImgAlt = defaultImg.altText;

                  return (
                    <td className="px-4" key={product.entityId}>
                      <Link aria-label={product.name} href={product.path}>
                        <Image alt={defaultImgAlt} height={300} src={defaultImgUrl} width={300} />
                      </Link>
                    </td>
                  );
                }

                return (
                  <td className="px-4" key={product.entityId}>
                    <Link aria-label={product.name} href={product.path}>
                      <div className="flex aspect-square items-center justify-center bg-gray-200 text-gray-500">
                        <p className="text-lg">No Image</p>
                      </div>
                    </Link>
                  </td>
                );
              })}
            </tr>
            <tr>
              {products.map((product) => (
                <td className="px-4 pt-4 text-gray-500" key={product.entityId}>
                  {product.brand?.name}
                </td>
              ))}
            </tr>
            <tr>
              {products.map((product) => (
                <td className="px-4 align-top text-h5" key={product.entityId}>
                  <Link href={product.path}>{product.name}</Link>
                </td>
              ))}
            </tr>
            <tr>
              {products.map((product) => (
                <td className="px-4 py-4 align-bottom" key={product.entityId}>
                  <Prices prices={product.prices} />
                </td>
              ))}
            </tr>
            <tr>
              {products.map((product) => {
                if (product.productOptions.length) {
                  return (
                    <td className="border-b px-4 pb-12" key={product.entityId}>
                      <Button aria-label={product.name} asChild>
                        <Link href={product.path}>Choose Options</Link>
                      </Button>
                    </td>
                  );
                }

                return (
                  <td className="border-b px-4 pb-12" key={product.entityId}>
                    <AddToCartForm
                      availability={product.availabilityV2.status}
                      entityId={product.entityId}
                      productName={product.name}
                    />
                  </td>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr className="absolute mt-6">
              <th className="sticky left-0 top-0 m-0 pl-4 text-left" id="product-description">
                Description
              </th>
            </tr>
            <tr>
              {products.map((product) => (
                <td
                  className="border-b px-4 pb-12 pt-20"
                  headers="product-description"
                  key={product.entityId}
                >
                  {product.plainTextDescription}
                </td>
              ))}
            </tr>
            <tr className="absolute mt-8">
              <th className="sticky left-0 top-0 m-0 pl-4 text-left" id="product-rating">
                Rating
              </th>
            </tr>
            <tr>
              {products.map((product) => (
                <td
                  className="border-b px-4 pb-12 pt-24"
                  headers="product-rating"
                  key={product.entityId}
                >
                  {product.reviewSummary.summationOfRatings}
                </td>
              ))}
            </tr>
            <tr className="absolute mt-8">
              <th className="sticky left-0 top-0 m-0 pl-4 text-left" id="product-availability">
                Availability
              </th>
            </tr>
            <tr>
              {products.map((product) => (
                <td
                  className="border-b px-4 pb-12 pt-24"
                  headers="product-availability"
                  key={product.entityId}
                >
                  {product.inventory.aggregated?.availableToSell || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              {products.map((product) => {
                if (product.productOptions.length) {
                  return (
                    <td className="border-b px-4 pb-24 pt-12" key={product.entityId}>
                      <Button aria-label={product.name} asChild>
                        <Link href={product.path}>Choose Options</Link>
                      </Button>
                    </td>
                  );
                }

                return (
                  <td className="border-b px-4 pb-24 pt-12" key={product.entityId}>
                    <AddToCartForm
                      availability={product.availabilityV2.status}
                      entityId={product.entityId}
                      productName={product.name}
                    />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
