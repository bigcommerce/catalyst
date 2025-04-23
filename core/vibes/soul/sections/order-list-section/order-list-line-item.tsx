import { clsx } from 'clsx';

import { PriceLabel } from '@/vibes/soul/primitives/price-label';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface OrderListLineItem {
  id: string;
  title: string;
  subtitle?: string;
  price: string;
  href?: string;
  image?: { src: string; alt: string };
}

interface Props {
  className?: string;
  lineItem: OrderListLineItem;
}

export function OrderListLineItem({ className, lineItem }: Props) {
  return lineItem.href ? (
    <Link
      className={clsx(
        'group ring-primary shrink-0 basis-32 cursor-pointer rounded-xl ring-offset-4 focus-visible:ring-2 focus-visible:outline-0 @md:rounded-2xl @lg:basis-40',
        className,
      )}
      href={lineItem.href}
      id={lineItem.id}
    >
      <div className="bg-contrast-100 relative aspect-square overflow-hidden rounded-[inherit]">
        {lineItem.image?.src != null ? (
          <Image
            alt={lineItem.image.alt}
            className="bg-contrast-100 w-full scale-100 object-cover transition-transform duration-500 ease-out select-none group-hover:scale-110"
            fill
            sizes="(min-width: 32rem) 10rem, 8rem"
            src={lineItem.image.src}
          />
        ) : (
          <div className="text-contrast-300 pt-3 pl-2 text-4xl leading-[0.8] font-bold tracking-tighter transition-transform duration-500 ease-out group-hover:scale-105">
            {lineItem.title}
          </div>
        )}
      </div>

      <div className="mt-2 px-1 text-sm leading-snug @xs:mt-3">
        <span className="block font-semibold">{lineItem.title}</span>

        {lineItem.subtitle != null && lineItem.subtitle !== '' && (
          <span className="text-contrast-400 block font-normal">{lineItem.subtitle}</span>
        )}
        <PriceLabel className="mt-1.5" price={lineItem.price} />
      </div>
    </Link>
  ) : (
    <div
      className={clsx('group shrink-0 basis-32 rounded-xl @md:rounded-2xl @lg:basis-40', className)}
      id={lineItem.id}
    >
      <div className="bg-contrast-100 relative aspect-square overflow-hidden rounded-[inherit]">
        {lineItem.image?.src != null ? (
          <Image
            alt={lineItem.image.alt}
            className="bg-contrast-100 w-full scale-100 object-cover transition-transform duration-500 ease-out select-none group-hover:scale-110"
            fill
            sizes="(min-width: 32rem) 10rem, 8rem"
            src={lineItem.image.src}
          />
        ) : (
          <div className="text-contrast-300 pt-3 pl-2 text-4xl leading-[0.8] font-bold tracking-tighter transition-transform duration-500 ease-out group-hover:scale-105">
            {lineItem.title}
          </div>
        )}
      </div>

      <div className="mt-2 px-1 text-sm leading-snug @xs:mt-3">
        <span className="block font-semibold">{lineItem.title}</span>

        {lineItem.subtitle != null && lineItem.subtitle !== '' && (
          <span className="text-contrast-400 block font-normal">{lineItem.subtitle}</span>
        )}
        <PriceLabel className="mt-1.5" price={lineItem.price} />
      </div>
    </div>
  );
}
