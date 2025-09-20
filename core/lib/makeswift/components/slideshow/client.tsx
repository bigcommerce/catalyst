import { Slideshow } from '@/vibes/soul/sections/slideshow';

interface Slide {
  title: string;
  description: string;
  showDescription: boolean;
  imageSrc?: string;
  imageAlt: string;
  showButton: boolean;
  buttonLink?: { href?: string; target?: string };
  buttonText: string;
  buttonColor: 'primary' | 'secondary' | 'tertiary' | 'ghost';
}

interface MSAccordionsProps {
  className: string;
  slides: Slide[];
  autoplay: boolean;
  interval: number;
}

export function MSSlideshow({ className, slides, autoplay, interval }: MSAccordionsProps) {
  return (
    <Slideshow
      className={className}
      interval={interval * 1000}
      playOnInit={autoplay}
      slides={slides.map(
        ({
          title,
          description,
          showDescription,
          imageSrc,
          imageAlt,
          showButton,
          buttonLink,
          buttonText,
          buttonColor,
        }) => {
          return {
            title,
            description,
            showDescription,
            image: imageSrc ? { alt: imageAlt, src: imageSrc } : undefined,
            showCta: showButton,
            cta: { label: buttonText, href: buttonLink?.href ?? '#', variant: buttonColor },
          };
        },
      )}
    />
  );
}
