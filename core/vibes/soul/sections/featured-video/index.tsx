import { Link } from '~/components/link';

import { clsx } from 'clsx';

import { Button } from '@/vibes/soul/primitives/button';

interface Props {
  title: string;
  description: string;
  video: string;
  cta: {
    href: string;
    label: string;
  };
  mediaAlign?: 'left' | 'right' | 'full';
}

export const FeaturedVideo = function FeaturedVideo({
  title,
  description,
  video,
  cta,
  mediaAlign = 'left',
}: Props) {
  return (
    <section
      className={clsx(
        'relative bg-primary-shadow @container',
        mediaAlign === 'full' && 'h-dvh max-h-[880px]',
      )}
    >
      <div className="mx-auto flex h-full max-w-screen-2xl flex-col @3xl:flex-row">
        <video
          className={clsx(
            'w-full object-cover',
            mediaAlign === 'full'
              ? 'absolute inset-0 h-full'
              : 'aspect-square @xl:aspect-[9/6] @3xl:h-dvh @3xl:max-h-[880px] @3xl:w-1/2 @5xl:w-3/5',
            { '@3xl:order-2': mediaAlign === 'right' },
          )}
          autoPlay
          muted
          loop
        >
          <source src={video} type="video/mp4" />
        </video>
        <div
          className={clsx(
            'z-10 mx-auto flex flex-col items-start gap-4 px-3 py-10 text-background @5xl:p-20',
            mediaAlign === 'full'
              ? 'mx-auto mt-auto w-full max-w-screen-2xl px-3 @xl:px-6 @5xl:px-20'
              : 'w-full justify-end @xl:px-6 @3xl:w-1/2 @5xl:w-2/5',
            { '@3xl:order-1': mediaAlign === 'right' },
          )}
        >
          <h1 className="max-w-xl text-4xl font-medium leading-none @xl:text-5xl">{title}</h1>
          <p className="max-w-md pb-2">{description}</p>
          <Button
            variant={mediaAlign === 'full' ? 'tertiary' : 'primary'}
            className={clsx(mediaAlign === 'full' ? 'text-background' : 'text-foreground')}
            asChild
          >
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
