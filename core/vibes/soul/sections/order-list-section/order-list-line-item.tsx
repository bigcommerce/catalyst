import { clsx } from 'clsx';

import { PriceLabel } from '@/vibes/soul/primitives/price-label';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface OrderListLineItem {
  id: string;
  title: string;
  subtitle?: string;
  price: string;
  href: string;
  image?: { src: string; alt: string };
}

interface Props {
  className?: string;
  lineItem: OrderListLineItem;
}

export function OrderListLineItem({ className, lineItem }: Props) {
  return (
    <Link
      className={clsx(
        'group shrink-0 basis-32 cursor-pointer rounded-xl ring-primary ring-offset-4 focus-visible:outline-0 focus-visible:ring-2 @md:rounded-2xl @lg:basis-40',
        className,
      )}
      href={lineItem.href}
      id={lineItem.id}
    >
      <div className="relative aspect-square overflow-hidden rounded-[inherit] bg-contrast-100">
        {lineItem.image?.src != null ? (
          <Image
            alt={lineItem.image.alt}
            className="w-full scale-100 select-none bg-contrast-100 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            fill
            sizes="(min-width: 32rem) 10rem, 8rem"
            src={lineItem.image.src}
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
          <span className="block font-normal text-contrast-400">{lineItem.subtitle}</span>
        )}
        <PriceLabel className="mt-1.5" price={lineItem.price} />
      </div>
    </Link>
  );
}
