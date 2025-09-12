import { CardCarousel, CardCarouselProps } from '@/vibes/soul/primitives/card-carousel';

interface Card {
  title: string;
  imageSrc?: string;
  imageAlt: string;
  link?: { href?: string; target?: string };
}

type MSCardCarouselProps = Omit<CardCarouselProps, 'cards'> & {
  cards: Card[];
};

export function MSCardCarousel({ cards, textColorScheme, ...props }: MSCardCarouselProps) {
  return (
    <CardCarousel
      {...props}
      cards={cards.map(({ title, imageSrc, imageAlt, link }, index) => {
        return {
          id: index.toString(),
          title,
          image: imageSrc ? { src: imageSrc, alt: imageAlt } : undefined,
          href: link?.href ?? '#',
        };
      })}
      carouselColorScheme={textColorScheme}
      textColorScheme={textColorScheme}
    />
  );
}
