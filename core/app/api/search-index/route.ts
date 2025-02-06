import { removeEdgesAndNodes } from "@bigcommerce/catalyst-client";
import { NextResponse } from "next/server";
import { client } from "~/client";
import { graphql } from "~/client/graphql";
export const IndexingQuery = graphql(
  `
    query paginateProducts(
      $pageSize: Int = 50
      $cursor: String
    ) {
      site {
        products (first: $pageSize, after:$cursor) {
          pageInfo {
            startCursor
            endCursor
            hasNextPage
          }
          edges {
            cursor
            node {
              entityId
              name
            }
          }
        }
      }
    }
  `
);

export async function GET(request: Request) {
  const { data } = await client.fetch({ document: IndexingQuery });

  const products = removeEdgesAndNodes(data.site.products);

  return NextResponse.json({ products });
}

export const revalidate = 3600;
