import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';

import { clsx } from 'clsx';
import { icons } from 'lucide-react';

import { Button } from '@/vibes/soul/primitives/button';
import { Icon } from '@/vibes/soul/primitives/icon';

export interface FeatureProps {
  image: {
    src: string;
    alt: string;
  };
  title?: string;
  description?: string;
  grid?: {
    icon: keyof typeof icons;
    title: string;
    description: string;
  }[];
  cta: {
    href: string;
    label: string;
  };
}

export const Feature = function Feature({ image, title, description, grid, cta }: FeatureProps) {
  return (
    <section className="relative bg-primary-shadow @container/section">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center @3xl/section:max-h-[880px] @3xl/section:flex-row @5xl/section:h-dvh">
        {/* Image Side */}
        <div className="relative aspect-square w-full overflow-hidden bg-primary/10 @3xl/section:aspect-[9/12] @4xl/section:my-[110px] @4xl/section:w-2/3 @4xl/section:rounded-xl @4xl:ml-10 @5xl/section:w-3/5 @6xl/section:ml-20">
          <BcImage
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 384px"
            className="object-cover"
          />
        </div>

        {/* Content Side */}
        <div className="mx-auto w-full items-start px-3 py-10 text-background @container/content @lg/section:px-10 @5xl:p-20">
          <div className="mx-auto flex max-w-xl flex-col gap-4">
            {title != null && title !== '' && (
              <h2 className="font-heading text-4xl font-medium leading-none @xl:text-5xl">
                {title}
              </h2>
            )}

            {description != null && description !== '' && <p className="pb-2">{description}</p>}

            {grid != null && (
              <ul className="mx-auto mb-16 grid gap-10 @xs/content:grid-cols-2 @4xl/section:mx-0">
                {grid.map(({ title: itemTitle, description: itemDescription, icon }, idx) => {
                  return (
                    <li key={idx} className="flex gap-4 @sm/content:items-center">
                      <Icon
                        name={icon}
                        className="h-8 w-8 @xs/content:h-5 @xs/content:w-5 @lg/content:h-10 @lg/content:w-10"
                      />
                      <div className="flex flex-col">
                        <span className="-mt-1.5 text-lg font-medium @sm/content:-mt-1 @md/content:text-xl">
                          {itemTitle}
                        </span>
                        <span className="text-xs opacity-80 @md/content:text-sm">
                          {itemDescription}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <Button
              variant="primary"
              className={clsx({
                'self-center @3xl/section:self-start': grid?.length,
              })}
              asChild
            >
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
