import { clsx } from 'clsx';
import Image, { StaticImageData } from 'next/image';

import { Link } from '~/components/link';

import { Button } from '../button';

export interface FeaturedImageProps {
  title: string;
  description: string;
  image: {
    src: string | StaticImageData;
    blurDataUrl?: string;
    altText: string;
  };
  cta: {
    href: string;
    label: string;
  };
  mediaAlign?: 'left' | 'right' | 'full';
}

export const FeaturedImage = function FeaturedImage({
  title,
  description,
  image,
  cta,
  mediaAlign = 'left',
}: FeaturedImageProps) {
  return (
    <section
      className={clsx(
        'relative bg-primary-shadow @container',
        mediaAlign === 'full' && 'h-dvh max-h-[780px]',
      )}
    >
      <div className="mx-auto flex h-full max-w-screen-2xl flex-col @3xl:flex-row">
        <div
          className={clsx(
            'w-full object-cover',
            mediaAlign === 'full'
              ? 'absolute inset-0 h-full'
              : 'relative aspect-square bg-primary/10 @xl:aspect-[9/6] @3xl:h-dvh @3xl:max-h-[880px] @3xl:w-1/2 @5xl:w-3/5',
            {
              '@3xl:order-2 @7xl:mr-20': mediaAlign === 'right',
              '@7xl:ml-20': mediaAlign === 'left',
            },
          )}
        >
          <Image
            alt={image.altText}
            blurDataURL={image.blurDataUrl}
            className="object-cover"
            fill
            placeholder={image.blurDataUrl != null && image.blurDataUrl !== '' ? 'blur' : 'empty'}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 60vw"
            src={image.src}
          />
        </div>
        <div
          className={clsx(
            'z-10 mx-auto flex flex-col items-start gap-4 px-3 pb-20 pt-10 text-background @5xl:p-20',
            mediaAlign === 'full'
              ? '5xl:px-20 mx-auto mt-auto w-full max-w-screen-2xl px-3 @xl:px-6'
              : 'w-full justify-end @xl:px-6 @3xl:w-1/2 @5xl:w-2/5',
            { '@3xl:order-1': mediaAlign === 'right' },
          )}
        >
          <h2 className="max-w-xl font-heading text-4xl font-medium leading-none @xl:text-5xl">
            {title}
          </h2>
          <p className="max-w-md pb-2">{description}</p>
          <Button
            asChild
            className={clsx(mediaAlign === 'full' ? 'text-background' : 'text-foreground')}
            variant={mediaAlign === 'full' ? 'tertiary' : 'primary'}
          >
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
