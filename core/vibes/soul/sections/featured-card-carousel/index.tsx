import { AnimatedLink } from '@/vibes/soul/primitives/animated-link';
import { Card, CardCarousel } from '@/vibes/soul/primitives/card-carousel';

type Link = {
  label: string;
  href: string;
};

type Props = {
  title: string;
  description?: string;
  cta?: Link;
  cards: Card[];
};

export function FeaturedCardCarousel({ title, description, cta, cards }: Props) {
  return (
    <section className="overflow-hidden @container">
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        <div className="mb-6 flex w-full flex-row flex-wrap items-end justify-between gap-x-8 gap-y-6 text-foreground @4xl:mb-8">
          <div>
            <h2 className="font-heading text-2xl font-medium leading-none @xl:text-3xl @4xl:text-4xl">
              {title}
            </h2>
            {description != null && description !== '' && (
              <p className="mt-3 max-w-xl text-contrast-500">{description}</p>
            )}
          </div>
          {cta != null && cta.href !== '' && cta.label !== '' && (
            <AnimatedLink className="mr-3" label={cta.label} link={{ href: cta.href }} />
          )}
        </div>
        <CardCarousel cards={cards} />
      </div>
    </section>
  );
}
