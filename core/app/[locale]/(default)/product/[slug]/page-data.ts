import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { ProductItemFragment } from '~/client/fragments/product-item';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { BreadcrumbsFragment } from '~/components/breadcrumbs/fragment';
import { WishlistSheetFragment } from '~/components/wishlist-sheet/fragment';

import { DescriptionFragment } from './_components/description';
import { DetailsFragment } from './_components/details';
import { GalleryFragment } from './_components/gallery/fragment';
import { WarrantyFragment } from './_components/warranty';

const ProductPageQuery = graphql(
  `
    query ProductPageQuery(
      $entityId: Int!
      $optionValueIds: [OptionValueId!]
      $useDefaultOptionSelections: Boolean
    ) {
      site {
        product(
          entityId: $entityId
          optionValueIds: $optionValueIds
          useDefaultOptionSelections: $useDefaultOptionSelections
        ) {
          ...GalleryFragment
          ...DetailsFragment
          ...ProductItemFragment
          ...DescriptionFragment
          ...WarrantyFragment
          entityId
          name
          defaultImage {
            url: urlTemplate(lossy: true)
            altText
          }
          categories(first: 1) {
            edges {
              node {
                ...BreadcrumbsFragment
              }
            }
          }
          seo {
            pageTitle
            metaDescription
            metaKeywords
          }
        }
      }
      customer {
        wishlists(first: 50) {
          ...WishlistSheetFragment
        }
      }
    }
  `,
  [
    BreadcrumbsFragment,
    GalleryFragment,
    DetailsFragment,
    ProductItemFragment,
    DescriptionFragment,
    WarrantyFragment,
    WishlistSheetFragment,
  ],
);

type Variables = VariablesOf<typeof ProductPageQuery>;

export const getProduct = cache(async (variables: Variables) => {
  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
    document: ProductPageQuery,
    variables,
    customerId,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const wishlists = data.customer?.wishlists
    ? removeEdgesAndNodes(data.customer.wishlists).map((wishlist) => {
        return {
          ...wishlist,
          items: removeEdgesAndNodes(wishlist.items),
        };
      })
    : [];

  return { product: data.site.product, wishlists };
});
