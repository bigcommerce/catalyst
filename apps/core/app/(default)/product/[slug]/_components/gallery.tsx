'use client';

import {
  Gallery as ComponentsGallery,
  GalleryContent,
  GalleryControls,
  GalleryImage,
  GalleryThumbnail,
  GalleryThumbnailItem,
  GalleryThumbnailList,
} from '@bigcommerce/components/Gallery';
import Image from 'next/image';

import { getProduct } from '~/client/queries/get-product';
import { ExistingResultType } from '~/client/util';

interface Props {
  images: ExistingResultType<typeof getProduct>['images'];
}

export const Gallery = ({ images }: Props) => {
  const defaultImageIndex = images.findIndex((image) => image.isDefault);

  return (
    <div className="-mx-6 mb-10 sm:-mx-0 md:mb-12">
      <div className="lg:sticky lg:top-0">
        <ComponentsGallery defaultImageIndex={defaultImageIndex} images={images}>
          <GalleryContent>
            <GalleryImage>
              {({ selectedImage }) =>
                selectedImage ? (
                  <Image
                    alt={selectedImage.altText}
                    className="h-full w-full object-contain"
                    fill
                    priority={true}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    src={selectedImage.url}
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-gray-200">
                    <div className="text-base font-semibold text-gray-500">Coming soon</div>
                  </div>
                )
              }
            </GalleryImage>
            <GalleryControls />
          </GalleryContent>
          <GalleryThumbnailList className="px-6 sm:-mx-1 sm:px-1">
            {images.map((image, index) => {
              return (
                <GalleryThumbnailItem imageIndex={index} key={image.url}>
                  <GalleryThumbnail asChild>
                    <Image alt={image.altText} priority={true} src={image.url} />
                  </GalleryThumbnail>
                </GalleryThumbnailItem>
              );
            })}
          </GalleryThumbnailList>
        </ComponentsGallery>
      </div>
    </div>
  );
};
