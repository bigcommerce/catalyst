import { List, Link as MSLink, Shape, Slot, Style, TextInput } from '@makeswift/runtime/controls';

import { Link } from '~/components/link';
import { runtime } from '~/lib/makeswift/runtime';

import { Carousel, CarouselButtons, CarouselContent, CarouselItem, CarouselScrollbar } from '.';

type Slide = {
  link: { href?: string; target?: string };
  children: React.ReactNode;
};

type MSCarouselProps = {
  className: string;
  slides?: Slide[];
};

runtime.registerComponent(
  function MSCarousel({ className, slides }: MSCarouselProps) {
    return (
      <div className={className}>
        {!slides || slides.length < 1 ? (
          <div className="p-4 text-center text-lg text-gray-400">Add items to the carousel</div>
        ) : (
          <Carousel>
            <CarouselContent className="mb-20">
              {slides.map(({ link, children }, index) => (
                <CarouselItem
                  className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
                  key={link.href || index} // Use link.href as key if available, otherwise use index
                >
                  <Link href={link.href ?? ''} target={link.target ?? ''}>
                    {children}
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex w-full items-center justify-between">
              <CarouselScrollbar />
              <CarouselButtons />
            </div>
          </Carousel>
        )}
      </div>
    );
  },
  {
    type: 'primitive-carousel',
    label: 'Primitives / Carousel',
    icon: 'carousel',
    props: {
      className: Style(),
      slides: List({
        label: 'Slides',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: '' }),
            link: MSLink({ label: 'Link' }),
            children: Slot(),
          },
        }),
        getItemLabel(slide) {
          return slide?.title || 'Slide';
        },
      }),
    },
  },
);
