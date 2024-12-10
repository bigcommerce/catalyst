import { SubmissionResult } from '@conform-to/react';
import { clsx } from 'clsx';

import { InlineEmailForm } from '@/vibes/soul/primitives/inline-email-form';
import { Image } from '~/components/image';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export function Subscribe({
  action,
  image,
  title,
  description,
  placeholder,
}: {
  action: Action<{ lastResult: SubmissionResult | null; successMessage?: string }, FormData>;
  image?: { src: string; alt: string };
  title: string;
  description?: string;
  placeholder?: string;
}) {
  return (
    <section className="bg-primary-shadow @container">
      <div className="flex flex-col items-start @4xl:flex-row @4xl:items-stretch">
        {image && (
          <div className="relative min-h-96 w-full bg-primary/10 @4xl:flex-1">
            <Image
              alt={image.alt}
              className="object-cover"
              fill
              sizes="(max-width: 680px) 100vw, 50vw"
              src={image.src}
            />
          </div>
        )}

        <div className="w-full flex-1">
          <div
            className={clsx(
              'flex w-full flex-col gap-10 px-4 py-10 @xl:px-6 @xl:py-14 @4xl:gap-16 @4xl:px-8 @4xl:py-20',
              image != null ? '@4xl:max-w-4xl' : 'mx-auto max-w-screen-2xl @4xl:flex-row',
            )}
          >
            <div className="flex-1">
              <h2 className="mb-4 font-heading text-2xl font-medium leading-none text-primary-highlight @xl:text-3xl @4xl:text-4xl">
                {title}
              </h2>
              <p className="text-primary-highlight opacity-75">{description}</p>
            </div>
            <InlineEmailForm action={action} className="flex-1" placeholder={placeholder} />
          </div>
        </div>
      </div>
    </section>
  );
}
