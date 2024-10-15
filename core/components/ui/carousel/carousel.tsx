import useEmblaCarousel, { UseEmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ReactNode, useCallback, useEffect, useId, useMemo, useState } from 'react';
import { BcImage } from '~/components/bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { cn } from '~/lib/utils';

type CarouselApi = UseEmblaCarouselType[1];

interface Props {
  className?: string;
  pageSize?: 2 | 3 | 4;
  products: ReactNode[];
  title: string;
}

const Carousel = ({ className, title, pageSize = 4, products, ...props }: Props) => {
  const id = useId();
  const titleId = useId();
  const itemsPerGroup = pageSize;

  const [carouselRef, api] = useEmblaCarousel({
    loop: true,
    axis: 'x',
  });

  const groupedProducts = useMemo(() => {
    return products.reduce<ReactNode[][]>((batches, _, index) => {
      if (index % itemsPerGroup === 0) {
        batches.push([]);
      }

      const product = products[index];

      if (batches[batches.length - 1] && product) {
        batches[batches.length - 1]?.push(product);
      }

      return batches;
    }, []);
  }, [products, itemsPerGroup]);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [selectedSnapIndex, setSelectedSnapIndex] = useState(0);

  const [slidesInView, setSlidesInView] = useState<number[]>([0]);

  const onSelect = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) {
      return;
    }

    setSelectedSnapIndex(emblaApi.selectedScrollSnap());

    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);
    api.on('slidesInView', () => {
      setSlidesInView(api.slidesInView());
    });

    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <div
    id="relatedproduct-carousel"
      aria-labelledby={titleId}
      aria-roledescription="carousel"
      className={cn('relative', className)}
      onKeyDownCapture={handleKeyDown}
      role="region"
      {...props}
    >
      <div className="div-carousel mt-11 flex items-center justify-between">
        <h2 className="text-3xl font-black text-[1.5rem] font-normal leading-[2rem] text-left text-[#353535]" id={titleId}>
          {title}
        </h2>
        <span className="no-wrap flex">
          <button
            aria-label="Previous products"
            className={cn(
              'carousel-previous-arrow inline-flex h-12 w-12 items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:text-gray-400',
              api?.scrollSnapList().length === 1 && 'hidden',
            )}
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
             <BcImage
            className='mb-2 -rotate-180'
              alt="Options icon"
              src={imageManagerImageUrl('vector-8-.png', '30w')}
              height={20}
              priority={true}
              width={30}
            />
            <span className="sr-only">Previous slide</span>
          </button>

          <button
            aria-label="Next products"
            className={cn(
              'carousel-next-arrow inline-flex h-12 w-12 items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:text-gray-400',
              api?.scrollSnapList().length === 1 && 'hidden',
            )}
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
              <BcImage
            className='mb-2'
              alt="Options icon"
              src={imageManagerImageUrl('vector-8-.png', '30w')}
              height={20}
              priority={true}
              width={30}
            />
            <span className="sr-only">Next slide</span>
          </button>
        </span>
      </div>

      <div className="realted-product-carousel relative -mx-2 overflow-hidden px-2" ref={carouselRef}>
        <div className="-mx-4 mb-16 mt-5 flex lg:mt-6">
          {groupedProducts.map((group, index) => (
            <div
              aria-label={`${index + 1} of ${groupedProducts.length}`}
              aria-roledescription="slide"
              className={cn(
                'grid min-w-0 shrink-0 grow-0 basis-full grid-cols-2 gap-6 px-4 md:grid-cols-4 lg:gap-8',
                !slidesInView.includes(index) && 'invisible',
              )}
              id={`${id}-slide-${index + 1}`}
              key={index}
              role="group"
            >
              {group.map((item) => item)}
            </div>
          ))}
        </div>
      </div>

      <div
        aria-label="Slides"
        className={cn(
          'no-wrap mb-3 absolute bottom-1 flex w-full items-center justify-center gap-2',
          api?.scrollSnapList().length === 1 && 'hidden',
        )}
        role="tablist"
      >
        {groupedProducts.map((_, index) => (
          <button
            aria-controls={`${id}-slide-${index + 1}`}
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={selectedSnapIndex === index}
            className={cn(
              "h-7 w-7 p-0.5 after:block after:h-0.5 after:w-full after:bg-gray-400 after:content-[''] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
              selectedSnapIndex === index && 'after:bg-black',
            )}
            key={index}
            onClick={() => api?.scrollTo(index)}
            role="tab"
          />
        ))}
      </div>
    </div>
  );
};

export { Carousel };
