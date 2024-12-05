'use client';

import { useEffect } from "react";

const gqlQueryString = `query GetOrderDetails {
  site {
    order(filter: { entityId: 105 }) {
      billingAddress {
        address1
        city
        company
        country
        countryCode
        email
        firstName
        lastName
        phone
        postalCode
        stateOrProvince
      }
      consignments {
        shipping {
          edges {
              cursor
              node {
              lineItems {
                edges {
                  node {
                    brand
                    entityId
                    name
                    subTotalListPrice {
                      currencyCode
                      value
                    }
                  }
                }
              }
              shipments {
                edges {
                  node {
                    shippingProviderName
                    tracking {
                      ... on OrderShipmentUrlOnlyTracking {
                          __typename
                      }
                    }
                  }
                }
              }
              shippingAddress {
                address1
                city
                firstName
                lastName
                postalCode
                stateOrProvince
              }
              shippingCost {
                currencyCode
                  value
              }
            }
          }
        }
      }
      subTotal {
        currencyCode
        value
      }
      taxTotal {
        currencyCode
        value
      }
      totalIncTax {
        currencyCode
        value
      }
      updatedAt {
        utc
      }
    }
  }
}`;
const graphql = JSON.stringify({
  query: gqlQueryString,
  variables: {}
})

export const OrderDetailsInfo = () => {

  useEffect(() => {
    const getOrderDetails = async () => {
      console.log('========insideeeeeeee=======');
      let orderDataaaa = await fetch('https://store-2zedqgpp8x.mybigcommerce.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJjaWQiOlsxLDE2NjQ1MjJdLCJjb3JzIjpbImh0dHBzOi8vZ3JhY2lvdXNnYXJhZ2UuY29tIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sImVhdCI6MjE0NzQ4MzY0NywiaWF0IjoxNzMzMTMwNTE1LCJpc3MiOiJCQyIsInNpZCI6MTAwMzI1MTQxOCwic3ViIjoib3JtNzF6NzR6YWRhczNnN2Z4N2R0eDl5NGJlaXBnIiwic3ViX3R5cGUiOjIsInRva2VuX3R5cGUiOjF9.KIGUiwxPJ_EAoUmNB8sdpX5erXS0GMHONyaV5YXher7UtdbZqAWScFePs59wYGlRpcJ3rAdMri9RIkVI84teuA'
        },
        body: graphql
      })
        .then(response => response.json())
        .then(result => console.log('-----order details-------------------', result))
        .catch(error => console.error(error));
      console.log('========orderDataaaa=======', orderDataaaa);
    }
    getOrderDetails();
  }, []);

  return (
    <>test</>
  )
};