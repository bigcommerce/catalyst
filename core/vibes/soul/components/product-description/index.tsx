/* eslint-disable no-nested-ternary */

import { AccordionItem, Accordions } from '@/vibes/soul/components/accordions';
import { BcImage } from '~/components/bc-image';

export interface Props {
  accordions: AccordionItem[];
  image?: {
    src: string;
    altText: string;
  };
  video?: string;
}

export const ProductDescription = function ProductDescription({
  accordions,
  image,
  video,
}: Readonly<Props>) {
  return (
    <div className="bg-background @container">
      <div className="relative mx-auto flex w-full max-w-screen-2xl flex-col-reverse items-start justify-between gap-x-4 gap-y-4 py-6 @lg:flex-row @lg:px-6 @lg:py-24 @xl:gap-x-10 @5xl:px-20 @7xl:gap-x-32">
        <Accordions accordions={accordions} className="px-5 @lg:sticky @lg:top-20" />

        {/* Image || Video Container */}
        <div className="relative aspect-square w-full overflow-hidden @lg:sticky @lg:top-20 @lg:aspect-[9/12] @lg:rounded-2xl @4xl:min-w-96">
          {image ? (
            <BcImage
              alt={image.altText}
              className="object-cover"
              fill
              sizes="(max-width: 500px) 100vw, 50vw"
              src={image.src}
            />
          ) : video != null && video !== '' ? (
            <video autoPlay className="h-full object-cover" loop muted>
              <source src={video} type="video/mp4" />
            </video>
          ) : null}
        </div>
      </div>
    </div>
  );
};
