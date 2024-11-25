import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';

import clsx from 'clsx';

import { PriceLabel } from '@/vibes/soul/primitives/price-label';

export type OrderListLineItem = {
  id: string;
  title: string;
  subtitle?: string;
  price: string;
  href: string;
  image?: { src: string; alt: string };
};

type Props = {
  className?: string;
  lineItem: OrderListLineItem;
};

export function OrderListLineItem({ className, lineItem }: Props) {
  return (
    <Link
      id={lineItem.id}
      href={lineItem.href}
      className={clsx(
        'group shrink-0 basis-32 cursor-pointer rounded-xl ring-primary ring-offset-4 focus-visible:outline-0 focus-visible:ring-2 @md:rounded-2xl @lg:basis-40',
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-[inherit] bg-contrast-100">
        {lineItem.image?.src != null ? (
          <BcImage
            src={lineItem.image.src}
            fill
            sizes="(max-width: 768px) 70vw, 33vw"
            alt="Category card image"
            className="w-full scale-100 select-none bg-contrast-100 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="pl-2 pt-3 text-4xl font-bold leading-[0.8] tracking-tighter text-contrast-300 transition-transform duration-500 ease-out group-hover:scale-105">
            {lineItem.title}
          </div>
        )}
      </div>

      <div className="mt-2 px-1 text-sm leading-snug @xs:mt-3">
        <span className="block font-semibold">{lineItem.title}</span>

        {lineItem.subtitle != null && lineItem.subtitle !== '' && (
          <span className="mb-1.5 block font-normal text-contrast-400">{lineItem.subtitle}</span>
        )}
        {lineItem.price != null && <PriceLabel price={lineItem.price} />}
      </div>
    </Link>
  );
}
