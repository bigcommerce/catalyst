import { Link } from '~/components/link';

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
    <section className="@container">
      <div className="py-10 @4xl:py-24">
        <div className="mx-auto mb-6 flex w-full max-w-screen-2xl flex-row flex-wrap justify-between gap-5 px-3 text-foreground @xl:px-6 @4xl:mb-8 @4xl:items-end @5xl:px-20">
          <div className="flex flex-col gap-5">
            <h2 className="font-heading text-2xl font-medium leading-none">{title}</h2>
            {description != null && description !== '' && (
              <p className="max-w-md text-contrast-400">{description}</p>
            )}
          </div>
          {cta != null && cta.href !== '' && cta.label !== '' && (
            <Link
              href={cta.href}
              className="rounded-lg font-semibold text-foreground ring-primary focus-visible:outline-0 focus-visible:ring-2"
            >
              {cta.label}
            </Link>
          )}
        </div>
        <CardCarousel cards={cards} />
      </div>
    </section>
  );
}
