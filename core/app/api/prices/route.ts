import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { NextRequest, NextResponse } from 'next/server';

//import { getSessionCustomerId } from '~/auth';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

interface Price {
  sku: string,
  prices: {
    basePrice?: { 
      value?: number
    },
    salePrice?: { 
      value?: number
    },
  }
}

type SitePrices = { 
  [key: string]: Price
};

const ProductPricesQuery = function(searchFragments: string | null) {
  return graphql(`query ProductPrices {
      site {
        ${searchFragments}
      }
    }
    fragment ProductFields on Product {
      id
      entityId
      sku
      prices {
        price {
          value
          currencyCode
        }
        basePrice {
          value
          currencyCode
        }
        retailPrice {
          value
          currencyCode
        }
        salePrice {
          value
          currencyCode
        }
      }
    }`
  );
}

export const GET = async (
  _request: NextRequest,
  // { params }: { params: { skus: string } },
) => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  //const { skus } = await params;

  const searchParams = _request.nextUrl.searchParams;
  const skus = searchParams.get('skus') ?? '';

//console.log(skus);

  const searchFragments = skus?.split(',').map((sku, key) => `SKU${key}: product(sku: "${sku}") {...ProductFields}`);

  const { data }: any = searchFragments ? await client.fetch({
    document: ProductPricesQuery(searchFragments?.join("\n")),
    //customerId,
    customerAccessToken,
    fetchOptions: { cache: 'force-cache' },
  }) : null;

  let new_prices: any = {};
  if (data && data.site) {
    Object.entries(data.site as SitePrices).map(([key, value]) => {
      if (value && value.sku && value.prices) {
        new_prices = {
          ...new_prices,
          [value.sku]: {
            price: value.prices.basePrice?.value ?? null,
            salePrice: value.prices.salePrice?.value ?? null
          }
        }
      }
    });
  }

  return NextResponse.json({
    status: 'OK',
    message: 'Prices retrieved successfully!',
    data: new_prices
  }, {
    status: 200
  });
};

// TODO: Not sure why its not working with this line uncommented... Something needs to be fixed to enable it.
//export const runtime = 'edge';
export const runtime = 'nodejs';