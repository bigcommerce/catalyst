import Image, { StaticImageData } from 'next/image';

import { cn } from '~/lib/utils';

import { Button } from '../button';

interface Props {
  cta?: { url: string; label: string };
  description: string;
  image?: { src: StaticImageData; alt: string; blurDataUrl?: string };
  title: string;
}

const Slide = ({ cta, description, image, title }: Props) => {
  return (
    <div className="relative">
      {image && (
        <Image
          alt={image.alt}
          blurDataURL={image.blurDataUrl}
          className="absolute -z-10 object-cover"
          fill
          placeholder="blur"
          priority
          sizes="(max-width: 1536px) 100vw, 1536px"
          src={image.src}
        />
      )}
      <div className={cn('flex flex-col gap-4 px-12 pb-48 pt-36', !image && 'bg-gray-100')}>
        <h2 className="text-5xl font-black lg:text-6xl">{title}</h2>
        <p className="max-w-xl">{description}</p>
        {cta && (
          <Button asChild className="w-fit">
            <a href={cta.url}>{cta.label}</a>
          </Button>
        )}
      </div>
    </div>
  );
};

export { Slide };
