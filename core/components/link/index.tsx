'use client';

import { useSession } from 'next-auth/react';
import { ComponentPropsWithRef, ComponentRef, forwardRef, useReducer } from 'react';

import { Link as NavLink, useRouter } from '../../i18n/routing';

type NextLinkProps = Omit<ComponentPropsWithRef<typeof NavLink>, 'prefetch'>;

interface PrefetchOptions {
  prefetch?: 'hover' | 'viewport' | 'guest' | 'none';
  prefetchKind?: 'auto' | 'full';
}

type Props = NextLinkProps & PrefetchOptions;

/**
 * Enhanced Link component with smart prefetching strategies.
 *
 * ## When to use each strategy:
 *
 * **TL;DR: Use `prefetch="guest"` for frequently-visited links with cached data (categories, navigation).
 * Use defaults for everything else. Only use `prefetchKind="full"` for high-intent scenarios (cart after add-to-cart).**
 *
 * - **`prefetch="guest"`**: Often-visited links for guests (nav, categories). Great performance/resource balance.
 * - **Default (`hover`)**: Most links. Conservative, only prefetches on interaction.
 * - **`prefetch="viewport"`**: Aggressive viewport prefetching for all users. Use sparingly.
 * - **`prefetchKind="full"`**: High-intent scenarios (cart link, checkout flow). Prefetches everything immediately.
 *
 * ## PPR (Partial Prerendering) behavior:
 * With PPR enabled, default viewport prefetching (`prefetchKind="auto"`) only fetches the static shell,
 * not dynamic data. Use `prefetchKind="full"` to prefetch both static shell and dynamic data when needed.
 *
 * ## Technical details:
 * - 'hover': Manual prefetching on mouse/touch (Next.js prefetch=false)
 * - 'viewport': Viewport-based for all users (Next.js prefetch=undefined/true)
 * - 'guest': Immediate prefetch for guests only (Next.js prefetch=true)
 * - 'none': No prefetching (Next.js prefetch=false)
 *
 * prefetchKind: 'auto' (static shell only with PPR) vs 'full' (static + dynamic data)
 */
export const Link = forwardRef<ComponentRef<'a'>, Props>(
  ({ href, prefetch = 'hover', prefetchKind = 'auto', children, className, ...rest }, ref) => {
    const router = useRouter();
    const { status } = useSession();
    const [prefetched, setPrefetched] = useReducer(() => true, false);

    // For guest mode, only prefetch if user is not authenticated
    const shouldPrefetch = prefetch === 'guest' ? status !== 'authenticated' : true;
    const effectivePrefetch = shouldPrefetch ? prefetch : 'none';

    const computedPrefetch = computePrefetchProp({
      prefetch: effectivePrefetch,
      prefetchKind,
    });

    // Debug logging for prefetch decisions
    const linkUrl = typeof href === 'string' ? href : href.href;

    if (prefetch === 'guest' && process.env.NEXT_PUBLIC_LINK_PREFETCH_LOGGER === 'true') {
      // eslint-disable-next-line no-console
      console.log(
        `[Link Setup] ${linkUrl} - prefetch=${prefetch} → effective=${effectivePrefetch}, shouldPrefetch=${shouldPrefetch}, authenticated=${status === 'authenticated'}, computedPrefetch=${computedPrefetch}`,
      );
    }

    const triggerPrefetch = () => {
      if (prefetched || !shouldPrefetch) {
        if (!shouldPrefetch && process.env.NEXT_PUBLIC_LINK_PREFETCH_LOGGER === 'true') {
          const skipUrl = typeof href === 'string' ? href : href.href;

          // eslint-disable-next-line no-console
          console.log(
            `[Link Prefetch] Skipped prefetch for ${skipUrl} - prefetch=${prefetch}, authenticated=${status === 'authenticated'}`,
          );
        }

        return;
      }

      const prefetchUrl = typeof href === 'string' ? href : href.href;

      if (process.env.NEXT_PUBLIC_LINK_PREFETCH_LOGGER === 'true') {
        // eslint-disable-next-line no-console
        console.log(
          `[Link Prefetch] Prefetching ${prefetchUrl} with mode=${effectivePrefetch}, kind=${prefetchKind}, authenticated=${status === 'authenticated'}`,
        );
      }

      if (typeof href === 'string') {
        // PrefetchKind enum is not exported
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        router.prefetch(href, { kind: prefetchKind });
      } else {
        // PrefetchKind enum is not exported
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        router.prefetch(href.href, { kind: prefetchKind });
      }

      setPrefetched();
    };

    return (
      <NavLink
        className={className}
        href={href}
        onMouseEnter={effectivePrefetch === 'hover' ? triggerPrefetch : undefined}
        onTouchStart={effectivePrefetch === 'hover' ? triggerPrefetch : undefined}
        prefetch={computedPrefetch}
        ref={ref}
        {...rest}
      >
        {children}
      </NavLink>
    );
  },
);

function computePrefetchProp({
  prefetch,
  prefetchKind,
}: Required<PrefetchOptions>): boolean | undefined {
  // 'hover' and 'none' modes should disable Next.js prefetching
  if (prefetch !== 'viewport' && prefetch !== 'guest') {
    return false;
  }

  // For 'guest' mode, always return true to force immediate prefetching
  if (prefetch === 'guest') {
    return true;
  }

  // For 'viewport' mode, map prefetchKind to Next.js behavior:
  // - 'auto' → undefined (viewport-based prefetch of static shell only with PPR)
  // - 'full' → true (viewport-based prefetch of static shell + dynamic data)
  if (prefetchKind === 'auto') {
    return undefined; // Next.js default viewport behavior (static shell only with PPR)
  }

  return true; // Force prefetch for 'full' kind (static + dynamic with PPR)
}
