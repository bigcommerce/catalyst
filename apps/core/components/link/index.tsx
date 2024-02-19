'use client';

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { ComponentPropsWithRef, ElementRef, forwardRef, useReducer } from 'react';

import { cn } from '~/lib/utils';

type NextLinkProps = Omit<ComponentPropsWithRef<typeof NextLink>, 'prefetch'>;

interface PrefetchOptions {
  prefetch?: 'hover' | 'viewport' | 'none';
  prefetchKind?: 'auto' | 'full';
}

type Props = NextLinkProps & PrefetchOptions;

/**
 * This custom `Link` component extends Next.js's `Link` with additional prefetching controls, making
 * navigation prefetching more adaptable to different use cases. By offering `prefetch` and `prefetchKind`
 * props, it grants explicit management over when and how prefetching occurs, defaulting to 'hover' for
 * prefetch behavior and 'auto' for prefetch kind. This approach provides a balance between optimizing
 * page load performance and resource usage. https://nextjs.org/docs/app/api-reference/components/link#prefetch
 */
export const Link = forwardRef<ElementRef<'a'>, Props>(
  ({ href, prefetch = 'hover', prefetchKind = 'auto', children, className, ...rest }, ref) => {
    const router = useRouter();
    const [prefetched, setPrefetched] = useReducer(() => true, false);
    const computedPrefetch = computePrefetchProp({ prefetch, prefetchKind });

    const triggerPrefetch = () => {
      if (prefetched) {
        return;
      }

      // PrefetchKind enum is not exported
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      router.prefetch(href.toString(), { kind: prefetchKind });
      setPrefetched();
    };

    return (
      <NextLink
        className={cn(
          ' hover:text-blue-primary focus:outline-none focus:ring-4 focus:ring-blue-primary/20',
          className,
        )}
        href={href}
        onMouseEnter={prefetch === 'hover' ? triggerPrefetch : undefined}
        onTouchStart={prefetch === 'hover' ? triggerPrefetch : undefined}
        prefetch={computedPrefetch}
        ref={ref}
        {...rest}
      >
        {children}
      </NextLink>
    );
  },
);

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
