import {
  Checkbox,
  List,
  Link as MSLink,
  Select,
  Shape,
  Slot,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';
import { Link } from '~/components/link';
import { runtime } from '~/lib/makeswift/runtime';

interface Slide {
  link: { href?: string; target?: string };
  children: React.ReactNode;
}

interface MSCarouselProps {
  className: string;
  slides?: Slide[];
  showScrollbar: boolean;
  showArrows: boolean;
  colorScheme: 'light' | 'dark';
}

runtime.registerComponent(
  function MSCarousel({
    className,
    slides,
    showScrollbar = true,
    showArrows = true,
    colorScheme,
  }: MSCarouselProps) {
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
                  key={link.href || index}
                >
                  <Link href={link.href ?? ''} target={link.target ?? ''}>
                    {children}
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            {(showScrollbar || showArrows) && (
              <div className="flex w-full items-center justify-between">
                {showScrollbar && <CarouselScrollbar colorScheme={colorScheme} />}
                {showArrows && <CarouselButtons colorScheme={colorScheme} />}
              </div>
            )}
          </Carousel>
        )}
      </div>
    );
  },
  {
    type: 'primitive-carousel',
    label: 'Basic / Carousel',
    icon: 'carousel',
    props: {
      className: Style(),
      slides: List({
        label: 'Slides',
        type: Shape({
          type: {
            name: TextInput({ label: 'Name', defaultValue: '' }),
            link: MSLink({ label: 'Link' }),
            children: Slot(),
          },
        }),
        getItemLabel(slide) {
          return slide?.name || 'Slide';
        },
      }),
      showScrollbar: Checkbox({
        label: 'Show scrollbar',
        defaultValue: true,
      }),
      showArrows: Checkbox({
        label: 'Show arrows',
        defaultValue: true,
      }),
      colorScheme: Select({
        label: 'Color scheme',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ],
        defaultValue: 'light',
      }),
    },
  },
);
