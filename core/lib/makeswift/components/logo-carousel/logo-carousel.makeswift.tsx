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
  totalSlides: number;
  className: string;
  logos: LogoInterface[];
};

runtime.registerComponent(
  function MSLogoCarousel({ totalSlides, ...props }: MSLogoCarouselProps) {
    return (
      <>
        {props.logos.map((logo: LogoInterface, index: number) => (
          //   <Slide index={index} key={index}>
          <Logo
            key={index}
            width={100}
            height={50}
            logo={{ src: logo.imageSrc ?? '', alt: logo.imageAlt ?? '' }}
            href={logo.link?.href ?? '#'}
          />
          //   </Slide>
        ))}
        {/* <CarouselProvider
              naturalSlideWidth={100}
              naturalSlideHeight={50}
              totalSlides={totalSlides}
              isIntrinsicHeight={true}
            >
              <Slider>
                {props.logos.map((logo: LogoInterface, index: number) => (
                  <Slide index={index} key={index}>
                    <Logo
                      width={100}
                      height={50}
                      logo={logo.imageSrc ?? ''}
                      label={logo.imageAlt}
                      href={logo.link?.href ?? '#'}
                    />
                  </Slide>
                ))}
              </Slider>
            </CarouselProvider> */}
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
      totalSlides: Number({ label: 'Total Slides', defaultValue: 3, min: 1 }),
    },
  },
);
