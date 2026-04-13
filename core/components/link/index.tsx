'use client';

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import NextLink from 'next/link';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useRouter } from 'next/navigation';
import { ComponentPropsWithRef, ComponentRef, forwardRef, Suspense, useReducer } from 'react';

import { Link as NavLink } from '../../i18n/navigation';

type NextLinkProps = Omit<ComponentPropsWithRef<typeof NavLink>, 'prefetch'>;

interface PrefetchOptions {
  prefetch?: 'hover' | 'viewport' | 'none';
  prefetchKind?: 'auto' | 'full';
}

type Props = NextLinkProps & PrefetchOptions;

const InnerLink = forwardRef<ComponentRef<'a'>, Props>(
  ({ href, prefetch = 'hover', prefetchKind = 'auto', children, className, ...rest }, ref) => {
    const router = useRouter();
    const [prefetched, setPrefetched] = useReducer(() => true, false);
    const computedPrefetch = computePrefetchProp({ prefetch, prefetchKind });

    const triggerPrefetch = () => {
      if (prefetched) {
        return;
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
        onMouseEnter={prefetch === 'hover' ? triggerPrefetch : undefined}
        onTouchStart={prefetch === 'hover' ? triggerPrefetch : undefined}
        prefetch={computedPrefetch}
        ref={ref}
        {...rest}
      >
        {children}
      </NavLink>
    );
  },
);

InnerLink.displayName = 'InnerLink';

/**
 * This custom `Link` wraps Next-Intl's `Link` component in a Suspense boundary
 * to support PPR (Partial Prerendering) with cacheComponents. During prerender,
 * next-intl's Link accesses locale context which is dynamic. The Suspense boundary
 * provides a static fallback using next/link directly.
 */
export const Link = forwardRef<ComponentRef<'a'>, Props>(({ children, ...props }, ref) => {
  const hrefString = typeof props.href === 'string' ? props.href : (props.href.href ?? '#');

  return (
    <Suspense
      fallback={
        <NextLink className={props.className} href={hrefString} ref={ref}>
          {children}
        </NextLink>
      }
    >
      <InnerLink ref={ref} {...props}>
        {children}
      </InnerLink>
    </Suspense>
  );
});

Link.displayName = 'Link';

function computePrefetchProp({
  prefetch,
  prefetchKind,
}: Required<PrefetchOptions>): boolean | undefined {
  if (prefetch !== 'viewport') {
    return false;
  }

  if (prefetchKind === 'auto') {
    return undefined;
  }

  return true;
}
