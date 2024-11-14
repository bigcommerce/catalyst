import { strict } from 'assert';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const Customers = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .array();

export type CustomersType = z.infer<typeof Customers>;

export async function GET() {
  strict(process.env.BIGCOMMERCE_ACCESS_TOKEN, 'BIGCOMMERCE_ACCESS_TOKEN is required');

  const response = await fetch(
    `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/customer_groups`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
      },
    },
  );
  const jsonResponse: unknown = await response.json();
  const groups = Customers.parse(jsonResponse);

  return NextResponse.json(groups);
}
