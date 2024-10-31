import { BcImage } from '~/components/bc-image';

import { Accordion, Accordions } from '@/vibes/soul/primitives/accordions';

export type AccordionItem = {
  title: string;
  content: React.ReactNode;
};

export interface Props {
  accordions: AccordionItem[];
  image?: {
    src: string;
    alt: string;
  };
  video?: string;
}

export function ProductDescription({ accordions, image, video }: Readonly<Props>) {
  return (
    <div className="bg-background @container">
      <div className="relative mx-auto flex w-full max-w-screen-2xl flex-col-reverse items-start justify-between gap-x-4 gap-y-4 py-6 @lg:flex-row @lg:px-6 @lg:py-24 @xl:gap-x-10 @5xl:px-20 @7xl:gap-x-32">
        <Accordions className="px-5 @lg:sticky @lg:top-20" type="multiple">
          {accordions.map((accordion, index) => (
            <Accordion title={accordion.title} value={index.toString()}>
              {accordion.content}
            </Accordion>
          ))}
        </Accordions>

        {/* Image || Video Container */}
        <div className="relative aspect-square w-full overflow-hidden @lg:sticky @lg:top-20 @lg:aspect-[9/12] @lg:rounded-2xl @4xl:min-w-96">
          {image ? (
            <BcImage
              src={image.src}
              fill
              alt={image.alt}
              sizes="(max-width: 500px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            video != null &&
            video !== '' && (
              <video className="h-full object-cover" muted loop autoPlay>
                <source src={video} type="video/mp4" />
              </video>
            )
          )}
        </div>
      </div>
    </div>
  );
}
