'use client';

import { clsx } from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useState } from 'react';

import { BcImage } from '~/components/bc-image';

interface Image {
  altText: string;
  src: string;
}

export interface ProductGalleryProps {
  images: Image[];
}

export const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [previewImage, setPreviewImage] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel();

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setPreviewImage(emblaApi.selectedScrollSnap());

    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const selectImage = (index: number) => {
    setPreviewImage(index);
    if (emblaApi) emblaApi.scrollTo(index);
  };

  return (
    <div className="relative mt-[60px] flex h-96 w-full items-center overflow-hidden bg-contrast-100 @2xl:h-[550px] @4xl:mt-0 @4xl:h-full">
      <div className="my-auto h-full max-h-[800px] w-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full w-full">
          {images.map((image, idx) => (
            <div
              className="relative h-full w-full min-w-0 shrink-0 grow-0 basis-full items-center"
              key={idx}
            >
              <BcImage
                alt={image.altText}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                src={image.src}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 flex max-w-full -translate-x-1/2 gap-1.5 overflow-x-auto px-10 @3xl:gap-3 @4xl:bottom-10">
        {images.map((image, index) => (
          <button
            aria-label={`View image number ${index + 1}`}
            className={clsx(
              'h-10 w-10 shrink-0 overflow-hidden rounded-lg border transition-colors duration-300 @4xl:h-14 @4xl:w-14',
              index === previewImage ? 'border-foreground' : 'border-transparent',
            )}
            key={index}
            onClick={() => selectImage(index)}
          >
            <BcImage
              alt={image.altText}
              className="h-full w-full bg-contrast-100 object-cover"
              height={256}
              src={image.src}
              width={256}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
