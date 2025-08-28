'use client';

import { ForesightManager } from 'js.foresight';
import {
  ComponentPropsWithRef,
  ComponentRef,
  forwardRef,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react';

import { Link as NavLink, useRouter } from '../../i18n/routing';

type NextLinkProps = Omit<ComponentPropsWithRef<typeof NavLink>, 'prefetch'>;

interface PrefetchOptions {
  prefetch?: 'hover' | 'viewport' | 'none' | 'foresight';
  prefetchKind?: 'auto' | 'full';
  enableForesight?: boolean;
}

type Props = NextLinkProps & PrefetchOptions;

/**
 * This custom `Link` is based on  Next-Intl's `Link` component
 * https://next-intl-docs.vercel.app/docs/routing/navigation#link
 * which adds automatically prefixes for the href with the current locale as necessary
 * and extends with additional prefetching controls, making navigation
 * prefetching more adaptable to different use cases. By offering `prefetch` and `prefetchKind`
 * props, it grants explicit management over when and how prefetching occurs, defaulting to 'hover' for
 * prefetch behavior and 'auto' for prefetch kind. This approach provides a balance between optimizing
 * page load performance and resource usage. https://nextjs.org/docs/app/api-reference/components/link#prefetch
 *
 * Now includes ForesightJS integration for predictive prefetching based on mouse movement patterns.
 */
export const Link = forwardRef<ComponentRef<'a'>, Props>(
  (
    {
      href,
      prefetch = 'hover',
      prefetchKind = 'auto',
      enableForesight = true,
      children,
      className,
      ...rest
    },
    forwardedRef,
  ) => {
    const router = useRouter();
    const [prefetched, setPrefetched] = useReducer(() => true, false);
    const linkRef = useRef<HTMLAnchorElement>(null);
    const computedPrefetch = computePrefetchProp({ prefetch, prefetchKind });

    // Determine if we should use ForesightJS
    const shouldUseForesight =
      enableForesight && (prefetch === 'foresight' || prefetch === 'hover');

    const triggerPrefetch = useCallback(() => {
      if (prefetched) {
        return;
      }

      const hrefString = typeof href === 'string' ? href : href.href;

      // PrefetchKind enum is not exported
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      router.prefetch(hrefString, { kind: prefetchKind });
      setPrefetched();
    }, [prefetched, href, router, prefetchKind, setPrefetched]);

    // Use ForesightJS when enabled
    useEffect(() => {
      if (!shouldUseForesight || !linkRef.current) {
        return;
      }

      // Initialize ForesightManager if not already done
      if (!ForesightManager.isInitiated) {
        ForesightManager.initialize({
          // Use default configuration with mobile prefetching on touch start
          touchDeviceStrategy: 'onTouchStart',
        });
      }

      const hrefString = typeof href === 'string' ? href : href.href;
      const element = linkRef.current;

      ForesightManager.instance.register({
        element,
        callback: triggerPrefetch,
        name: `link-${hrefString}`,
      });

      return () => {
        ForesightManager.instance.unregister(element);
      };
    }, [shouldUseForesight, triggerPrefetch, href]);

    // Merge refs
    useEffect(() => {
      if (forwardedRef) {
        if (typeof forwardedRef === 'function') {
          forwardedRef(linkRef.current);
        } else {
          forwardedRef.current = linkRef.current;
        }
      }
    }, [forwardedRef]);

    return (
      <NavLink
        className={className}
        href={href}
        onMouseEnter={!shouldUseForesight && prefetch === 'hover' ? triggerPrefetch : undefined}
        onTouchStart={!shouldUseForesight && prefetch === 'hover' ? triggerPrefetch : undefined}
        prefetch={computedPrefetch}
        ref={linkRef}
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
}: Pick<PrefetchOptions, 'prefetch' | 'prefetchKind'> & {
  prefetch: NonNullable<PrefetchOptions['prefetch']>;
  prefetchKind: NonNullable<PrefetchOptions['prefetchKind']>;
}): boolean | undefined {
  if (prefetch === 'viewport') {
    if (prefetchKind === 'auto') {
      return undefined;
    }

    return true;
  }

  // For foresight and hover modes, we handle prefetching manually
  if (prefetch === 'foresight' || prefetch === 'hover') {
    return false;
  }

  // For 'none' and other cases
  return false;
}
