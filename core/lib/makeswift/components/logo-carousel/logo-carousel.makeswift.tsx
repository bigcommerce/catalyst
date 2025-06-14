import { Group, Image, Link, List, Style, TextInput, Number } from '@makeswift/runtime/controls';
import { Logo } from '@/vibes/soul/primitives/logo';

// import { CarouselProvider, Slider, Slide } from 'pure-react-carousel';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { runtime } from '~/lib/makeswift/runtime';

// import 'pure-react-carousel/dist/react-carousel.es.css';

interface LogoInterface {
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
}

type MSLogoCarouselProps = {
  itemsPerRowDesktop: number;
  itemsPerRowTablet: number;
  itemsPerRowMobile: number;
  className: string;
  logos: LogoInterface[];
  logoWidth: number;
  logoHeight: number;
};

runtime.registerComponent(
  function MSLogoCarousel({
    itemsPerRowDesktop,
    itemsPerRowMobile,
    itemsPerRowTablet,
    logoWidth,
    logoHeight,
    logos,
  }: MSLogoCarouselProps) {
    return (
      <div
        className={`grid gap-x-6 gap-y-4`}
        style={
          {
            gridTemplateColumns: `
          repeat(${itemsPerRowMobile}, minmax(0, 1fr))
        `,
            // Responsive columns using media queries
            ...(itemsPerRowTablet && {
              ['@media (min-width: 640px)']: {
                gridTemplateColumns: `repeat(${itemsPerRowTablet}, minmax(0, 1fr))`,
              },
            }),
            ...(itemsPerRowDesktop && {
              ['@media (min-width: 1024px)']: {
                gridTemplateColumns: `repeat(${itemsPerRowDesktop}, minmax(0, 1fr))`,
              },
            }),
          } as React.CSSProperties
        }
      >
        {logos.map((logo: LogoInterface, index: number) => (
          <div className="flex items-center justify-center">
            <Logo
              key={index}
              width={logoWidth}
              height={logoHeight}
              logo={{ src: logo.imageSrc ?? '', alt: logo.imageAlt ?? '' }}
              href={logo.link?.href ?? '#'}
            />
          </div>
        ))}
      </div>
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
      logoWidth: Number({ label: 'Logo Width', defaultValue: 100, min: 25 }),
      logoHeight: Number({ label: 'Logo Height', defaultValue: 50, min: 25 }),
      itemsPerRowDesktop: Number({ label: 'Items Per Row (Desktop)', defaultValue: 3, min: 1 }),
      itemsPerRowTablet: Number({ label: 'Items Per Row (Tablet)', defaultValue: 3, min: 1 }),
      itemsPerRowMobile: Number({ label: 'Items Per Row (Mobile)', defaultValue: 3, min: 1 }),
    },
  },
);
