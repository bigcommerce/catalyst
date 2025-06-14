import { Group, Image, Link, List, Style, TextInput, Number } from '@makeswift/runtime/controls';
import { Logo } from '@/vibes/soul/primitives/logo';

import { runtime } from '~/lib/makeswift/runtime';

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
  logoWidth: number;
  logoHeight: number;
  logos: LogoInterface[];
};

runtime.registerComponent(
  function MSLogoCarousel({
    itemsPerRowDesktop,
    itemsPerRowMobile,
    itemsPerRowTablet,
    logos,
    className,
    logoHeight,
    logoWidth,
  }: MSLogoCarouselProps) {
    return (
      <div
        className={`${className} grid w-full gap-x-6 gap-y-4 grid-cols-${itemsPerRowMobile} sm:grid-cols-${itemsPerRowTablet} lg:grid-cols-${itemsPerRowDesktop}`}
      >
        {logos.map((logo: LogoInterface, index: number) => (
          <a
            key={index}
            href={logo.link?.href ?? '#'}
            target={logo.link?.target}
            rel={logo.link?.target === '_blank' ? 'noopener noreferrer' : undefined}
            className="block h-full w-full"
          >
            <img
              src={logo.imageSrc ?? ''}
              alt={logo.imageAlt ?? ''}
              className="h-full w-full object-contain"
              style={{ height: `${logoHeight}px`, width: `${logoWidth}px` }}
            />
          </a>
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
      logoWidth: Number({ label: 'Logo Width', defaultValue: 200, min: 1 }),
      logoHeight: Number({ label: 'Logo Height', defaultValue: 125, min: 1 }),
      itemsPerRowDesktop: Number({ label: 'Items Per Row (Desktop)', defaultValue: 6, min: 1 }),
      itemsPerRowTablet: Number({ label: 'Items Per Row (Tablet)', defaultValue: 4, min: 1 }),
      itemsPerRowMobile: Number({ label: 'Items Per Row (Mobile)', defaultValue: 3, min: 1 }),
    },
  },
);
