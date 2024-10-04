import { z } from 'zod';

const CustomUrl = z.object({
  url: z.string(),
});

const Product = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  weight: z.number().nullable(),
  price: z.number().nullable(),
  custom_url: CustomUrl,
});

const CreateProductResponse = z.object({
  data: Product,
});

export async function getProduct(productId: number) {
  if (!process.env.BIGCOMMERCE_ACCESS_TOKEN) {
    throw new Error('BIGCOMMERCE_ACCESS_TOKEN is not set');
  }

  if (!process.env.BIGCOMMERCE_STORE_HASH) {
    throw new Error('BIGCOMMERCE_STORE_HASH is not set');
  }

  const response = await fetch(
    `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/catalog/products/${productId}`,
    {
      method: 'GET',
      headers: {
        'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`Failed to get product with id ${productId}: ${errorText}`);
  }

  const data: unknown = await response.json();
  const parsedResponse = CreateProductResponse.parse(data);

  return parsedResponse.data;
}
