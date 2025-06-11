'use client';

import * as Portal from '@radix-ui/react-portal';
import { ArrowRight, X } from 'lucide-react';
import { useQueryState } from 'nuqs';
import {
  createContext,
  ReactNode,
  startTransition,
  useContext,
  useEffect,
  useOptimistic,
} from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { toast } from '@/vibes/soul/primitives/toaster';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import { compareParser } from './loader';

interface OptimisticAction {
  type: 'add' | 'remove';
  item: CompareDrawerItem;
}

interface CompareDrawerContext {
  optimisticItems: CompareDrawerItem[];
  setOptimisticItems: (action: OptimisticAction) => void;
  maxItems?: number;
}

export const CompareDrawerContext = createContext<CompareDrawerContext>({
  optimisticItems: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setOptimisticItems: () => {},
  maxItems: 0,
});

export function CompareDrawerProvider({
  children,
  items,
  maxItems,
  maxCompareLimitMessage = "You've reached the maximum number of products for comparison. Remove a product to add a new one.",
}: {
  children: ReactNode;
  items: CompareDrawerItem[];
  maxItems?: number;
  maxCompareLimitMessage?: string;
}) {
  useEffect(() => {
    if (maxItems !== undefined && items.length >= maxItems) {
      toast.warning(maxCompareLimitMessage);
    }
  }, [items.length, maxItems, maxCompareLimitMessage]);

  const [optimisticItems, setOptimisticItems] = useOptimistic(
    items,
    (state: CompareDrawerItem[], { type, item }: OptimisticAction) => {
      switch (type) {
        case 'add':
          return [...state, item].sort((a, b) => {
            const numA = Number(a.id);
            const numB = Number(b.id);

            if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
              return numA - numB;
            }

            if (!Number.isNaN(numA)) return -1;
            if (!Number.isNaN(numB)) return 1;

            return a.id < b.id ? -1 : 1;
          });

        case 'remove':
          return state.filter((i) => i.id !== item.id);

        default:
          return state;
      }
    },
  );

  return (
    <CompareDrawerContext value={{ optimisticItems, setOptimisticItems, maxItems }}>
      {children}
    </CompareDrawerContext>
  );
}

export function useCompareDrawer() {
  return useContext(CompareDrawerContext);
}

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
  href?: string;
  paramName?: string;
  submitLabel?: string;
  removeLabel?: string;
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
  href = '/compare',
  paramName = 'compare',
  submitLabel = 'Compare',
  removeLabel = 'Remove',
}: CompareDrawerProps) {
  const [params, setParam] = useQueryState(paramName, compareParser);

  const { optimisticItems, setOptimisticItems } = useCompareDrawer();

  return (
    optimisticItems.length > 0 && (
      <Portal.Root asChild>
        <div className="sticky bottom-0 z-10 w-full border-t border-[var(--compare-drawer-card-border,hsl(var(--contrast-100)))] bg-[var(--compare-drawer-background,hsl(var(--background)))] px-3 py-4 @container @md:py-5 @xl:px-6 @5xl:px-10">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-end gap-x-3 gap-y-4 @md:flex-row">
            <div className="flex flex-1 flex-wrap justify-end gap-4">
              {optimisticItems.map((item) => (
                <div className="relative" key={item.id}>
                  <Link
                    className="group relative flex max-w-56 items-center overflow-hidden whitespace-nowrap rounded-xl border border-[var(--compare-drawer-link-border,hsl(var(--contrast-100)))] bg-[var(--compare-drawer-card-background,hsl(var(--background)))] font-semibold ring-[var(--compare-drawer-card-focus,hsl(var(--primary)))] transition-all duration-150 hover:bg-[var(--compare-drawer-card-background-hover,hsl(var(--contrast-100)))] focus:outline-none focus:ring-2"
                    href={item.href}
                  >
                    <div className="aspect-h-1 aspect-w-1 relative w-12 shrink-0 bg-[var(--compare-drawer-card-image-background,hsl(var(--contrast-100)))]">
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
                    aria-label={`${removeLabel} ${item.title}`}
                    className="hover:text-[var(--compare-drawer-dismiss-icon-hover,hsl(var(--foreground))] absolute -right-2.5 -top-2.5 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--compare-drawer-dismiss-border,hsl(var(--contrast-100)))] bg-[var(--compare-drawer-dismiss-background,hsl(var(--background)))] text-[var(--compare-drawer-dismiss-icon,hsl(var(--contrast-400)))] transition-colors duration-150 hover:border-[var(--compare-drawer-dismiss-border-hover,hsl(var(--contrast-200)))] hover:bg-[var(--compare-drawer-dismiss-background-hover,hsl(var(--contrast-100)))]"
                    onClick={() => {
                      startTransition(async () => {
                        setOptimisticItems({ type: 'remove', item });

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
            <ButtonLink
              className="hidden @md:block"
              href={`${href}?ids=${params?.toString()}`}
              size="medium"
              variant="primary"
            >
              <span className="inline-flex items-center gap-1">
                {submitLabel} <ArrowRight absoluteStrokeWidth size={20} strokeWidth={1} />
              </span>
            </ButtonLink>
            <ButtonLink className="w-full @md:hidden" href={href} size="small" variant="primary">
              <span className="inline-flex items-center gap-1">
                {submitLabel} <ArrowRight absoluteStrokeWidth size={16} strokeWidth={1} />
              </span>
            </ButtonLink>
          </div>
        </div>
      </Portal.Root>
    )
  );
}
