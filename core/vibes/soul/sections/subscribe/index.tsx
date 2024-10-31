import { BcImage } from '~/components/bc-image';

import { clsx } from 'clsx';

import { InlineEmailForm } from '@/vibes/soul/primitives/inline-email-form';

interface Props {
  image?: {
    src: string;
    alt: string;
  };
  title: string;
  description: string;
  // action: (formData: FormData) => void
}

export const Subscribe = function Subscribe({ image, title, description }: Props) {
  return (
    <section className="@container">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center @2xl:flex-row">
        {image && (
          <div className="relative aspect-square h-full w-full overflow-hidden bg-primary/10 @2xl:aspect-[9/12] @2xl:w-3/4 @4xl:aspect-square">
            <BcImage
              src={image.src}
              alt={image.alt}
              sizes="(max-width: 680px) 100vw, 50vw"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div
          className={clsx(
            'mx-3 flex items-center gap-y-12 text-foreground @xl:mx-6 @3xl:w-full @5xl:mx-20',
            image?.src != null
              ? 'flex-col py-10 @3xl:gap-y-16'
              : 'flex-col gap-x-10 border-t border-t-contrast-100 py-20 @2xl:flex-row',
          )}
        >
          <div className="w-full">
            <h2 className="mb-4 font-heading text-4xl font-medium leading-none @2xl:max-w-lg @7xl:text-5xl">
              {title}
            </h2>
            <p className="opacity-50 @2xl:max-w-sm">{description}</p>
          </div>

          <InlineEmailForm
          // action={action}
          />
        </div>
      </div>
    </section>
  );
};
