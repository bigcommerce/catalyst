import { Group, Image, Link, List, Style, TextInput, Number } from '@makeswift/runtime/controls';
import dynamic from 'next/dynamic';

import { breakpoints, runtime } from '~/lib/makeswift/runtime';

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
};

runtime.registerComponent(
  function MSLogoCarousel({
    itemsPerRowSuperDesktop,
    itemsPerRowDesktop,
    itemsPerRowMobile,
    itemsPerRowTablet,
    logos,
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
      <Carousel
        swipeable={false}
        draggable={false}
        showDots={true}
        responsive={responsive}
        ssr={true} // means to render carousel on server-side.
        infinite={true}
        autoPlaySpeed={1000}
        keyBoardControl={true}
        customTransition="all .5"
        transitionDuration={500}
        containerClass="carousel-container"
        removeArrowOnDeviceType={['tablet', 'mobile']}
        dotListClass="custom-dot-list-style"
        itemClass="carousel-item-padding-40-px"
      >
        {logos.map((logo: LogoInterface, index: number) => (
          <div key={index}>
            <p>Text {index}</p>
            {/* <a
              href={logo.link?.href ?? '#'}
              target={logo.link?.target}
              rel={logo.link?.target === '_blank' ? 'noopener noreferrer' : undefined}
              className="block h-full w-full"
            >
              <img src={logo.imageSrc ?? ''} alt={logo.imageAlt ?? ''} className="object-contain" />
            </a> */}
          </div>
        ))}
      </Carousel>
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
    },
  },
);
