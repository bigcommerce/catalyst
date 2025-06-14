import {
  Group,
  Image,
  Link,
  List,
  Style,
  TextInput,
  Number,
  Checkbox,
} from '@makeswift/runtime/controls';
import dynamic from 'next/dynamic';

import { breakpoints, runtime } from '~/lib/makeswift/runtime';
import 'react-multi-carousel/lib/styles.css';

const Carousel = dynamic(() => import('react-multi-carousel'), { ssr: true });

interface LogoInterface {
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
}

type MSLogoCarouselProps = {
  itemsPerRowSuperDesktop: number;
  itemsPerRowDesktop: number;
  itemsPerRowTablet: number;
  itemsPerRowMobile: number;
  className: string;
  logos: LogoInterface[];
  swipeable?: boolean;
  draggable?: boolean;
  infinite?: boolean;
  keyBoardControl?: boolean;
  arrows?: boolean;
  playSpeed: number;
};

runtime.registerComponent(
  function MSLogoCarousel({
    itemsPerRowSuperDesktop,
    itemsPerRowDesktop,
    itemsPerRowMobile,
    itemsPerRowTablet,
    logos,
    swipeable,
    draggable,
    infinite,
    keyBoardControl,
    arrows,
    playSpeed,
    className,
  }: MSLogoCarouselProps) {
    const responsive = {
      superLargeDesktop: {
        breakpoint: { max: 4000, min: breakpoints.screen.width }, // XL and above
        items: itemsPerRowSuperDesktop,
      },
      desktop: {
        breakpoint: { max: breakpoints.screen.width, min: breakpoints.large.width }, // 1280–1024
        items: itemsPerRowDesktop,
      },
      tablet: {
        breakpoint: { max: breakpoints.large.width, min: breakpoints.small.width }, // 1024–640
        items: itemsPerRowTablet,
      },
      mobile: {
        breakpoint: { max: breakpoints.small.width, min: 0 }, // <640
        items: itemsPerRowMobile,
      },
    };

    return (
      <>
        {logos.length > 0 ? (
          <Carousel
            swipeable={swipeable}
            draggable={draggable}
            showDots={false}
            arrows={arrows}
            responsive={responsive}
            ssr={true} // means to render carousel on server-side.
            infinite={infinite}
            deviceType={'desktop'} // This is important for SSR. It should match the device type you want to render.
            autoPlaySpeed={playSpeed * 1000} // Convert seconds to milliseconds
            keyBoardControl={keyBoardControl}
            customTransition="all 1000ms"
            transitionDuration={1000}
            containerClass="carousel-container"
            removeArrowOnDeviceType={['tablet', 'mobile']}
            dotListClass="custom-dot-list-style"
            itemClass="carousel-item-padding-40-px"
            className={`${className}`}
          >
            {logos.map((logo: LogoInterface, index: number) => (
              <div key={index} className="px-6 py-6">
                <a
                  href={logo.link?.href ?? '#'}
                  target={logo.link?.target}
                  rel={logo.link?.target === '_blank' ? 'noopener noreferrer' : undefined}
                  className="block h-full w-full"
                >
                  <img
                    src={logo.imageSrc ?? ''}
                    alt={logo.imageAlt ?? ''}
                    className="h-full w-full object-contain"
                  />
                </a>
              </div>
            ))}
          </Carousel>
        ) : (
          <div className={`${className} w-full px-6 py-6 text-center`}>
            <p className="text-gray-500">Please Start Adding Logos To See The Carousel</p>
          </div>
        )}
      </>
    );
  },
  {
    type: 'primitive-logo-carousel',
    label: 'Logo Carousel (GIT)',
    icon: 'carousel',
    props: {
      className: Style(),
      logos: List({
        label: 'Logos',
        type: Group({
          label: 'Logo',
          props: {
            imageSrc: Image({ label: 'Image' }),
            imageAlt: TextInput({ label: 'Image Alt', defaultValue: 'Logo image' }),
            link: Link({ label: 'Link' }),
          },
        }),
        getItemLabel(logo) {
          return logo?.imageAlt || 'Logo';
        },
      }),
      itemsPerRowSuperDesktop: Number({
        label: 'Items Per Row (Super Large Desktop)',
        defaultValue: 8,
        min: 1,
      }),
      itemsPerRowDesktop: Number({ label: 'Items Per Row (Desktop)', defaultValue: 6, min: 1 }),
      itemsPerRowTablet: Number({ label: 'Items Per Row (Tablet)', defaultValue: 4, min: 1 }),
      itemsPerRowMobile: Number({ label: 'Items Per Row (Mobile)', defaultValue: 2, min: 1 }),
      arrows: Checkbox({ label: 'Show Arrows', defaultValue: true }),
      swipeable: Checkbox({ label: 'Allow Swipeable Moving', defaultValue: false }),
      draggable: Checkbox({ label: 'Allow Draggable Moving', defaultValue: false }),
      infinite: Checkbox({ label: 'Infinite Loop', defaultValue: true }),
      keyBoardControl: Checkbox({ label: 'Enable Keyboard Control', defaultValue: true }),
      playSpeed: Number({ label: 'Slide Play Speed (In Seconds)', defaultValue: 1 }),
    },
  },
);
