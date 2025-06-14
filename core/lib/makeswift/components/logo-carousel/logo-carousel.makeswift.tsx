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
};

runtime.registerComponent(
  function MSLogoCarousel({
    itemsPerRowDesktop,
    itemsPerRowMobile,
    itemsPerRowTablet,
    logos,
    className,
  }: MSLogoCarouselProps) {
    return (
      <div
        className={`${className} grid w-full gap-x-6 gap-y-4 grid-cols-${itemsPerRowMobile} sm:grid-cols-${itemsPerRowTablet} lg:grid-cols-${itemsPerRowDesktop}`}
      >
        {logos.map((logo: LogoInterface, index: number) => (
          <Logo
            width={100}
            height={75}
            logo={{ src: logo.imageSrc ?? '', alt: logo.imageAlt ?? '' }}
            href={logo.link?.href ?? '#'}
          />
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
      itemsPerRowDesktop: Number({ label: 'Items Per Row (Desktop)', defaultValue: 6, min: 1 }),
      itemsPerRowTablet: Number({ label: 'Items Per Row (Tablet)', defaultValue: 4, min: 1 }),
      itemsPerRowMobile: Number({ label: 'Items Per Row (Mobile)', defaultValue: 3, min: 1 }),
    },
  },
);
