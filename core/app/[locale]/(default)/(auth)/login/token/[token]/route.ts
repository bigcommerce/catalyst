/*
 * This route is used to accept customer login token JWTs from the
 * [Customer Login API](https://developer.bigcommerce.com/docs/start/authentication/customer-login)
 * and log the customers in using alternative authentication methods
 */

import { graphql } from "~/client/graphql";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const token = (await params).token;
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';