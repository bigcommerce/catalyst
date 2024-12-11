'use client';

import { ArrowRight, X } from 'lucide-react';
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';

import { Button } from '@/vibes/soul/primitives/button';
import { Drawer } from '@/vibes/soul/primitives/drawer';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface DrawerItem {
  id: string;
  image?: { src: string; alt: string };
  href: string;
  title: string;
}

interface Props {
  items: DrawerItem[];
  paramName?: string;
  action?: React.ComponentProps<'form'>['action'];
  submitLabel?: string;
}

export function CompareDrawer({
  items,
  paramName = 'compare',
  action,
  submitLabel = 'Compare',
}: Props) {
  const [, setParam] = useQueryState(
    paramName,
    parseAsArrayOf(parseAsString).withOptions({ shallow: false, scroll: false }),
  );

  return (
    items.length > 0 && (
      <Drawer>
        <form
          action={action}
          className="mx-auto flex w-full max-w-7xl flex-col items-start justify-end gap-x-3 gap-y-4 @md:flex-row"
        >
          <div className="flex flex-1 flex-wrap justify-end gap-4">
            {items.map((item) => (
              <div className="relative" key={item.id}>
                <input key={item.id} name={paramName} type="hidden" value={item.id} />
                <Link
                  className="group relative flex max-w-56 items-center whitespace-nowrap rounded-xl border border-contrast-100 bg-background font-semibold ring-primary transition-all duration-150 hover:bg-contrast-100 focus:outline-0 focus:ring-2"
                  href={item.href}
                >
                  <div className="bg-primary-highlight/10 relative aspect-square w-12 shrink-0">
                    {item.image?.src != null ? (
                      <Image
                        alt={item.image.alt}
                        className="rounded-lg object-cover @4xl:rounded-r-none"
                        fill
                        src={item.image.src}
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
                  className="absolute -right-2.5 -top-2.5 flex h-7 w-7 items-center justify-center rounded-full border border-contrast-100 bg-background text-contrast-400 transition-colors duration-150 hover:border-contrast-200 hover:bg-contrast-100 hover:text-foreground"
                  onClick={() => {
                    void setParam((prev) => {
                      const next = prev?.filter((v) => v !== item.id) ?? [];

                      return next.length > 0 ? next : null;
                    });
                  }}
                  type="button"
                >
                  <X absoluteStrokeWidth size={16} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>

          <Button className="hidden @md:block" size="medium" type="submit" variant="primary">
            {submitLabel} <ArrowRight absoluteStrokeWidth size={20} strokeWidth={1} />
          </Button>

          <Button className="w-full @md:hidden" size="small" type="submit" variant="primary">
            {submitLabel} <ArrowRight absoluteStrokeWidth size={16} strokeWidth={1} />
          </Button>
        </form>
      </Drawer>
    )
  );
}
