'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { FragmentOf } from '~/client/graphql';
import { Gallery as ComponentsGallery } from '~/components/ui/gallery';

import { GalleryFragment } from './fragment';

interface Props {
  product: FragmentOf<typeof GalleryFragment>;
}

export const Gallery = ({ product }: Props) => {
  const images = removeEdgesAndNodes(product.images);

  // Pick the top-level default image
  const topLevelDefaultImg = images.find((image) => image.isDefault);

  // If product.defaultImage exists, and product.defaultImage.url is not equal to the url of the isDefault image in images,
  // mark the existing isDefault image to "isDefault = false" and append the correct default image to images
  if (product.defaultImage && topLevelDefaultImg?.url !== product.defaultImage.url) {
    images.forEach((image) => {
      image.isDefault = false;
    });

    images.push({
      url: product.defaultImage.url,
      altText: product.defaultImage.altText,
      isDefault: true,
    });
  }

  const defaultImageIndex = images.findIndex((image) => image.isDefault);

  return (
    <div className="-mx-6 mb-10 sm:-mx-0 md:mb-12">
      <div className="lg:sticky lg:top-0">
        <ComponentsGallery
          defaultImageIndex={defaultImageIndex}
          images={images.map((image) => ({ src: image.url, altText: image.altText }))}
        />
      </div>
    </div>
  );
};
