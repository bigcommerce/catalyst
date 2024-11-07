import { BcImage as Image } from '~/components/bc-image';

import { Accordion, Accordions } from '@/vibes/soul/primitives/accordions';

export type AccordionItem = {
  title: string;
  content: React.ReactNode;
};

type Props = {
  accordions: AccordionItem[];
  image?: {
    src: string;
    alt: string;
  };
};

export function ProductDescription({ accordions, image }: Props) {
  return (
    <div className="@container">
      <div className="mx-auto flex w-full max-w-screen-xl flex-col-reverse items-stretch gap-x-10 gap-y-6 px-4 py-10 @xl:px-6 @xl:py-14 @2xl:flex-row @2xl:gap-x-12 @4xl:gap-x-16 @4xl:px-8 @4xl:py-20">
        <div className="flex-1">
          <Accordions type="multiple" className="sticky top-6">
            {accordions.map((accordion, index) => (
              <Accordion key={index} title={accordion.title} value={index.toString()}>
                {accordion.content}
              </Accordion>
            ))}
          </Accordions>
        </div>

        <div className="relative aspect-square w-full flex-1 self-start overflow-hidden rounded-2xl @2xl:aspect-[4/5]">
          {image && (
            <Image
              src={image.src}
              fill
              alt={image.alt}
              sizes="(max-width: 500px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
}
