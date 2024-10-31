'use client';

import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { useEffect, useState } from 'react';

import * as Portal from '@radix-ui/react-portal';
import { ArrowRight, X } from 'lucide-react';

import { Button } from '../button';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export type DrawerItem = {
  id: string;
  image?: { src: string; alt: string };
  title: string;
  href: string;
};

type DrawerProps = {
  items: DrawerItem[];
  onRemoveClick?: (id: string) => void;
  cta: { label: string; href: string };
};

export function Drawer({ items, onRemoveClick, cta }: DrawerProps) {
  // This hack is needed to prevent hydration errors.
  // The Radix Portal is not rendered correctly server side, so we need to prevent it from rendering until the client side hydration is complete (and `useEffect` is run).
  // The issue is reported here: https://github.com/radix-ui/primitives/issues/1386
  const [doc, setDoc] = useState<Document | null>(null);
  useEffect(() => setDoc(window.document), []);

  return (
    doc && (
      <Portal.Root className="sticky bottom-0 z-10 w-full border-t bg-background px-3 py-4 @container @md:py-5 @xl:px-6 @5xl:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-end gap-x-3 gap-y-4 @md:flex-row">
          <div className="flex flex-1 flex-wrap justify-end gap-4">
            {items.map((item) => (
              <div className="relative">
                <Link
                  href={item.href}
                  className="group relative flex max-w-56 items-center whitespace-nowrap rounded-xl border border-contrast-100 bg-background font-semibold ring-primary transition-all duration-150 hover:bg-contrast-100 focus:outline-0 focus:ring-2"
                >
                  <div className="bg-primary-highlight/10 relative aspect-square w-12 shrink-0">
                    {item.image?.src != null ? (
                      <BcImage
                        src={item.image.src}
                        alt={item.image.alt}
                        fill
                        className="rounded-lg object-cover @4xl:rounded-r-none"
                      />
                    ) : (
                      <span className="max-w-full break-all p-1 text-xs text-primary-shadow opacity-20">
                        {getInitials(item.title)}
                      </span>
                    )}
                  </div>
                  <span className="hidden truncate pl-3 pr-5 text-foreground @4xl:block">
                    {item.title}
                  </span>
                </Link>

                <button
                  aria-label={`Remove ${item.title}`}
                  onClick={() => onRemoveClick?.(item.id)}
                  className="absolute -right-2.5 -top-2.5 flex h-7 w-7 items-center justify-center rounded-full border border-contrast-100 bg-background text-contrast-400 transition-colors duration-150 hover:border-contrast-200 hover:bg-contrast-100 hover:text-foreground"
                >
                  <X strokeWidth={1.5} absoluteStrokeWidth size={16} />
                </button>
              </div>
            ))}
          </div>

          <Button size="medium" variant="primary" className="hidden @md:block">
            {cta.label} <ArrowRight size={20} strokeWidth={1} absoluteStrokeWidth />
          </Button>

          <Button size="small" variant="primary" className="w-full @md:hidden">
            {cta.label} <ArrowRight size={16} strokeWidth={1} absoluteStrokeWidth />
          </Button>
        </div>
      </Portal.Root>
    )
  );
}
