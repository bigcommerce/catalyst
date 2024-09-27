import { faker } from '@faker-js/faker';
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

export async function createProduct() {
  const name = faker.commerce.productName();
  const type = 'physical'; // Assuming the product type is physical
  const weight = faker.number.int({ min: 1, max: 10 });
  const price = faker.number.float({ min: 1, max: 100 });

  if (!process.env.BIGCOMMERCE_ACCESS_TOKEN) {
    throw new Error('BIGCOMMERCE_ACCESS_TOKEN is not set');
  }

  if (!process.env.BIGCOMMERCE_STORE_HASH) {
    throw new Error('BIGCOMMERCE_STORE_HASH is not set');
  }

  const response = await fetch(
    `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/catalog/products`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        name,
        type,
        weight,
        price,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Product creation API request failed with status ${response.status}: ${errorText}`,
    );
  }

  const data: unknown = await response.json();
  const parsedResponse = CreateProductResponse.parse(data);
  const product = parsedResponse.data;

  const productId = product.id;
  const channelId = 1;

  const requestBody = [
    {
      product_id: productId,
      channel_id: channelId,
    },
  ];

  const assignmentResponse = await fetch(
    `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/catalog/products/channel-assignments`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
      },
      body: JSON.stringify(requestBody),
    },
  );

  if (!assignmentResponse.ok) {
    const errorText = await assignmentResponse.text();

    throw new Error(
      `Product channel assignment API request failed with status ${assignmentResponse.status}: ${errorText}`,
    );
  }

  return {
    id: product.id,
    name: product.name,
    type: product.type,
    price: product.price,
    url: product.custom_url.url,
  };
}
