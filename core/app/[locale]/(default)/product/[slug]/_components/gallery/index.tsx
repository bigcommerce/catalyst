'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { FragmentOf } from '~/client/graphql';
import { Gallery as ComponentsGallery } from '~/components/ui/gallery';
import { GalleryFragment } from './fragment';

interface Image {
  url: string;
  altText?: string;
  isDefault: boolean;
}

interface Video {
  title: string;
  url: string;
}

interface Props {
  product: FragmentOf<typeof GalleryFragment>;
  bannerIcon: string;
  galleryExpandIcon: string;
  productMpn?: string | null;
}

export const Gallery = ({ product, bannerIcon, galleryExpandIcon, productMpn }: Props) => {
  const images: Image[] = removeEdgesAndNodes(product.images) as Image[];
  const videos: Video[] = removeEdgesAndNodes(product.videos) as Video[];

  const topLevelDefaultImg = images.find((image) => image.isDefault);

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

  const imagesWithMetadata = images.map((image) => ({
    src: image.url,
    altText: image.altText || 'No description available',
    mpn: productMpn,
  }));

  const videosWithMetadata = videos.map((video) => ({
    url: video.url,
    title: video.title,
  }));

  return (
    <div className="-mx-6 mb-10 sm:-mx-0 md:mb-3">
      <div className="lg:sticky lg:top-0">
        <ComponentsGallery
          bannerIcon={bannerIcon}
          galleryExpandIcon={galleryExpandIcon}
          defaultImageIndex={defaultImageIndex}
          images={imagesWithMetadata}
          videos={videosWithMetadata}
          productMpn={productMpn}
        />
      </div>
    </div>
  );
};
