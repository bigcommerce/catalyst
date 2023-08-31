'use client';

import {
  GalleryContent,
  GalleryControls,
  GalleryImage,
  GalleryThumbnail,
  GalleryThumbnailItem,
  GalleryThumbnailList,
  Gallery as ReactantGallery,
} from '@bigcommerce/reactant/Gallery';
import Image from 'next/image';

import client from '~/client';

interface Props {
  images: NonNullable<Awaited<ReturnType<typeof client.getProduct>>>['images'];
}

export const Gallery = ({ images }: Props) => {
  const defaultImageIndex = images.findIndex((image) => image.isDefault);

  return (
    <div className="-mx-6 mb-10 sm:-mx-0 md:mb-12">
      <div className="lg:sticky lg:top-0">
        <ReactantGallery defaultImageIndex={defaultImageIndex} images={images}>
          <GalleryContent>
            <GalleryImage>
              {({ selectedImage }) => (
                <Image
                  alt={selectedImage.altText}
                  fill
                  priority={true}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  src={selectedImage.url}
                />
              )}
            </GalleryImage>
            <GalleryControls />
          </GalleryContent>
          <GalleryThumbnailList className="px-6 sm:-mx-1 sm:px-1">
            {images.map((image, index) => {
              return (
                <GalleryThumbnailItem imageIndex={index} key={image.url}>
                  <GalleryThumbnail asChild>
                    <Image alt={`Enlarge ${image.altText}`} priority={true} src={image.url} />
                  </GalleryThumbnail>
                </GalleryThumbnailItem>
              );
            })}
          </GalleryThumbnailList>
        </ReactantGallery>
      </div>
    </div>
  );
};
