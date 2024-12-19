'use client';

import { clsx } from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useState } from 'react';

import { Image } from '~/components/image';

interface Props {
  images: Array<{ alt: string; src: string }>;
  className?: string;
}

export function ProductGallery({ images, className }: Props) {
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
    <div className={clsx('@container', className)}>
      <div className="w-full overflow-hidden rounded-xl @xl:rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {images.map((image, idx) => (
            <div className="relative aspect-[4/5] w-full shrink-0 grow-0 basis-full" key={idx}>
              <Image
                alt={image.alt}
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

      <div className="mt-2 flex max-w-full gap-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            aria-label={`View image number ${index + 1}`}
            className={clsx(
              'relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border transition-all duration-300 hover:opacity-100 @md:h-16 @md:w-16',
              index === previewImage
                ? 'border-foreground opacity-100'
                : 'border-transparent opacity-50',
            )}
            key={index}
            onClick={() => selectImage(index)}
          >
            <Image alt={image.alt} className="bg-contrast-100 object-cover" fill src={image.src} />
          </button>
        ))}
      </div>
    </div>
  );
}
