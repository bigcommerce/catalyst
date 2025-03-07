'use client';

import * as Portal from '@radix-ui/react-portal';
import { ArrowRight, X } from 'lucide-react';
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';
import { ComponentProps, startTransition } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
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

interface CompareDrawerItem {
  id: string;
  image?: { src: string; alt: string };
  href: string;
  title: string;
}

export interface CompareDrawerProps {
  items: CompareDrawerItem[];
  paramName?: string;
  action?: ComponentProps<'form'>['action'];
  submitLabel?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --compare-drawer-background: hsl(var(--background));
 *   --compare-drawer-font-family: var(--font-family-body);
 *   --compare-drawer-card-focus: hsl(var(--primary));
 *   --compare-drawer-card-border: hsl(var(--contrast-100));
 *   --compare-drawer-card-background: hsl(var(--background));
 *   --compare-drawer-card-background-hover: hsl(var(--contrast-100));
 *   --compare-drawer-card-image-background: hsl(var(--contrast-100));
 *   --compare-drawer-empty-image-text: hsl(var(--primary-shadow));
 *   --compare-drawer-card-text: hsl(var(--foreground));
 *   --compare-drawer-dismiss-border: hsl(var(--contast-100));
 *   --compare-drawer-dismiss-border-hover: hsl(var(--contast-200));
 *   --compare-drawer-dismiss-background: hsl(var(--background));
 *   --compare-drawer-dismiss-background-hover: hsl(var(--contrast-100));
 *   --compare-drawer-dismiss-icon: hsl(var(--contrast-400));
 *   --compare-drawer-dismiss-icon-hover: hsl(var(--foreground));
 * }
 * ```
 */
export function CompareDrawer({
  items,
  paramName = 'compare',
  action,
  submitLabel = 'Compare',
}: CompareDrawerProps) {
  const [, setParam] = useQueryState(
    paramName,
    parseAsArrayOf(parseAsString).withOptions({ shallow: false, scroll: false }),
  );

  return (
    items.length > 0 && (
      <Portal.Root asChild>
        <div className="sticky bottom-0 z-10 w-full border-t bg-[var(--compare-drawer-background,hsl(var(--background)))] px-3 py-4 @container @md:py-5 @xl:px-6 @5xl:px-10">
          <form
            action={action}
            className="mx-auto flex w-full max-w-7xl flex-col items-start justify-end gap-x-3 gap-y-4 @md:flex-row"
          >
            <div className="flex flex-1 flex-wrap justify-end gap-4">
              {items.map((item) => (
                <div className="relative" key={item.id}>
                  <input key={item.id} name={paramName} type="hidden" value={item.id} />
                  <Link
                    className="group relative flex max-w-56 items-center overflow-hidden whitespace-nowrap rounded-xl border border-[var(--compare-drawer-link-border,hsl(var(--contrast-100)))] bg-[var(--compare-drawer-card-background,hsl(var(--background)))] font-semibold ring-[var(--compare-drawer-card-focus,hsl(var(--primary)))] transition-all duration-150 hover:bg-[var(--compare-drawer-card-background-hover,hsl(var(--contrast-100)))] focus:outline-none focus:ring-2"
                    href={item.href}
                  >
                    <div className="relative aspect-square w-12 shrink-0 bg-[var(--compare-drawer-card-image-background,hsl(var(--contrast-100)))]">
                      {item.image?.src != null ? (
                        <Image
                          alt={item.image.alt}
                          className="rounded-lg object-cover @4xl:rounded-r-none"
                          fill
                          sizes="3rem"
                          src={item.image.src}
                        />
                      ) : (
                        <span className="max-w-full break-all p-1 text-xs text-[var(--compare-drawer-empty-image-text,color-mix(in_oklab,hsl(var(--primary)),black_75%))] opacity-20">
                          {getInitials(item.title)}
                        </span>
                      )}
                    </div>
                    <span className="hidden truncate pl-3 pr-5 text-[var(--compare-drawer-card-text,hsl(var(--foreground)))] @4xl:block">
                      {item.title}
                    </span>
                  </Link>
                  <button
                    aria-label={`Remove ${item.title}`}
                    className="hover:text-[var(--compare-drawer-dismiss-icon-hover,hsl(var(--foreground))] absolute -right-2.5 -top-2.5 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--compare-drawer-dismiss-border,hsl(var(--contrast-100)))] bg-[var(--compare-drawer-dismiss-background,hsl(var(--background)))] text-[var(--compare-drawer-dismiss-icon,hsl(var(--contrast-400)))] transition-colors duration-150 hover:border-[var(--compare-drawer-dismiss-border-hover,hsl(var(--contrast-200)))] hover:bg-[var(--compare-drawer-dismiss-background-hover,hsl(var(--contrast-100)))]"
                    onClick={() => {
                      startTransition(async () => {
                        await setParam((prev) => {
                          const next = prev?.filter((v) => v !== item.id) ?? [];

                          return next.length > 0 ? next : null;
                        });
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
        </div>
      </Portal.Root>
    )
  );
}
