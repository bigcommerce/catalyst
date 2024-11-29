import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';

import { Breadcrumbs } from '~/components/breadcrumbs';
import { BrandsList } from './_components/brands-list';

//import { getSessionCustomerId } from '~/auth';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const BrandsPageQuery = function(cursor: string | null) {
  return graphql(`
    query Brands {
      site {
        brands (first: 50${cursor ? ', after: "' + cursor + '"' : ''}) {
          pageInfo {
            startCursor
            endCursor
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              entityId
              name
              defaultImage {
                urlOriginal
              }
              searchKeywords
              path
              metafields(namespace: "Search") {
                edges {
                  node {
                    id
                    entityId
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  `);
}

export async function generateMetadata() {
  const t = await getTranslations('Brands');

  return {
    title: t('title'),
  };
}

export default async function BrandsPage() {
  const t = await getTranslations('Brands');
  const format = await getFormatter();

  //const customerId = await getSessionCustomerId();
  const customerAccessToken = await getSessionCustomerAccessToken();

  /*
  const { data } = await client.fetch({
    document: BrandsPageQuery,
    customerId,
    fetchOptions: { cache: 'force-cache' },
  });
  */

  let data = {
    site: {
      brands: {
        pageInfo: {
          startCursor: null,
          endCursor: null,
          hasNextPage: true
        },
        edges: [
        ]
      }
    }
  };

  while (data?.site?.brands?.pageInfo?.hasNextPage) {
    let res: any = await client.fetch({
      document: BrandsPageQuery(data?.site?.brands?.pageInfo?.endCursor),
      //customerId,
      customerAccessToken,
      fetchOptions: { cache: 'force-cache' },
    });
    data.site.brands.pageInfo = res?.data?.site?.brands?.pageInfo;
    data.site.brands.edges = data.site.brands.edges.concat(res?.data?.site?.brands?.edges ?? []);
  }

  //console.log(data.site.brands.pageInfo);
  //console.log(data.site.brands.edges);

  const brands = removeEdgesAndNodes(data.site.brands)
    .map((brand: any) => ({
      ...brand,
      metafields: removeEdgesAndNodes(brand?.metafields),
    }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  return <div className="py-4 px-4 xl:px-12">
    <Breadcrumbs category={{ breadcrumbs: { edges: [{ node: { name: t('title'), path: '/brands' }}]}}} />
    <BrandsList brands={brands} />
  </div>;
}

// TODO: Not sure why its not working with this line uncommented... Something needs to be fixed to enable it.
//export const runtime = 'edge';
