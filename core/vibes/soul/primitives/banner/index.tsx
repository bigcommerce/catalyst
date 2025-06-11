'use client';

import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { ForwardedRef, forwardRef, ReactNode, useCallback, useEffect, useState } from 'react';

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --banner-focus: hsl(var(--primary));
 *   --banner-background: hsl(var(--primary));
 *   --banner-text: hdl(var(--foreground));
 *   --banner-close-icon: hdl(var(--foreground));
 *   --banner-close-icon-hover: hdl(var(--foreground));
 *   --banner-close-background: hdl(var(--foreground));
 *   --banner-close-background-hover: hdl(var(--foreground));
 * }
 * ```
 */
export const Banner = forwardRef(
  (
    {
      id,
      children,
      hideDismiss = false,
      className,
      onDismiss,
    }: {
      id: string;
      children: ReactNode;
      hideDismiss?: boolean;
      className?: string;
      onDismiss?: () => void;
    },
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const [banner, setBanner] = useState({ dismissed: false, initialized: false });

    useEffect(() => {
      const hidden = localStorage.getItem(`${id}-hidden-banner`) === 'true';

      setBanner({ dismissed: hidden, initialized: true });
    }, [id]);

    const hideBanner = useCallback(() => {
      setBanner((prev) => ({ ...prev, dismissed: true }));
      localStorage.setItem(`${id}-hidden-banner`, 'true');
      onDismiss?.();
    }, [id, onDismiss]);

    if (!banner.initialized) return null;

    return (
      <div
        className={clsx(
          'relative w-full overflow-hidden bg-[var(--banner-background,hsl(var(--primary)))] transition-all duration-300 ease-in @container',
          banner.dismissed ? 'pointer-events-none max-h-0' : 'max-h-32',
          className,
        )}
        id="announcement-bar"
        ref={ref}
      >
        <div className="p-3 pr-12 text-sm text-[var(--banner-text,hsl(var(--foreground)))] @xl:px-12 @xl:text-center @xl:text-base">
          {children}
        </div>

        {!hideDismiss && (
          <button
            aria-label="Dismiss banner"
            className="absolute right-3 top-3 grid h-8 w-8 place-content-center rounded-full bg-[var(--banner-close-background,transparent)] text-[var(--banner-close-icon,hsl(var(--foreground)/50%))] transition-colors duration-300 hover:bg-[var(--banner-close-background-hover,hsl(var(--background)/40%))] hover:text-[var(--banner-close-icon-hover,hsl(var(--foreground)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--banner-focus,hsl(var(--foreground)))] @xl:top-1/2 @xl:-translate-y-1/2"
            onClick={(e) => {
              e.preventDefault();
              hideBanner();
            }}
          >
            <X absoluteStrokeWidth size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>
    );
  },
);

Banner.displayName = 'Banner';
