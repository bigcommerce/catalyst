import clsx from 'clsx';
import Image from 'next/image';
import React, { MouseEvent } from 'react';

interface Props {
  className?: string;
  imageSrc?: { url: string; dimensions: { width: number; height: number } };
  imageAlt: string;
  hasBadge: boolean;
  badgeText?: string;
  link?: {
    target?: '_self' | '_blank';
    href: string;
    onClick(event: MouseEvent): void;
  };
  heading?: string;
  name?: string;
  price?: string;
  originalPrice?: string;
}

export function ProductCard({
  className,
  hasBadge,
  badgeText,
  imageSrc,
  imageAlt,
  link,
  heading,
  name,
  price,
  originalPrice,
}: Props) {
  return (
    <a {...link} className={clsx(className, 'group w-full')}>
      <div className="relative mb-4 aspect-[4/5] overflow-hidden">
        {imageSrc ? (
          <Image
            alt={imageAlt}
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            fill
            src={imageSrc.url}
          />
        ) : (
          <div className="h-full w-full bg-gray-100" />
        )}
        {hasBadge && (
          <div className="absolute left-0 top-4 bg-black px-4 py-1 text-base font-semibold text-white">
            {badgeText}
          </div>
        )}
      </div>
      {Boolean(heading) && <div className="leading-7 opacity-50">{heading}</div>}
      <h3 className="mb-2 text-h5 font-bold">{name}</h3>
      <p className="text-base">
        ${price}
        {Boolean(originalPrice) && (
          <span className="ml-3 line-through opacity-50">${originalPrice}</span>
        )}
      </p>
    </a>
  );
}
